// tests/unit/localFirst/docPersistence.test.ts
//
// QNBS-v3: B1.1 — proves the y-indexeddb persistence layer round-trips a Y.Doc across reloads
// (fake-indexeddb in the test env). This is the offline-store half of the shadow binding.

import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import {
  dbNameForProject,
  isIndexedDbAvailable,
  persistProjectDoc,
} from '../../../services/localFirst/docPersistence';

// y-indexeddb flushes update events to IndexedDB asynchronously; give it a beat before reload.
const flush = () => new Promise((resolve) => setTimeout(resolve, 100));

describe('B1.1 — docPersistence (y-indexeddb)', () => {
  it('dbNameForProject namespaces by project id', () => {
    expect(dbNameForProject('abc')).toBe('storycraft-localfirst-abc');
    expect(dbNameForProject('abc')).not.toBe(dbNameForProject('xyz'));
  });

  it('reports IndexedDB availability and an active provider in the test env', async () => {
    expect(isIndexedDbAvailable()).toBe(true);
    const doc = new Y.Doc();
    const persistence = persistProjectDoc('availability', doc);
    expect(persistence.active).toBe(true);
    await persistence.whenSynced; // resolves without throwing
    await persistence.clearData();
    await persistence.destroy();
  });

  it('persists doc updates and reloads them into a fresh doc', async () => {
    const projectId = 'roundtrip';
    const docA = new Y.Doc();
    const pA = persistProjectDoc(projectId, docA);
    await pA.whenSynced;
    docA.getText('greeting').insert(0, 'hello world');
    await flush();
    await pA.destroy();

    const docB = new Y.Doc();
    const pB = persistProjectDoc(projectId, docB);
    await pB.whenSynced;
    expect(docB.getText('greeting').toString()).toBe('hello world');
    await pB.clearData();
    await pB.destroy();
  });

  it('clearData wipes persisted state', async () => {
    const projectId = 'wipe';
    const docA = new Y.Doc();
    const pA = persistProjectDoc(projectId, docA);
    await pA.whenSynced;
    docA.getText('greeting').insert(0, 'temporary');
    await flush();
    await pA.clearData();
    await pA.destroy();

    const docB = new Y.Doc();
    const pB = persistProjectDoc(projectId, docB);
    await pB.whenSynced;
    expect(docB.getText('greeting').toString()).toBe('');
    await pB.destroy();
  });
});
