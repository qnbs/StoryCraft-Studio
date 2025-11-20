
import { createSlice, createAsyncThunk, createEntityAdapter, PayloadAction, EntityState } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { getPrompts, generateText, generateJson, generateImage, streamText } from '../../services/geminiService';
import { RootState } from '../../app/store';
import { Character, World, StorySection, OutlineSection, OutlineGenerationParams, CustomTemplateParams } from '../../types';
import { dbService } from '../../services/dbService';

// --- Entity Adapters ---
export const charactersAdapter = createEntityAdapter<Character>({
    selectId: (character) => character.id,
});

export const worldsAdapter = createEntityAdapter<World>({
    selectId: (world) => world.id,
});

// --- Initial State ---
export interface ProjectData {
    title: string;
    logline: string;
    characters: EntityState<Character>;
    worlds: EntityState<World>;
    outline: OutlineSection[];
    manuscript: StorySection[];
    projectGoals?: {
        totalWordCount: number;
        targetDate: string | null;
    };
    writingHistory?: {
        date: string; // YYYY-MM-DD
        words: number;
    }[];
}

// Helper interface for importing legacy or current formats
interface ImportedProjectData {
    title: string;
    logline: string;
    characters: Character[] | { ids: string[], entities: Record<string, Character> };
    worlds: World[] | { ids: string[], entities: Record<string, World> };
    outline?: OutlineSection[];
    manuscript?: StorySection[];
    projectGoals?: ProjectData['projectGoals'];
    writingHistory?: ProjectData['writingHistory'];
}

const initialState: { data: ProjectData } = {
    data: {
        title: '',
        logline: '',
        characters: charactersAdapter.getInitialState(),
        worlds: worldsAdapter.getInitialState(),
        outline: [],
        manuscript: [],
        projectGoals: {
            totalWordCount: 50000,
            targetDate: null,
        },
        writingHistory: [],
    }
};

// --- Async Thunks ---
export const generateLoglineSuggestionsThunk = createAsyncThunk(
    'project/generateLogline',
    async (lang: string, { getState }) => {
        const state = getState() as RootState;
        const project = state.project.present.data;
        const creativity = state.settings.aiCreativity;
        
        const { prompt, schema } = getPrompts('logline', { project, lang });
        const response = await generateJson<string[]>(prompt, creativity, schema);
        return response;
    }
);

export const importProjectThunk = createAsyncThunk(
    'project/importProject',
    async (file: File) => {
        const text = await file.text();
        const projectData = JSON.parse(text) as ImportedProjectData;
        
        const charactersState = charactersAdapter.getInitialState();
        const worldsState = worldsAdapter.getInitialState();

        const charactersToSet: Character[] = [];
        const worldsToSet: World[] = [];

        let characterArray: (Character & { avatarBase64?: string })[] = [];
        if (Array.isArray(projectData.characters)) {
            characterArray = projectData.characters;
        } else if (projectData.characters && 'ids' in projectData.characters && 'entities' in projectData.characters) {
            const { ids, entities } = projectData.characters;
            characterArray = ids.map((id: string) => entities[id]);
        }

        for(const char of characterArray) {
            const newChar = { ...char };
            if (newChar.avatarBase64) {
                await dbService.saveImage(newChar.id, newChar.avatarBase64);
                newChar.hasAvatar = true;
                delete newChar.avatarBase64;
            }
            charactersToSet.push(newChar);
        }
        charactersAdapter.setAll(charactersState, charactersToSet);
        
        let worldArray: (World & { ambianceImageBase64?: string })[] = [];
        if (Array.isArray(projectData.worlds)) {
            worldArray = projectData.worlds;
        } else if (projectData.worlds && 'ids' in projectData.worlds && 'entities' in projectData.worlds) {
            const { ids, entities } = projectData.worlds;
            worldArray = ids.map((id: string) => entities[id]);
        }

        for(const world of worldArray) {
            const newWorld = { ...world };
            if (newWorld.ambianceImageBase64) {
                await dbService.saveImage(newWorld.id, newWorld.ambianceImageBase64);
                newWorld.hasAmbianceImage = true;
                delete newWorld.ambianceImageBase64;
            }
            worldsToSet.push(newWorld);
        }
        worldsAdapter.setAll(worldsState, worldsToSet);

        return {
            title: projectData.title,
            logline: projectData.logline,
            characters: charactersState,
            worlds: worldsState,
            outline: projectData.outline || [],
            manuscript: projectData.manuscript || [],
            projectGoals: projectData.projectGoals || initialState.data.projectGoals,
            writingHistory: projectData.writingHistory || [],
        } as ProjectData;
    }
);

export const restoreSnapshotThunk = createAsyncThunk(
    'project/restoreSnapshot',
    async (snapshotId: number) => {
        const data = await dbService.getSnapshotData(snapshotId);
        return data;
    }
);

