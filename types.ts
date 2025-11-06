import { EntityState } from '@reduxjs/toolkit';

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
export type Theme = 'dark' | 'light';
export type EditorFont = 'serif' | 'sans-serif' | 'monospace';
export type AiCreativity = 'Focused' | 'Balanced' | 'Imaginative';

export interface Settings {
    theme: Theme;
    editorFont: EditorFont;
    fontSize: number;
    lineSpacing: number;
    aiCreativity: AiCreativity;
    paragraphSpacing: number;
    indentFirstLine: boolean;
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