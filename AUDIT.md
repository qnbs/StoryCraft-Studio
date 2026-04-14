# StoryCraft Studio — Codebase Audit Report

**Date:** 2026-04-14
**Scope:** Full application, repository configuration, DevContainer, CI/CD, documentation
**Version audited:** 1.0.0 (package.json)

---

## Executive Summary

StoryCraft Studio is a well-architected React 19 + Redux Toolkit PWA with strong TypeScript enforcement, excellent i18n, and sophisticated offline-first data management. The codebase demonstrates mature React patterns and thoughtful accessibility support. Main improvement areas are **test coverage**, **AI request lifecycle management**, and **desktop (Tauri) security hardening**.

### Scorecard

| Aspect           | Rating | Notes                                                     |
| ---------------- | ------ | --------------------------------------------------------- |
| Type Safety      | ★★★★★  | Strict mode, exactOptionalPropertyTypes                   |
| Architecture     | ★★★★☆  | Clean feature-sliced design, clear patterns               |
| Accessibility    | ★★★★☆  | Strong ARIA, focus management, color-blind modes          |
| i18n             | ★★★★★  | Modular, 5 languages, persistent selection                |
| PWA / Offline    | ★★★★★  | Workbox, versioned caches, smart strategies               |
| State Management | ★★★★☆  | Redux-Undo well integrated, auto-save robust              |
| Security         | ★★★☆☆  | Good local-first design; Tauri CSP and key mgmt need work |
| Test Coverage    | ★★☆☆☆  | Only 4 unit tests for 40+ components                      |
| Documentation    | ★★★★☆  | README excellent, CONTRIBUTING comprehensive              |
| Performance      | ★★★☆☆  | Good code-splitting; logger overhead, no budgets          |
| CI/CD            | ★★★★☆  | Full pipeline; lint/typecheck in soft-fail mode           |

---

## Critical Findings (🔴)

### 1. ~~Hardcoded Language in AI Hooks~~ ✅ FIXED

**Files:** `hooks/useConsistencyCheckerView.ts`, `hooks/useCriticView.ts`
**Issue:** Both hooks passed hardcoded `'en'` to AI service functions instead of reading from user settings.
**Impact:** Non-English users received AI prompts and responses in the wrong language.
**Resolution:** Fixed — now reads `language` from `useTranslation()` and `aiCreativity` from Redux settings selector.

### 2. Tauri CSP is `null` — No Content Security Policy

**File:** `src-tauri/tauri.conf.json`
**Issue:** `"security": { "csp": null }` — the desktop app has no Content Security Policy.
**Impact:** XSS vulnerabilities in the desktop app would have no CSP mitigation.
**Recommendation:** Set a restrictive CSP:

```json
"csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://generativelanguage.googleapis.com; img-src 'self' data: blob:"
```

**Effort:** Low (config change) | **Priority:** High for desktop distribution

### 3. No Request Cancellation for AI Thunks

**Files:** `features/project/projectSlice.ts`, `hooks/useWriterView.ts`
**Issue:** AI generation thunks do not accept or use `AbortController` / `AbortSignal`. If a user navigates away mid-generation, the request continues consuming resources and the response is discarded.
**Impact:** Wasted API quota, potential memory leaks, stale state updates.
**Recommendation:** Pass `AbortSignal` from thunks via `thunkAPI.signal`, propagate to `geminiService` fetch calls. Clean up in component unmount.
**Effort:** Medium | **Priority:** High

### 4. Auto-Save Memory Exhaustion Risk

**File:** `app/listenerMiddleware.ts`
**Issue:** Code contains a `CRITICAL FIX` comment explaining that saving the full redux-undo state (with `past`/`future` arrays) caused browser crashes. The current fix strips history before saving, but there's no validation that the reconstruction on load produces a valid state.
**Impact:** Corrupted state on load could crash the app silently.
**Recommendation:** Add a validation step after reconstructing the undo envelope on load. If validation fails, fall back to a fresh state with the loaded data as `present`.
**Effort:** Low | **Priority:** High

---

## High Priority Findings (🟡)

### 5. Minimal Test Coverage

**Current:** 4 unit test files (`Button.test.tsx`, `Modal.test.tsx`, `epubApiService.test.ts`, `useTTS.test.tsx`), 2 E2E files.
**Gap:** ~40 components, 19 hooks, 8 services, 5 Redux slices, and 16 contexts have zero test coverage.
**Recommendation:** Priority testing targets:

1. `dbService.ts` — Data persistence layer (most critical)
2. `geminiService.ts` — AI retry/error handling logic
3. `listenerMiddleware.ts` — Auto-save correctness
4. `projectSlice.ts` — Redux state transitions
5. UI components with complex logic (`ManuscriptView`, `WriterView`)