export const generateCharacterProfileThunk = createAsyncThunk(
    'project/generateCharacterProfile',
    async ({ concept, lang }: { concept: string, lang: string }, { getState }) => {
        const state = getState() as RootState;
        const { prompt, schema } = getPrompts('characterProfile', { concept, lang });
        return await generateJson<Omit<Character, 'id'>>(prompt, state.settings.aiCreativity, schema);
    }
);

export const regenerateCharacterFieldThunk = createAsyncThunk(
    'project/regenerateCharacterField',
    async ({ character, field, lang }: { character: Character, field: keyof Character, lang: string }, { getState }) => {
        const state = getState() as RootState;
        const { prompt } = getPrompts('regenerateCharacterField', { character, field, lang });
        const response = await generateText(prompt, state.settings.aiCreativity);
        return { field, value: response };
    }
);

export const generateCharacterPortraitThunk = createAsyncThunk(
    'project/generateCharacterPortrait',
    async ({ characterId, description, lang }: { characterId: string; description: string, lang: string }) => {
        const { prompt } = getPrompts('characterPortrait', { description, lang });
        const base64 = await generateImage(prompt);
        await dbService.saveImage(characterId, base64);
        return { characterId };
    }
);

export const generateWorldProfileThunk = createAsyncThunk(
    'project/generateWorldProfile',
    async ({ concept, lang }: { concept: string, lang: string }, { getState }) => {
        const state = getState() as RootState;
        const { prompt, schema } = getPrompts('worldProfile', { concept, lang });
        return await generateJson<Omit<World, 'id'>>(prompt, state.settings.aiCreativity, schema);
    }
);

export const regenerateWorldFieldThunk = createAsyncThunk(
    'project/regenerateWorldField',
    async ({ world, field, lang }: { world: World, field: keyof World, lang: string }, { getState }) => {
        const state = getState() as RootState;
        const { prompt } = getPrompts('regenerateWorldField', { world, field, lang });
        const response = await generateText(prompt, state.settings.aiCreativity);
        return { field, value: response };
    }
);

export const generateWorldImageThunk = createAsyncThunk(
    'project/generateWorldImage',
    async ({ worldId, description, lang }: { worldId: string, description: string, lang: string }) => {
        const { prompt } = getPrompts('worldImage', { description, lang });
        const base64 = await generateImage(prompt);
        await dbService.saveImage(worldId, base64);
        return { worldId };
    }
);

export const generateOutlineThunk = createAsyncThunk(
    'project/generateOutline',
    async (params: OutlineGenerationParams, { getState }) => {
        const state = getState() as RootState;
        const { prompt, schema } = getPrompts('outline', params);
        return await generateJson<OutlineSection[]>(prompt, state.settings.aiCreativity, schema);
    }
);

export const regenerateOutlineSectionThunk = createAsyncThunk(
    'project/regenerateOutlineSection',
    async ({ allSections, sectionToIndex, lang }: { allSections: OutlineSection[], sectionToIndex: number, lang: string }, { getState }) => {
        const state = getState() as RootState;
        const { prompt, schema } = getPrompts('regenerateOutlineSection', { allSections, sectionToIndex, lang });
        const response = await generateJson<OutlineSection>(prompt, state.settings.aiCreativity, schema);
        return { index: sectionToIndex, newSection: response };
    }
);

export const personalizeTemplateThunk = createAsyncThunk(
    'project/personalizeTemplate',
    async ({ sections, concept, lang }: { sections: {title: string}[], concept: string, lang: string }, { getState }) => {
        const state = getState() as RootState;
        const { prompt, schema } = getPrompts('personalizeTemplate', { sections, concept, lang });
        return await generateJson<{ title: string; prompt: string }[]>(prompt, state.settings.aiCreativity, schema);
    }
);

export const generateCustomTemplateThunk = createAsyncThunk(
    'project/generateCustomTemplate',
    async (params: CustomTemplateParams, { getState }) => {
        const state = getState() as RootState;
        const { prompt, schema } = getPrompts('customTemplate', params);
        return await generateJson<{ title: string }[]>(prompt, state.settings.aiCreativity, schema);
    }
);

export const streamGenerationThunk = createAsyncThunk(
    'project/streamGeneration',
    async ({ prompt, lang, onChunk, signal }: { prompt: string, lang: string, onChunk: (chunk: string) => void, signal?: AbortSignal }, { getState }) => {
        const state = getState() as RootState;
        const fullPrompt = `${prompt}\n\nRespond in ${lang === 'de' ? 'German' : 'English'}.`;
        await streamText(fullPrompt, state.settings.aiCreativity, onChunk, signal);
    }
);


