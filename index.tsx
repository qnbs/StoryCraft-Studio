import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { setupStore } from './app/store';
import { dbService } from './services/dbService';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);

// A sophisticated async IIFE to handle pre-loading state from IndexedDB before app mount.
(async () => {
  try {
    await dbService.initDB();
    const loadedState = await dbService.loadState();
    let preloadedState: any = loadedState; // Cast for manipulation before Redux
    
    const isNewUser = !preloadedState;
    
    // --- CRITICAL HYDRATION LOGIC ---
    // The middleware saves only the 'present' state to save space/time.
    // However, redux-undo expects { past: [], present: ..., future: [] }.
    // We must manually reconstruct the undo envelope if we loaded flat data.
    if (preloadedState && preloadedState.project) {
        // Check if the loaded project is "flat" (i.e., it doesn't have a 'present' key, but HAS 'data')
        // or if it matches the shape of ProjectData directly.
        const projectPart = preloadedState.project as any;
        const isFlatData = !projectPart.present && projectPart.data;
        
        if (isFlatData) {
             console.debug("Hydrating flat project state into Redux-Undo envelope.");
             preloadedState.project = {
                 past: [],
                 present: preloadedState.project, // The DB saved the 'present' slice directly
                 future: [],
                 _latestUnfiltered: preloadedState.project // Helper for redux-undo if needed
             };
        } else if (!projectPart.present && !projectPart.data) {
            // Fallback: Corrupt or empty project state
            console.warn("Project state corrupted. Resetting project.");
            preloadedState.project = undefined; 
        }
    }
    // --------------------------------

    const store = setupStore(preloadedState);

    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <App isNewUser={isNewUser} />
        </Provider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to initialize the application:", error);
    root.render(
      <div style={{ color: 'red', padding: '20px' }}>
        <h1>Application Initialization Failed</h1>
        <p>Could not load project data. Please check the browser console for more details.</p>
      </div>
    );
  }
})();
