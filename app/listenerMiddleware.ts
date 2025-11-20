import { createListenerMiddleware, isAnyOf, isRejected, addListener } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from './store';
import { dbService } from '../services/dbService';
import { statusActions } from '../features/status/statusSlice';
import { projectActions } from '../features/project/projectSlice';
import { settingsActions } from '../features/settings/settingsSlice';

export const listenerMiddleware = createListenerMiddleware();

// --- 1. Auto-Save Logic ---
// We listen for *any* action that might change the persistent state.
listenerMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    const currentRoot = currentState as RootState;
    const prevRoot = previousState as RootState;

    // Check if project.present has changed (ignoring past/future changes to avoid saving on undo/redo steps purely)
    const projectChanged = currentRoot.project.present !== prevRoot.project.present;
    const settingsChanged = currentRoot.settings !== prevRoot.settings;

    return projectChanged || settingsChanged;
  },
  effect: async (action, listenerApi) => {
    // Debounce: Wait 1000ms. If another action comes in, this task is cancelled.
    await listenerApi.delay(1000);

    const state = listenerApi.getState() as RootState;
    
    listenerApi.dispatch(statusActions.setSavingStatus('saving'));

    try {
      const promises = [];
      
      // CRITICAL AUDIT FIX: 
      // We must NOT save the entire `state.project` which includes `past` and `future` arrays.
      // As the user writes, the history grows massively, causing IndexedDB writes to block the main thread.
      // We only save `state.project.present`.
      const projectDataToSave = state.project.present ? state.project.present : state.project;

      promises.push(dbService.saveProject(projectDataToSave));
      promises.push(dbService.saveSettings(state.settings));

      await Promise.all(promises);

      listenerApi.dispatch(statusActions.setSavingStatus('saved'));
      
      // Reset to idle after a delay
      await listenerApi.delay(2000);
      // Check if status is still 'saved' before clearing (it might have become 'saving' again)
      if ((listenerApi.getState() as RootState).status.saving === 'saved') {
         listenerApi.dispatch(statusActions.setSavingStatus('idle'));
      }

    } catch (error) {
      console.error("Auto-save failed:", error);
      listenerApi.dispatch(statusActions.addNotification({
          type: 'error',
          title: 'Auto-Save Failed',
          description: 'Your changes could not be saved to the local database.'
      }));
      listenerApi.dispatch(statusActions.setSavingStatus('idle'));
    }
  },
});

// --- 2. Global Error Handling ---
// Listen for any rejected Async Thunk and show a toast
listenerMiddleware.startListening({
    matcher: isRejected,
    effect: (action, listenerApi) => {
        // Skip if the action was aborted (e.g. cancelled request via AbortController)
        if (action.meta.aborted) return;

        const errorTitle = 'Operation Failed';
        let errorDescription = 'An unexpected error occurred.';

        if (action.error && action.error.message) {
            errorDescription = action.error.message;
        }
        
        // Specific handling for Gemini API errors if identifiable
        if (errorDescription.includes('quota') || errorDescription.includes('API key')) {
            errorDescription = "AI Service Error: Please check your API key and quota.";
        }

        listenerApi.dispatch(statusActions.addNotification({
            type: 'error',
            title: errorTitle,
            description: errorDescription
        }));
    }
});

// Type-safe export
export const startAppListening = listenerMiddleware.startListening as any;
export const addAppListener = addListener as any;