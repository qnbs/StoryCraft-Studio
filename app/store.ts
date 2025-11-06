import { configureStore, combineReducers, PayloadAction, createStore, AnyAction } from '@reduxjs/toolkit';
import projectReducer, { importProjectThunk, projectActions, restoreSnapshotThunk } from '../features/project/projectSlice';
import settingsReducer from '../features/settings/settingsSlice';
import statusReducer from '../features/status/statusSlice';
import writerReducer from '../features/writer/writerSlice';
import undoable from 'redux-undo';

// A sophisticated filter to prevent async thunk actions from populating the undo history.
const filterUndoableActions = (action: AnyAction) => {
    const isThunkAction = ['/pending', '/fulfilled', '/rejected'].some(suffix => action.type.endsWith(suffix));
    return !isThunkAction;
}

const combinedReducer = combineReducers({
    project: undoable(projectReducer, {
        limit: 100, // A state-of-the-art advancement to prevent infinite memory usage.
        filter: filterUndoableActions, // Elaborate optimization for a cleaner history.
    }),
    settings: settingsReducer,
    status: statusReducer,
    writer: writerReducer,
});

// A sophisticated higher-order reducer to augment redux-undo's behavior
export const rootReducer = (state: ReturnType<typeof combinedReducer> | undefined, action: PayloadAction<any>) => {
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
// This file exports the reducer and types.
const tempStore = createStore(rootReducer);
export type RootState = ReturnType<typeof tempStore.getState>;
export type AppDispatch = typeof tempStore.dispatch;