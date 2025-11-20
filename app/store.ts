import { configureStore, combineReducers, createStore, AnyAction, Middleware } from '@reduxjs/toolkit';
import projectReducer, { importProjectThunk, projectActions, restoreSnapshotThunk } from '../features/project/projectSlice';
import settingsReducer from '../features/settings/settingsSlice';
import statusReducer from '../features/status/statusSlice';
import writerReducer from '../features/writer/writerSlice';
import undoable from 'redux-undo';
import { listenerMiddleware } from './listenerMiddleware';

// A sophisticated filter to prevent async thunk actions from populating the undo history.
const filterUndoableActions = (action: AnyAction) => {
    const isThunkAction = ['/pending', '/fulfilled', '/rejected'].some(suffix => action.type.endsWith(suffix));
    // Also filter out ephemeral UI actions if any
    return !isThunkAction;
}

// Custom Lightweight Logger Middleware (Development Only)
const loggerMiddleware: Middleware = store => next => action => {
    if (process.env.NODE_ENV !== 'production') {
        console.group((action as AnyAction).type);
        console.info('dispatching', action);
        const result = next(action);
        console.log('next state', store.getState());
        console.groupEnd();
        return result;
    }
    return next(action);
};

const combinedReducer = combineReducers({
    project: undoable(projectReducer, {
        limit: 100, 
        filter: filterUndoableActions, 
    }),
    settings: settingsReducer,
    status: statusReducer,
    writer: writerReducer,
});

// A sophisticated higher-order reducer to augment redux-undo's behavior
export const rootReducer = (state: ReturnType<typeof combinedReducer> | undefined, action: AnyAction) => {
    let nextState = state;

    // This cutting-edge technique provides clean undo history on project reset/import/restore
    if (action.type === projectActions.resetProject.type || action.type === importProjectThunk.fulfilled.type || action.type === restoreSnapshotThunk.fulfilled.type) {
        if (nextState && nextState.project) {
             const { past, future, ...restOfProject } = nextState.project;
             nextState = {
                ...nextState,
                project: {
                    ...restOfProject,
                    past: [],
                    future: [],
                }
            };
        }
    }
    
    return combinedReducer(nextState, action);
}

// The store is now configured and created in index.tsx after async state loading.
// To support preloadedState, we export a factory function or use this temp store for types.
export const setupStore = (preloadedState?: any) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these paths in the state which might have non-serializable data if necessary
                // (Though we aim for full serializability)
                ignoredActions: ['persist/PERSIST'], 
            }
        })
        .prepend(listenerMiddleware.middleware)
        .concat(loggerMiddleware)
  });
};

const tempStore = createStore(rootReducer);
export type RootState = ReturnType<typeof tempStore.getState>;
export type AppDispatch = typeof tempStore.dispatch;
