import { EntityState } from '@reduxjs/toolkit';
import { Type } from '@google/genai';
import { ProjectData } from './features/project/projectSlice'; // Import ProjectData type

export type View = 'dashboard' | 'manuscript' | 'writer' | 'templates' | 'outline' | 'characters' | 'world' | 'export' | 'settings' | 'help';

export interface Character {
  id: string;
  name: string;
  backstory: string;
  motivation: string;
  appearance: string;
  personalityTraits: string;
  flaws: string;
  notes: string;
  hasAvatar?: boolean;
  characterArc: string;
  relationships: string;
}

export interface WorldLocation {
  id: string;
  name: string;
  description: string;
}
export interface WorldTimelineEvent {
  id: string;
  era: string;
  description: string;
}

export interface World {
  id: string;
  name: string;
  description: string;
  geography: string;
  magicSystem: string;
  culture: string;
  notes: string;
  hasAmbianceImage?: boolean;
  timeline: WorldTimelineEvent[];
  locations: WorldLocation[];
}

export interface StorySection {
  id: string;
  title: string;
  content: string;
  prompt?: string;
  summary?: string;
  notes?: string;
}

export interface StoryProject {
  title: string;
  logline: string;
  characters: Character[] | EntityState<Character, string>;
  worlds: World[] | EntityState<World, string>;
  outline?: OutlineSection[];
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

export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'Genre' | 'Structure';
  tags: string[];
  arcDescription: string;
  sections: { titleKey: string }[];
}

export interface OutlineSection {
  id:string;
  title: string;
  description: string;
  isTwist?: boolean;
}

// Settings Types
export type Theme = 'dark' | 'light' | 'auto';
export type EditorFont = 'serif' | 'sans-serif' | 'monospace' | 'custom';
export type AiCreativity = 'Focused' | 'Balanced' | 'Imaginative';
export type AiModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'claude-3-haiku' | 'claude-3-sonnet' | 'gpt-4o-mini' | 'gpt-4o';
export type NotificationFrequency = 'never' | 'daily' | 'weekly' | 'monthly';
export type BackupFrequency = 'manual' | 'daily' | 'weekly' | 'monthly';
export type SyncProvider = 'none' | 'google-drive' | 'dropbox' | 'onedrive' | 'icloud';

export interface CustomFont {
  name: string;
  url: string;
  format: 'woff' | 'woff2' | 'ttf' | 'otf';
}

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  action: string;
}

export interface WritingGoal {
  type: 'words' | 'time' | 'sessions';
  target: number;
  period: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
}

export interface AdvancedAiSettings {
  model: AiModel;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  customPrompts: Record<string, string>;
  rateLimit: number; // requests per minute
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReader: boolean;
  focusIndicators: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface PrivacySettings {
  analyticsEnabled: boolean;
  crashReporting: boolean;
  dataEncryption: boolean;
  localStorageOnly: boolean;
  shareUsageData: boolean;
}

export interface PerformanceSettings {
  autoSaveInterval: number; // seconds
  cacheSize: number; // MB
  preloadContent: boolean;
  lazyLoadImages: boolean;
  offlineMode: boolean;
}

export interface NotificationSettings {
  desktopNotifications: boolean;
  emailNotifications: boolean;
  writingReminders: NotificationFrequency;
  goalAchievements: boolean;
  collaborationUpdates: boolean;
}

export interface CollaborationSettings {
  realTimeCollaboration: boolean;
  publicSharing: boolean;
  commentSystem: boolean;
  versionHistory: boolean;
}

export interface IntegrationSettings {
  syncProvider: SyncProvider;
  evernoteSync: boolean;
  notionSync: boolean;
  scrivenerExport: boolean;
  googleDocsImport: boolean;
}

export interface AdvancedEditorSettings {
  autoComplete: boolean;
  spellCheck: boolean;
  grammarCheck: boolean;
  wordCount: boolean;
  readingTime: boolean;
  distractionFree: boolean;
  typewriterMode: boolean;
  zenMode: boolean;
  focusMode: boolean;
  customDictionary: string[];
  writingStats: boolean;
}

export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: BackupFrequency;
  backupLocation: string;
  maxBackups: number;
  encryptBackups: boolean;
}

export interface ThemeCustomization {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  customCss: string;
}

export interface Settings {
    // Basic Settings
    theme: Theme;
    editorFont: EditorFont;
    fontSize: number;
    lineSpacing: number;
    aiCreativity: AiCreativity;
    paragraphSpacing: number;
    indentFirstLine: boolean;

    // Advanced Settings
    customFont?: CustomFont;
    keyboardShortcuts: KeyboardShortcut[];
    writingGoals: WritingGoal[];
    advancedAi: AdvancedAiSettings;
    accessibility: AccessibilitySettings;
    privacy: PrivacySettings;
    performance: PerformanceSettings;
    notifications: NotificationSettings;
    collaboration: CollaborationSettings;
    integrations: IntegrationSettings;
    advancedEditor: AdvancedEditorSettings;
    backup: BackupSettings;
    themeCustomization: ThemeCustomization;

    // Legacy support
    language?: string;
}

// Help Types
export interface HelpArticle {
  title: string;
  content: string;
}

export interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  articles: HelpArticle[];
}

// Snapshot Types
export interface ProjectSnapshot {
  id: number;
  date: string;
  name: string;
  wordCount: number;
}

// AI Types
export interface GeminiSchema {
    type: Type;
    items?: GeminiSchema;
    properties?: Record<string, GeminiSchema>;
    required?: string[];
    description?: string;
}

export interface OutlineGenerationParams {
    genre: string;
    idea: string;
    characters?: string;
    setting?: string;
    pacing?: string;
    numChapters: number;
    includeTwist: boolean;
    lang: string;
}

export interface CustomTemplateParams {
    customConcept: string;
    customElements: string;
    numSections: number;
    lang: string;
}

// Speech Recognition Types
interface ISpeechRecognitionConstructor {
    new (): ISpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: ISpeechRecognitionConstructor;
        webkitSpeechRecognition: ISpeechRecognitionConstructor;
    }
}

export interface ISpeechRecognitionEvent {
    resultIndex: number;
    results: {
        [key: number]: {
            isFinal: boolean;
            [key: number]: {
                transcript: string;
            };
        };
        length: number;
    };
}

export interface ISpeechRecognitionError {
    error: string;
    message?: string;
}

export interface ISpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: ISpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (event: ISpeechRecognitionError) => void;
}

// Persistence Types
export interface PersistedRootState {
    project?: {
        present?: { data: ProjectData };
        data?: ProjectData;
        past?: unknown[];
        future?: unknown[];
        _latestUnfiltered?: unknown;
    };
    settings?: Settings;
    status?: unknown;
    writer?: unknown;
}