/**
 * Tauri Deep Link Service — handles native file associations and single-instance behavior.
 * QNBS-v3: Listens for `deep-link://new-url` events emitted from the deep-link plugin
 * when a .worldscript or .wsst file is double-clicked or dragged onto the app icon.
 * Integrates with the existing importProjectThunk flow for seamless project loading.
 */

import type { AppDispatch } from '../app/store';
import { importProjectThunk } from '../features/project/thunks/projectManagementThunks';
import { statusActions } from '../features/status/statusSlice';
import type { I18nTranslate } from './commands/commandTypes';
import { createLogger } from './logger';
import { isTauriRuntime } from './tauriRuntime';

const log = createLogger('tauriDeepLink');

let unlisten: (() => void) | null = null;

/**
 * Initialize the deep link handler for Tauri file associations.
 * Call this once during app startup (e.g., in App.tsx useEffect).
 *
 * @param dispatch - Redux dispatch function for importing projects
 * @param t - Translation function for localized error messages
 * @returns Cleanup function to remove the event listener
 */
export async function initTauriDeepLink(
  dispatch: AppDispatch,
  t: I18nTranslate,
): Promise<() => void> {
  if (!isTauriRuntime()) {
    return () => {};
  }

  try {
    const { listen } = await import('@tauri-apps/api/event');
    // Listen for deep-link://new-url event (emitted by tauri-plugin-deep-link)
    unlisten = await listen<string[] | string>('deep-link://new-url', async (event) => {
      // Handle both array and string payloads
      const urls = Array.isArray(event.payload) ? event.payload : [event.payload];

      // Process all URLs in the payload (user may have selected multiple files)
      for (const url of urls) {
        if (!url) {
          log.warn('Received empty URL in deep-link event');
          continue;
        }

        log.info('Received deep-link event', { url });

        // Parse the URL to get the file path (worldscript://path/to/file.worldscript)
        // The deep-link plugin handles custom schemes, but for file associations we need
        // to handle the case where the file path is passed as a CLI argument
        try {
          // For file associations on Windows/Linux, the deep-link plugin parses CLI args
          // and emits the URL. We need to convert worldscript:// URLs back to file paths
          // or handle direct file paths if passed.
          let filePath = url;

          // Check if it's a worldscript:// (or legacy storycraft://) URL and extract the path.
          // QNBS-v3: accept BOTH schemes — tauri.conf.json registers both during migration (#142),
          // so storycraft:// links/file-associations created before the rename still resolve.
          if (/^(?:worldscript|storycraft):/i.test(url)) {
            // On Windows, the URL might be worldscript:///C:/path/to/file.worldscript
            // On Linux, it might be worldscript:///home/user/file.worldscript
            filePath = url.replace(/^(?:worldscript|storycraft):\/{0,2}/i, '');
            // Windows drive-letter path, incl. the canonical triple-slash form `…:///C:/…` which
            // leaves a leading slash (/C:/…) — strip any leading slash(es) so exists() resolves it.
            if (/^\/*[A-Za-z]:/.test(filePath)) {
              filePath = filePath.replace(/^\/+/, '');
            } else {
              filePath = filePath.replace(/^\/+/, '/');
            }
          }

          // Read file via Tauri FS plugin
          const { readTextFile, exists } = await import('@tauri-apps/plugin-fs');

          if (!(await exists(filePath))) {
            throw new Error('File not found');
          }

          const content = await readTextFile(filePath);
          const fileName = filePath.split(/[/\\]/).pop() || 'project.json';

          // Create a File object for the existing import flow
          const file = new File([content], fileName, {
            type: 'application/json',
          });

          // Dispatch import thunk
          const resultAction = await dispatch(importProjectThunk(file));

          if (importProjectThunk.fulfilled.match(resultAction)) {
            // Navigate to manuscript view after successful import
            window.location.hash = '#/manuscript';
          } else {
            // Show error notification
            dispatch(
              statusActions.addNotification({
                type: 'error',
                title: t('error.deepLink.title'),
                description: resultAction.error?.message ?? t('error.deepLink.unknown'),
              }),
            );
          }
        } catch (error) {
          log.error('Failed to open project file via deep link', { error, url });
          dispatch(
            statusActions.addNotification({
              type: 'error',
              title: t('error.deepLink.title'),
              description: error instanceof Error ? error.message : String(error),
            }),
          );
        }
      }
    });

    log.info('Tauri deep link handler initialized');
  } catch (error) {
    log.warn('Failed to initialize Tauri deep link handler', { error });
  }

  return () => {
    unlisten?.();
    unlisten = null;
  };
}

/**
 * Check if a file path is a WorldScript project file.
 */
export function isWorldScriptProjectFile(filePath: string): boolean {
  const ext = filePath.split('.').pop()?.toLowerCase();
  // QNBS-v3: compare the lowercased ext for every extension (incl. json) so uppercase forms
  // like `.JSON` / `.WORLDSCRIPT` are accepted, not just lowercase.
  return ext === 'worldscript' || ext === 'wsst' || ext === 'json';
}

/**
 * Get the project ID from a file path (for logging/debugging).
 */
export function getProjectIdFromPath(filePath: string): string {
  const lastSegment = filePath.split(/[/\\]/).pop();
  if (!lastSegment) return 'unknown';
  // QNBS-v3: case-insensitive so uppercase extensions (.WORLDSCRIPT/.WSST/.JSON) are stripped too.
  return lastSegment.replace(/\.(worldscript|wsst|json)$/i, '') || 'unknown';
}
