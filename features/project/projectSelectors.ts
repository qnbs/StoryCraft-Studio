import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { charactersAdapter, worldsAdapter } from './projectSlice';

// --- Base Selectors ---
const selectProjectWithHistory = (state: RootState) => state.project;
const selectProjectState = (state: RootState) => state.project.present;
export const selectProjectData = (state: RootState) => state.project.present?.data;

// --- Undo/Redo Selectors ---
export const selectCanUndo = createSelector(
    [selectProjectWithHistory],
    (project) => project.past.length > 0
);

export const selectCanRedo = createSelector(
    [selectProjectWithHistory],
    (project) => project.future.length > 0
);

// --- Character Selectors (from adapter) ---
const selectCharactersState = createSelector(
    [selectProjectData],
    (data) => data?.characters || charactersAdapter.getInitialState()
);

export const {
    selectAll: selectAllCharacters,
    selectById: selectCharacterById,
    selectIds: selectCharacterIds,
    selectTotal: selectTotalCharacters,
} = charactersAdapter.getSelectors(selectCharactersState);


// --- World Selectors (from adapter) ---
const selectWorldsState = createSelector(
    [selectProjectData],
    (data) => data?.worlds || worldsAdapter.getInitialState()
);

export const {
    selectAll: selectAllWorlds,
    selectById: selectWorldById,
    selectIds: selectWorldIds,
    selectTotal: selectTotalWorlds,
} = worldsAdapter.getSelectors(selectWorldsState);


// --- Manuscript & Outline Selectors ---
export const selectManuscript = createSelector(
    [selectProjectData],
    (data) => data?.manuscript || []
);

export const selectOutline = createSelector(
    [selectProjectData],
    (data) => data?.outline || []
);