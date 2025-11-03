
export type View = 'dashboard' | 'templates' | 'outline' | 'characters' | 'world' | 'writer' | 'export' | 'settings' | 'help';

export interface Character {
  id: string;
  name: string;
  backstory: string;
  motivation: string;
  appearance: string;
  notes: string;
}

export interface World {
  id: string;
  name: string;
  description: string;
  history: string;
  geography: string;
  magicSystem: string;
}

export interface StorySection {
  id: string;
  title: string;
  content: string;
}

export interface StoryProject {
  title: string;
  logline: string;
  characters: Character[];
  worlds: World[];
  manuscript: StorySection[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'Genre' | 'Structure';
  sections: { title: string }[];
}

export interface OutlineSection {
  title: string;
  description: string;
}
