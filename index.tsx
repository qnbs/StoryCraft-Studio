import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import { rootReducer } from './app/store';
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
    let preloadedState: any = await dbService.loadState();
    const isNewUser = !preloadedState;
    
    // Elaborate data integrity check to ensure resilience against corruption.
    if (preloadedState && (
        !preloadedState.project || 
        typeof preloadedState.project.present === 'undefined'
    )) {
        console.warn("Project data from IndexedDB appears to be corrupt. Starting with a fresh state.");
        preloadedState = undefined;
    }

    const store = configureStore({
      reducer: rootReducer,
      preloadedState,
    });

    // The subscription logic for saving is now managed inside the dbService itself,
    // triggered after the store is created.
    dbService.subscribeToStore(store);

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