**Effort:** High (ongoing) | **Priority:** High

### 6. `any` Type Casts in Multiple Hooks

**Files:** `hooks/useSceneBoardView.ts` (line ~12), `hooks/useSettingsView.ts` (line ~13, ~46), `app/hooks.ts` (line ~14)
**Issue:** `as any` and `as RootState` casts bypass strict TypeScript checking.
**Impact:** Type errors at these boundaries are invisible to the compiler.
**Recommendation:** Replace with proper generic types or create type-safe selector wrappers.
**Effort:** Medium | **Priority:** Medium-High

### 7. Logger Middleware Performance in Dev

**File:** `app/store.ts`
**Issue:** Logger middleware logs every Redux action in development mode. With rapid manuscript edits, this can cause significant console output and dev tools slowdown.
**Recommendation:** Make logger opt-in via a `localStorage` flag (e.g., `localStorage.setItem('debug:redux', 'true')`).
**Effort:** Low | **Priority:** Medium

### 8. No Per-View Error Boundaries

**File:** `App.tsx`
**Issue:** Only one app-level `ErrorBoundary` exists. If a single lazy-loaded view crashes, the entire app shows the error screen.
**Recommendation:** Wrap each `<Suspense>` boundary with its own `<ErrorBoundary>` that shows a view-specific recovery message while keeping the sidebar and navigation functional.
**Effort:** Low | **Priority:** Medium

### 9. P2P Collaboration Without Encryption

**File:** `services/collaborationService.ts`
**Issue:** WebRTC connections via y-webrtc use the default signaling server without end-to-end encryption of document content.
**Impact:** Third parties with access to the signaling server could potentially intercept manuscript content.
**Recommendation:** Implement a shared secret or pre-shared key for Yjs document encryption.
**Effort:** Medium | **Priority:** Medium (only when collaboration is actively used)

### 10. Device-Scoped Encryption Key

**File:** `services/dbService.ts`
**Issue:** API key encryption derives its key from `location.origin + userAgent + deviceId`. If the user clears site data, the device ID is regenerated and the encrypted key becomes unrecoverable.
**Impact:** Users silently lose their API key and must re-enter it.
**Recommendation:** Show an explicit warning when decryption fails with a prompt to re-enter the key, rather than failing silently.
**Effort:** Low | **Priority:** Medium

---

## Medium Priority Findings (🟠)

### 11. No DevContainer Configuration

**Status:** The repository runs in GitHub Codespaces without a `.devcontainer/` folder.
**Impact:** New contributors must manually set up their environment.
**Recommendation:** Create `.devcontainer/devcontainer.json` with:

- Node.js LTS image
- `npm install` as `postCreateCommand`
- Recommended extensions: ESLint, Prettier, Tailwind CSS IntelliSense
- Port forwarding: 3000 (dev), 6006 (Storybook)

**Effort:** Low | **Priority:** Medium

### 12. Redundant `deploy.yml` Workflow

**Files:** `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`
**Issue:** `ci.yml` already handles the full pipeline including deployment. `deploy.yml` appears to be a legacy workflow.
**Recommendation:** Verify `deploy.yml` is not referenced elsewhere, then remove it.
**Effort:** Low | **Priority:** Low

### 13. Version Mismatch: Tauri vs npm

**Files:** `src-tauri/tauri.conf.json` (version `0.1.0`), `package.json` (version `1.0.0`)
**Impact:** Confusing version reporting in the desktop app.
**Recommendation:** Align both to the same version, or automate version sync in CI.
**Effort:** Low | **Priority:** Low

### 14. Deprecated `backend/epubExport.js` Still Present

**File:** `backend/epubExport.js`
**Issue:** Marked as deprecated in the code comments. EPUB export is now fully client-side in `services/epubApiService.ts`.
**Recommendation:** Remove in the next major release or move to an `archive/` folder.
**Effort:** Low | **Priority:** Low

### 15. No Performance Budgets

**Issue:** No build size limits, no Web Vitals targets, no Lighthouse CI integration.
**Recommendation:** Add `bundlesize` limits in CI and track Core Web Vitals (LCP, FID, CLS) via Lighthouse CI or `web-vitals` library.
**Effort:** Medium | **Priority:** Medium

### 16. Potential Memory Leaks in ManuscriptView Resize

**File:** `components/ManuscriptView.tsx` (line ~67-79)
**Issue:** Resize event listeners are added in `useCallback` but cleanup depends on `stopResizing` being called. If the component unmounts during a resize, listeners may not be removed.
**Recommendation:** Move listeners to `useEffect` with proper cleanup functions.
**Effort:** Low | **Priority:** Medium

