/**
 * ProForge MCP server smoke test.
 * QNBS-v3: Spawns the server over stdio and exercises initialize → tools/list → two no-AI tools
 * (apply_edits, rag_query). Validates the MCP round-trip without needing an API key.
 * Run from this folder: `npm run smoke` (ensures tsx is on PATH).
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`SMOKE FAIL: ${msg}`);
}

async function main(): Promise<void> {
  const transport = new StdioClientTransport({ command: 'tsx', args: ['src/index.ts'] });
  const client = new Client({ name: 'proforge-smoke', version: '1.0.0' });
  await client.connect(transport);

  // 1) tools/list
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();
  console.error('tools:', names.join(', '));
  for (const expected of [
    'proforge_apply_edits',
    'proforge_get_history',
    'proforge_get_supervisor_status',
    'proforge_rag_query',
    'proforge_run_stage',
  ]) {
    assert(names.includes(expected), `missing tool ${expected}`);
  }

  // 2) apply_edits (pure, no AI key)
  const apply = await client.callTool({
    name: 'proforge_apply_edits',
    arguments: {
      manuscript: [{ id: 's1', content: 'the quick brown fox' }],
      items: [{ id: 'e1', sectionId: 's1', original: 'quick', proposed: 'slow' }],
    },
  });
  const applyContent = (apply.content as Array<{ type: string; text: string }>)[0];
  assert(applyContent?.text.includes('the slow brown fox'), 'apply_edits did not apply edit');
  console.error('apply_edits OK');

  // 3) rag_query (lexical, inline project payload + memory entries)
  const rag = await client.callTool({
    name: 'proforge_rag_query',
    arguments: {
      project: {
        projectId: 'p1',
        title: 'Demo',
        memoryEntries: [
          { category: 'lore', key: 'dragon', content: 'The dragon Vex guards the northern pass.' },
          { category: 'style', key: 'tone', content: 'Wry, fast-paced.' },
        ],
      },
      query: 'dragon',
      mode: 'lexical',
    },
  });
  const ragContent = (rag.content as Array<{ type: string; text: string }>)[0];
  assert(ragContent?.text.includes('dragon'), 'rag_query did not return the dragon entry');
  console.error('rag_query OK');

  await client.close();
  console.error('\n✅ SMOKE PASS');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
