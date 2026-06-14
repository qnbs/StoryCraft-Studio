#!/usr/bin/env node
/**
 * Keeps README.md metrics (test-file count, i18n key count, test-case count) in sync
 * with the source of truth so they cannot silently drift.
 *
 *  - test-file count  → recursive count of *.test.ts / *.test.tsx / *.spec.ts (excl. node_modules)
 *  - i18n key count   → leaf-count over locales/en/*.json (EN is the canonical key set)
 *  - test-case count  → numTotalTests from test-results.json when present (CI / after a JSON run);
 *                       otherwise the value currently in README is preserved (idempotent locally).
 *
 * Run via predev/prebuild — idempotent if already aligned (a second run produces no diff).
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// QNBS-v3: generic digit token — tolerates thin-space / nbsp / narrow-nbsp / comma separators
// (README prose uses "2 594", "5 475") so the regex matches both old and freshly-written forms.
const NUM = '[\\d\\u00A0\\u202F\\u2009\\u2007 ,]+';

/** Recursively count files matching a predicate, skipping node_modules / .git / dist. */
function countFiles(dir, predicate) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) count += countFiles(full, predicate);
    else if (entry.isFile() && predicate(entry.name)) count += 1;
  }
  return count;
}

/** Count leaf values in a nested JSON object. */
function countLeaves(obj) {
  return Object.values(obj).reduce(
    (acc, v) => acc + (v && typeof v === 'object' ? countLeaves(v) : 1),
    0,
  );
}

function getTestFileCount() {
  return countFiles(
    root,
    (name) => name.endsWith('.test.ts') || name.endsWith('.test.tsx') || name.endsWith('.spec.ts'),
  );
}

function getKeyCount() {
  const localeDir = join(root, 'locales', 'en');
  let total = 0;
  for (const file of readdirSync(localeDir)) {
    if (!file.endsWith('.json')) continue;
    total += countLeaves(JSON.parse(readFileSync(join(localeDir, file), 'utf8')));
  }
  return total;
}

/** numTotalTests from test-results.json, else the current README badge value (preserve). */
function getTestCaseCount(readme) {
  const resultsPath = join(root, 'test-results.json');
  if (existsSync(resultsPath) && statSync(resultsPath).isFile()) {
    try {
      const results = JSON.parse(readFileSync(resultsPath, 'utf8'));
      if (typeof results.numTotalTests === 'number' && results.numTotalTests > 0) {
        return results.numTotalTests;
      }
    } catch {
      // fall through to README value
    }
  }
  const m = readme.match(/Tests-(\d+)%2B_%2F_\d+_files/);
  return m ? Number(m[1]) : null;
}

const readmePath = join(root, 'README.md');
let readme = readFileSync(readmePath, 'utf8');
const original = readme;

const fileCount = getTestFileCount();
const keyCount = getKeyCount();
const testCount = getTestCaseCount(readme);

// --- Badges (shields.io URL + alt text) -------------------------------------
readme = readme.replace(/i18n-11_locales-\d+_keys/g, `i18n-11_locales-${keyCount}_keys`);
readme = readme.replace(/(11 locales — )\d+( keys)/g, `$1${keyCount}$2`);
if (testCount != null) {
  readme = readme.replace(
    /Tests-\d+%2B_%2F_\d+_files/g,
    `Tests-${testCount}%2B_%2F_${fileCount}_files`,
  );
  readme = readme.replace(
    /(alt=")\d+\+ tests \/ \d+ files(")/g,
    `$1${testCount}+ tests / ${fileCount} files$2`,
  );
}

// --- Prose occurrences ------------------------------------------------------
// Line ~352: "Shipped UI locales with **2 594 i18n keys**"
readme = readme.replace(
  new RegExp(`(Shipped UI locales with \\*\\*)${NUM}( i18n keys\\*\\*)`),
  `$1${keyCount}$2`,
);
// Line ~453: "| 2 594 keys × 11 locales" — keep the table-cell leading space.
readme = readme.replace(new RegExp(`(\\| )${NUM}(keys × 11 locales)`), `$1${keyCount} $2`);
if (testCount != null) {
  // Line ~454: "Vitest 4.x (5 475+ tests / 449 files)"
  readme = readme.replace(
    new RegExp(`(Vitest 4\\.x \\()${NUM}\\+ tests / ${NUM}files\\)`),
    `$1${testCount}+ tests / ${fileCount} files)`,
  );
  // Line ~491: "Vitest unit tests (5 475+ tests, 449 files)"
  readme = readme.replace(
    new RegExp(`(Vitest unit tests \\()${NUM}\\+ tests, ${NUM}files\\)`),
    `$1${testCount}+ tests, ${fileCount} files)`,
  );
  // Line ~650: "**5 475+ unit tests** across **449 test files**"
  readme = readme.replace(
    new RegExp(`\\*\\*${NUM}\\+ unit tests\\*\\* across \\*\\*${NUM}test files\\*\\*`),
    `**${testCount}+ unit tests** across **${fileCount} test files**`,
  );
}

if (readme !== original) {
  writeFileSync(readmePath, readme);
  process.stdout.write(
    `[sync-readme-metrics] README.md → ${fileCount} test files, ${keyCount} i18n keys` +
      (testCount != null ? `, ${testCount}+ tests\n` : ` (test-case count unchanged)\n`),
  );
} else {
  process.stdout.write('[sync-readme-metrics] README.md already in sync — no changes.\n');
}
