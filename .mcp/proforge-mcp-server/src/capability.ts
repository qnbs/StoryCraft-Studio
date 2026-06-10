/**
 * Shared capability resolver for the ProForge MCP server.
 * QNBS-v3: Thin glue — parses CLI args, loads an optional default project payload, and builds a
 * ProForge Capability Layer (Node adapter) per request. All business logic lives in the repo's
 * Core Capability Layer; this file only wires ports for the MCP runtime.
 */

import { readFileSync } from 'node:fs';
import {
  createNodeProForgeCapability,
  type NodeCapabilityOptions,
} from '../../../services/proForge/adapters/nodeProForgeCapability';
import type { ProForgeCapabilityLayer } from '../../../services/proForge/proForgeCapabilityLayer';
import type { ProjectPayload } from '../../../services/proForge/proForgeCapabilitySchemas';

interface CliOptions {
  projectFile?: string;
  historyFile?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === '--project' || arg === '-p') && argv[i + 1]) {
      opts.projectFile = argv[++i];
    } else if ((arg === '--history' || arg === '-h') && argv[i + 1]) {
      opts.historyFile = argv[++i];
    }
  }
  return opts;
}

const cli = parseArgs(process.argv.slice(2));

/** The project payload loaded from `--project <file>` at startup, if any. */
export const startupPayload: unknown =
  cli.projectFile !== undefined ? JSON.parse(readFileSync(cli.projectFile, 'utf8')) : null;

export const historyFile: string | undefined = cli.historyFile;

const baseOpts: NodeCapabilityOptions = {
  ...(historyFile !== undefined && { historyFile }),
};

/**
 * Resolve a capability layer + the effective payload for a request. Prefers an inline `project`
 * argument; falls back to the startup payload. Throws a clear error when neither is present.
 */
export async function resolveCapability(
  inlineProject?: unknown,
): Promise<{ cap: ProForgeCapabilityLayer; payload: ProjectPayload }> {
  const raw = inlineProject ?? startupPayload;
  if (!raw) {
    throw new Error(
      'No project payload available. Pass a `project` argument or start the server with --project <file>.',
    );
  }
  const cap = await createNodeProForgeCapability(raw, baseOpts);
  // createNodeProForgeCapability validated the payload; re-read it for projectId/config access.
  const payload = raw as ProjectPayload;
  return { cap, payload };
}

/** Build a capability with no project context — for the pure `applyEdits` op. */
export async function inlineCapability(): Promise<ProForgeCapabilityLayer> {
  return createNodeProForgeCapability({ projectId: 'inline' }, baseOpts);
}
