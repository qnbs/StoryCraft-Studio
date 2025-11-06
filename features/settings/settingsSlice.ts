import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Settings, Theme, EditorFont, AiCreativity } from '../../types';

const defaultSettings: Settings = {
    theme: 'dark',
    editorFont: 'serif',
    fontSize: 16,
    lineSpacing: 1.6,
    aiCreativity: 'Balanced',
    paragraphSpacing: 1,
    indentFirstLine: false,
};

const initialState: Settings = { ...defaultSettings };

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings(state, action: PayloadAction<Settings>) {
        Object.assign(state, action.payload);
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    setEditorFont(state, action: PayloadAction<EditorFont>) {
      state.editorFont = action.payload;
    },
    setFontSize(state, action: PayloadAction<number>) {
      state.fontSize = action.payload;
    },
    setLineSpacing(state, action: PayloadAction<number>) {
      state.lineSpacing = action.payload;
    },
    setAiCreativity(state, action: PayloadAction<AiCreativity>) {
      state.aiCreativity = action.payload;
    },
    setParagraphSpacing(state, action: PayloadAction<number>) {
        state.paragraphSpacing = action.payload;
    },
    setIndentFirstLine(state, action: PayloadAction<boolean>) {
        state.indentFirstLine = action.payload;
    }
  },
});

// Helper function to apply initial theme on load
const applyInitialTheme = () => {
    let settings = defaultSettings;
    const storedState = localStorage.getItem('storycraft-state');
    if (storedState) {
        const persistedState = JSON.parse(storedState);
        if(persistedState.settings) {
            settings = persistedState.settings;
        }
    }
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(settings.theme === 'light' ? 'light-theme' : 'dark-theme');
};

applyInitialTheme();


export const settingsActions = settingsSlice.actions;
export default settingsSlice.reducer;