export const generateSynopsisThunk = createAsyncThunk(
    'project/generateSynopsis',
    async (lang: string, { getState }) => {
        const state = getState() as RootState;
        const project = state.project.present.data;
        const creativity = state.settings.aiCreativity;
        const { prompt } = getPrompts('synopsis', { project, lang });
        return await generateText(prompt, creativity);
    }
);

// --- Slice Definition ---
const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        // --- Project Meta ---
        updateTitle: (state, action: PayloadAction<string>) => {
            state.data.title = action.payload;
        },
        updateLogline: (state, action: PayloadAction<string>) => {
            state.data.logline = action.payload;
        },
        updateProjectGoal: (state, action: PayloadAction<{ key: 'totalWordCount' | 'targetDate'; value: number | string | null }>) => {
            if (state.data.projectGoals) {
                // TS requires assertion or more specific union type logic, casting generally safe here
                (state.data.projectGoals as any)[action.payload.key] = action.payload.value;
            }
        },
        resetProject: (state, action: PayloadAction<{title: string, logline: string}>) => {
            state.data = {
                ...initialState.data,
                title: action.payload.title,
                logline: action.payload.logline,
                characters: charactersAdapter.getInitialState(),
                worlds: worldsAdapter.getInitialState(),
                 manuscript: [{ id: `sec-${Date.now()}`, title: 'Chapter 1', content: '' }],
            };
        },
        // --- Characters ---
        addCharacter: (state, action: PayloadAction<Partial<Character> & { name: string }>) => {
            const newChar: Character = {
                id: uuidv4(),
                name: action.payload.name,
                backstory: '', motivation: '', appearance: '', personalityTraits: '',
                flaws: '', notes: '', hasAvatar: false, characterArc: '', relationships: '',
                ...action.payload,
            };
            charactersAdapter.addOne(state.data.characters, newChar);
        },
        updateCharacter: (state, action: PayloadAction<{ id: string; changes: Partial<Character> }>) => {
            charactersAdapter.updateOne(state.data.characters, {id: action.payload.id, changes: action.payload.changes});
        },
        deleteCharacter: (state, action: PayloadAction<string>) => {
            charactersAdapter.removeOne(state.data.characters, action.payload);
        },
        // --- Worlds ---
        addWorld: (state, action: PayloadAction<Partial<World> & { name: string }>) => {
            const newWorld: World = {
                id: uuidv4(),
                name: action.payload.name,
                description: '', geography: '', magicSystem: '', culture: '',
                notes: '', hasAmbianceImage: false, timeline: [], locations: [],
                ...action.payload,
            };
            worldsAdapter.addOne(state.data.worlds, newWorld);
        },
        updateWorld: (state, action: PayloadAction<{ id: string; changes: Partial<World> }>) => {
            worldsAdapter.updateOne(state.data.worlds, {id: action.payload.id, changes: action.payload.changes});
        },
        deleteWorld: (state, action: PayloadAction<string>) => {
            worldsAdapter.removeOne(state.data.worlds, action.payload);
        },
        // --- Outline ---
        setOutline: (state, action: PayloadAction<OutlineSection[]>) => {
            state.data.outline = action.payload;
        },
        // --- Manuscript ---
        setManuscript: (state, action: PayloadAction<StorySection[]>) => {
            state.data.manuscript = action.payload;
        },
        updateManuscriptSection: (state, action: PayloadAction<{ id: string; changes: Partial<StorySection> }>) => {
            const index = state.data.manuscript.findIndex(s => s.id === action.payload.id);
            if (index !== -1) {
                state.data.manuscript[index] = { ...state.data.manuscript[index], ...action.payload.changes };
            }
        },
        addManuscriptSection: (state, action: PayloadAction<{ title: string; index?: number }>) => {
            const newSection: StorySection = { id: uuidv4(), title: action.payload.title, content: '' };
            if (action.payload.index !== undefined) {
                state.data.manuscript.splice(action.payload.index, 0, newSection);
            } else {
                state.data.manuscript.push(newSection);
            }
        },
        deleteManuscriptSection: (state, action: PayloadAction<string>) => {
            state.data.manuscript = state.data.manuscript.filter(s => s.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(importProjectThunk.fulfilled, (state, action) => {
                state.data = action.payload;
            })
            .addCase(restoreSnapshotThunk.fulfilled, (state, action) => {
                state.data = action.payload;
            })
            .addCase(generateCharacterPortraitThunk.fulfilled, (state, action) => {
                charactersAdapter.updateOne(state.data.characters, {
                    id: action.payload.characterId,
                    changes: { hasAvatar: true }
                });
            })
            .addCase(generateWorldImageThunk.fulfilled, (state, action) => {
                worldsAdapter.updateOne(state.data.worlds, {
                    id: action.payload.worldId,
                    changes: { hasAmbianceImage: true }
                });
            });
    }
});

export const projectActions = projectSlice.actions;
export default projectSlice.reducer;