---

## Low Priority Findings (🟢)

### 17. No Feature Flags

No mechanism to selectively enable/disable features for rollout or testing.
**Recommendation:** Consider a simple `localStorage`-based feature flag system for experimental features.

### 18. Console Logging Instead of Logging Framework

Multiple `console.log`, `console.warn`, and `console.error` calls throughout the codebase.
**Recommendation:** Create a minimal logging utility that can be configured per-environment and optionally integrated with error tracking (e.g., Sentry).

### 19. Storybook Has Only 3 Stories

**Directory:** `stories/`
**Current:** Button, Card, Input stories.
**Recommendation:** Add stories for Modal, Toast, Spinner, Drawer, and PWAComponents to improve component documentation and visual testing.

### 20. No Request Deduplication for AI Calls

**Issue:** Identical AI requests can be sent simultaneously (e.g., double-clicking a generation button).
**Recommendation:** Implement request deduplication in `geminiService.ts` using a pending-request map keyed by a hash of the prompt parameters.

---

## Environment & Configuration Findings

### CI/CD Pipeline

- ✅ Full pipeline: lint → typecheck → test → build → deploy
- ⚠️ ESLint and typecheck run with `continue-on-error: true` (informational, not blocking)
- **Recommendation:** Once the existing warnings are resolved, switch to hard-fail mode

### Git Configuration

- ✅ `.gitignore` properly configured (fixed: now includes `src-tauri/target/`)
- ✅ Husky pre-commit hooks with lint-staged (Prettier + ESLint)
- ✅ Conventional Commits recommended in CONTRIBUTING.md

### Prettier Configuration

- ✅ `.prettierrc.json` is authoritative (fixed: removed empty duplicate `.prettierrc`)
- Config: `semi: true`, `singleQuote: true`, `trailingComma: "es5"`, `printWidth: 100`, `tabWidth: 2`

### Package.json

- ✅ `"type": "module"` for ES modules
- ✅ `"private": true` prevents accidental npm publishing
- ⚠️ `--legacy-peer-deps` required in CI — indicates dependency resolution conflicts

---

## Recommended Next Steps (Prioritized)

| #   | Action                                        | Effort | Impact | Priority       |
| --- | --------------------------------------------- | ------ | ------ | -------------- |
| 1   | Add Tauri CSP                                 | Low    | High   | 🔴 Do first    |
| 2   | Add AbortController to AI thunks              | Medium | High   | 🔴 Do first    |
| 3   | Validate undo-envelope reconstruction on load | Low    | High   | 🔴 Do first    |
| 4   | Add per-view error boundaries                 | Low    | Medium | 🟡 Next sprint |
| 5   | Make Redux logger opt-in                      | Low    | Medium | 🟡 Next sprint |
| 6   | Fix `any` type casts                          | Medium | Medium | 🟡 Next sprint |
| 7   | Increase unit test coverage to 60%+           | High   | High   | 🟡 Ongoing     |
| 8   | Add DevContainer configuration                | Low    | Medium | 🟠 Backlog     |
| 9   | Fix ManuscriptView resize memory leak         | Low    | Medium | 🟠 Backlog     |
| 10  | Add performance budgets                       | Medium | Medium | 🟠 Backlog     |
| 11  | Encrypt P2P collaboration                     | Medium | Medium | 🟠 Backlog     |
| 12  | Align Tauri/npm versions                      | Low    | Low    | 🟢 Backlog     |
| 13  | Remove deprecated epubExport.js               | Low    | Low    | 🟢 Backlog     |
| 14  | Add logging framework                         | Medium | Low    | 🟢 Backlog     |

---

## Files Changed in This Audit

| File                                 | Change                                                             |
| ------------------------------------ | ------------------------------------------------------------------ |
| `hooks/useConsistencyCheckerView.ts` | Fixed hardcoded `'en'` → dynamic language from settings            |
| `hooks/useCriticView.ts`             | Fixed hardcoded `'en'` → dynamic language from settings            |
| `.gitignore`                         | Added `src-tauri/target/`                                          |
| `.prettierrc`                        | Removed (empty duplicate; `.prettierrc.json` is authoritative)     |
| `README.md`                          | Fixed 50+ Markdown lint errors (MD022, MD031, MD032, MD040, MD060) |
| `CHANGELOG.md`                       | Created — Keep a Changelog format                                  |
| `.github/copilot-instructions.md`    | Created — Project coding guidelines for Copilot                    |
| `AUDIT.md`                           | Created — This document                                            |
