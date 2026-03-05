import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile, createDir, exists, readDir, removeFile } from '@tauri-apps/api/fs';
import { appDataDir, join } from '@tauri-apps/api/path';
import { StoryProject, Character, World, Template, Settings } from '../types';
import { StorageBackend } from './storageService';

class FileSystemService implements StorageBackend {
  private appDataPath: string | null = null;

  async initialize(): Promise<void> {
    try {
      this.appDataPath = await appDataDir();
    } catch (error) {
      console.error('Failed to get app data directory:', error);
      throw error;
    }
  }

  private async ensureAppDataPath(): Promise<string> {
    if (!this.appDataPath) {
      await this.initialize();
    }
    return this.appDataPath!;

































































































































































































































































































































































































export const fileSystemService = new FileSystemService();}  }    };      }        }          temperature: 0.7          model: 'gemini-1.5-flash',        advancedAi: {        aiModel: 'gemini-1.5-flash',        aiCreativity: 'Balanced',        editorFont: 'serif',        theme: 'dark',      settings: {      templates: [],      manuscript: manuscript.trim(),      worlds: [],      characters: [],      updatedAt: new Date().toISOString(),      createdAt: new Date().toISOString(),      description,      author,      title,      id: Date.now().toString(),    return {    }      }        manuscript += line + '\n';      } else if (inManuscript) {        inManuscript = false;      } else if (inManuscript && line.startsWith('## ')) {        inManuscript = true;      } else if (line.startsWith('## Manuscript')) {        }          description = line.split(':')[1].trim().replace(/"/g, '');        } else if (line.startsWith('description:')) {          author = line.split(':')[1].trim().replace(/"/g, '');        } else if (line.startsWith('author:')) {          title = line.split(':')[1].trim().replace(/"/g, '');        if (line.startsWith('title:')) {      if (inFrontmatter) {      }        continue;        inFrontmatter = !inFrontmatter;      if (line.trim() === '---') {    for (const line of lines) {    let inManuscript = false;    let inFrontmatter = false;    let manuscript = '';    let author = '';    let description = '';    let title = 'Imported Project';    const lines = content.split('\n');    // Simple markdown parser - in a real implementation, you'd use a proper markdown parser  private parseMarkdownProject(content: string): StoryProject {  }    return markdown;`;${project.manuscript || 'No manuscript content yet.'}## Manuscript`).join('\n')}**Atmosphere:** ${world.atmosphere || ''}**Setting:** ${world.setting || ''}${world.description || ''}${project.worlds.map(world => `### ${world.name}## Worlds`).join('\n')}**Appearance:** ${char.appearance || ''}**Motivation:** ${char.motivation || ''}**Personality:** ${char.personalityTraits || ''}${char.backstory || ''}${project.characters.map(char => `### ${char.name}## Characters${project.description || ''}# ${project.title}---updated: "${project.updatedAt}"created: "${project.createdAt}"description: "${project.description || ''}"author: "${project.author || ''}"title: "${project.title}"    let markdown = `---  private convertToMarkdown(project: StoryProject): string {  }    throw new Error('Unsupported file format');    }      return this.parseMarkdownProject(content);    } else if (filePath.endsWith('.md') || filePath.endsWith('.markdown')) {      return JSON.parse(content);    if (filePath.endsWith('.json')) {    const content = await readTextFile(filePath);    }      return null;    if (!filePath || Array.isArray(filePath)) {    });      ]        { name: 'All Files', extensions: ['*'] }        { name: 'Markdown', extensions: ['md', 'markdown'] },        { name: 'JSON', extensions: ['json'] },      filters: [      multiple: false,    const filePath = await open({  async importProject(): Promise<StoryProject | null> {  }    }      await writeTextFile(filePath, content);    if (filePath) {    });      }]        extensions: [extension]        name: format.toUpperCase(),      filters: [{      defaultPath: `${fileName}.${extension}`,    const filePath = await save({    }        throw new Error(`Unsupported export format: ${format}`);      default:        break;        extension = 'md';        content = this.convertToMarkdown(project);        fileName = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;        // For docx, we'll save as markdown for now and handle conversion later      case 'docx':        break;        extension = 'md';        content = this.convertToMarkdown(project);        fileName = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;      case 'markdown':        break;        extension = 'json';        content = JSON.stringify(project, null, 2);        fileName = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;      case 'json':    switch (format) {    let extension: string;    let content: string;    let fileName: string;  async exportProject(project: StoryProject, format: 'json' | 'markdown' | 'docx' = 'json'): Promise<void> {  // Import/Export functionality  }    }      console.error('Failed to delete snapshot:', error);    } catch (error) {      }        await removeFile(snapshotFile);      if (await exists(snapshotFile)) {      const snapshotFile = await join(appDataPath, 'snapshots', `${snapshotId}.json`);      const appDataPath = await this.ensureAppDataPath();    try {  async deleteSnapshot(snapshotId: string): Promise<void> {  }    }      return [];      console.error('Failed to list snapshots:', error);    } catch (error) {        .map(entry => entry.name.replace('.json', ''));        .filter(entry => entry.name.endsWith('.json'))      return entries      const entries = await readDir(snapshotsPath);      }        return [];      if (!(await exists(snapshotsPath))) {      const snapshotsPath = await join(appDataPath, 'snapshots');      const appDataPath = await this.ensureAppDataPath();    try {  async listSnapshots(): Promise<string[]> {  }    }      return null;      console.error('Failed to load snapshot:', error);    } catch (error) {      return JSON.parse(content);      const content = await readTextFile(snapshotFile);      }        return null;      if (!(await exists(snapshotFile))) {      const snapshotFile = await join(appDataPath, 'snapshots', `${snapshotId}.json`);      const appDataPath = await this.ensureAppDataPath();    try {  async getSnapshotData(snapshotId: string): Promise<any> {  }    await writeTextFile(snapshotFile, JSON.stringify(data, null, 2));    const snapshotFile = await join(snapshotsPath, `${snapshotId}.json`);    }      await createDir(snapshotsPath, { recursive: true });    if (!(await exists(snapshotsPath))) {    const snapshotsPath = await join(appDataPath, 'snapshots');    const appDataPath = await this.ensureAppDataPath();  async saveSnapshot(snapshotId: string, data: any): Promise<void> {  // Snapshot operations  }    }      return null;      console.error('Failed to load Gemini API key:', error);    } catch (error) {      return await readTextFile(keyFile);      }        return null;      if (!(await exists(keyFile))) {      const keyFile = await join(appDataPath, 'config', 'gemini_key.txt');      const appDataPath = await this.ensureAppDataPath();    try {  async getGeminiApiKey(): Promise<string | null> {  }    await writeTextFile(keyFile, apiKey);    const keyFile = await join(configPath, 'gemini_key.txt');    }      await createDir(configPath, { recursive: true });    if (!(await exists(configPath))) {    const configPath = await join(appDataPath, 'config');    const appDataPath = await this.ensureAppDataPath();  async saveGeminiApiKey(apiKey: string): Promise<void> {  // Gemini API key storage  }    }      return null;      console.error('Failed to load settings:', error);    } catch (error) {      return JSON.parse(content);      const content = await readTextFile(settingsFile);      }        return null;      if (!(await exists(settingsFile))) {      const settingsFile = await join(appDataPath, 'config', 'settings.json');      const appDataPath = await this.ensureAppDataPath();    try {  async loadSettings(): Promise<Settings | null> {  }    await writeTextFile(settingsFile, JSON.stringify(settings, null, 2));    const settingsFile = await join(configPath, 'settings.json');    }      await createDir(configPath, { recursive: true });    if (!(await exists(configPath))) {    const configPath = await join(appDataPath, 'config');    const appDataPath = await this.ensureAppDataPath();  async saveSettings(settings: Settings): Promise<void> {  // Settings operations  }    }      return null;      console.error('Failed to load image:', error);    } catch (error) {      return `data:image/png;base64,${base64Data}`;      const base64Data = await readTextFile(imageFile);      }        return null;      if (!(await exists(imageFile))) {      const imageFile = await join(appDataPath, 'images', `${id}.png`);      const appDataPath = await this.ensureAppDataPath();    try {  async getImage(id: string): Promise<string | null> {  }    await writeTextFile(imageFile, cleanBase64);    const cleanBase64 = base64Data.replace(/^data:image\/png;base64,/, '');    // Remove data URL prefix if present    const imageFile = await join(imagesPath, `${id}.png`);    }      await createDir(imagesPath, { recursive: true });    if (!(await exists(imagesPath))) {    const imagesPath = await join(appDataPath, 'images');    const appDataPath = await this.ensureAppDataPath();  async saveImage(id: string, base64Data: string): Promise<void> {  // Image operations  }    }      await removeFile(projectFile);    if (await exists(projectFile)) {    const projectFile = await join(projectPath, 'project.json');    // In a full implementation, you'd want to remove the entire directory    // For simplicity, we'll just remove the project.json file    const projectPath = await join(appDataPath, 'projects', projectId);    const appDataPath = await this.ensureAppDataPath();  async deleteProject(projectId: string): Promise<void> {  }    }      return [];      console.error('Failed to list projects:', error);    } catch (error) {      return entries.filter(entry => entry.isDirectory).map(entry => entry.name);      const entries = await readDir(projectsPath);      }        return [];      if (!(await exists(projectsPath))) {      const projectsPath = await join(appDataPath, 'projects');      const appDataPath = await this.ensureAppDataPath();    try {  async listProjects(): Promise<string[]> {  }    }      return null;      console.error('Failed to load project:', error);    } catch (error) {      return JSON.parse(content);      const content = await readTextFile(projectFile);      }        return null;      if (!(await exists(projectFile))) {      const projectFile = await join(appDataPath, 'projects', projectId, 'project.json');      const appDataPath = await this.ensureAppDataPath();    try {  async loadProject(projectId: string): Promise<StoryProject | null> {  }    await writeTextFile(projectFile, JSON.stringify(project, null, 2));    const projectFile = await join(projectPath, 'project.json');    }      await createDir(projectPath, { recursive: true });    if (!(await exists(projectPath))) {    // Ensure project directory exists    const projectPath = await join(appDataPath, 'projects', project.id);    const appDataPath = await this.ensureAppDataPath();  async saveProject(project: StoryProject): Promise<void> {  // Project management  }
  // Project management
  async saveProject(project: StoryProject): Promise<void> {
    const appDataPath = await this.ensureAppDataPath();
    const projectPath = await join(appDataPath, 'projects', project.id);

    // Ensure project directory exists
    if (!(await exists(projectPath))) {
      await createDir(projectPath, { recursive: true });
    }

    const projectFile = await join(projectPath, 'project.json');
    await writeTextFile(projectFile, JSON.stringify(project, null, 2));
  }

  async loadProject(projectId: string): Promise<StoryProject | null> {
    try {
      const appDataPath = await this.ensureAppDataPath();
      const projectFile = await join(appDataPath, 'projects', projectId, 'project.json');

      if (!(await exists(projectFile))) {
        return null;
      }

      const content = await readTextFile(projectFile);
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }

  async listProjects(): Promise<string[]> {
    try {
      const appDataPath = await this.ensureAppDataPath();
      const projectsPath = await join(appDataPath, 'projects');

      if (!(await exists(projectsPath))) {
        return [];
      }

      const entries = await readDir(projectsPath);
      return entries.filter(entry => entry.isDirectory).map(entry => entry.name);
    } catch (error) {
      console.error('Failed to list projects:', error);
      return [];
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    const appDataPath = await this.ensureAppDataPath();
    const projectPath = await join(appDataPath, 'projects', projectId);

    // For simplicity, we'll just remove the project.json file
    // In a full implementation, you'd want to remove the entire directory
    const projectFile = await join(projectPath, 'project.json');
    if (await exists(projectFile)) {
      await removeFile(projectFile);
    }
  }

  // Character images (replacing IndexedDB blob storage)
  async saveCharacterImage(characterId: string, imageData: string): Promise<void> {
    const appDataPath = await this.ensureAppDataPath();
    const imagesPath = await join(appDataPath, 'images', 'characters');

    if (!(await exists(imagesPath))) {
      await createDir(imagesPath, { recursive: true });
    }

    const imageFile = await join(imagesPath, `${characterId}.png`);
    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    await writeTextFile(imageFile, base64Data);
  }

  async loadCharacterImage(characterId: string): Promise<string | null> {
    try {
      const appDataPath = await this.ensureAppDataPath();
      const imageFile = await join(appDataPath, 'images', 'characters', `${characterId}.png`);

      if (!(await exists(imageFile))) {
        return null;
      }

      const base64Data = await readTextFile(imageFile);
      return `data:image/png;base64,${base64Data}`;
    } catch (error) {
      console.error('Failed to load character image:', error);
      return null;
    }
  }

  // Gemini API key storage
  async saveGeminiApiKey(apiKey: string): Promise<void> {
    const appDataPath = await this.ensureAppDataPath();
    const configPath = await join(appDataPath, 'config');

    if (!(await exists(configPath))) {
      await createDir(configPath, { recursive: true });
    }

    const keyFile = await join(configPath, 'gemini_key.txt');
    await writeTextFile(keyFile, apiKey);
  }

  async loadGeminiApiKey(): Promise<string | null> {
    try {
      const appDataPath = await this.ensureAppDataPath();
      const keyFile = await join(appDataPath, 'config', 'gemini_key.txt');

      if (!(await exists(keyFile))) {
        return null;
      }

      return await readTextFile(keyFile);
    } catch (error) {
      console.error('Failed to load Gemini API key:', error);
      return null;
    }
  }

  // Import/Export functionality
  async exportProject(project: StoryProject, format: 'json' | 'markdown' | 'docx' = 'json'): Promise<void> {
    let fileName: string;
    let content: string;
    let extension: string;

    switch (format) {
      case 'json':
        fileName = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
        content = JSON.stringify(project, null, 2);
        extension = 'json';
        break;
      case 'markdown':
        fileName = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
        content = this.convertToMarkdown(project);
        extension = 'md';
        break;
      case 'docx':
        // For docx, we'll save as markdown for now and handle conversion later
        fileName = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
        content = this.convertToMarkdown(project);
        extension = 'md';
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    const filePath = await save({
      defaultPath: `${fileName}.${extension}`,
      filters: [{
        name: format.toUpperCase(),
        extensions: [extension]
      }]
    });

    if (filePath) {
      await writeTextFile(filePath, content);
    }
  }

  async importProject(): Promise<StoryProject | null> {
    const filePath = await open({
      multiple: false,
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!filePath || Array.isArray(filePath)) {
      return null;
    }

    const content = await readTextFile(filePath);

    if (filePath.endsWith('.json')) {
      return JSON.parse(content);
    } else if (filePath.endsWith('.md') || filePath.endsWith('.markdown')) {
      return this.parseMarkdownProject(content);
    }

    throw new Error('Unsupported file format');
  }

  private convertToMarkdown(project: StoryProject): string {
    let markdown = `---
title: "${project.title}"
author: "${project.author || ''}"
description: "${project.description || ''}"
created: "${project.createdAt}"
updated: "${project.updatedAt}"
---

# ${project.title}

${project.description || ''}

## Characters

${project.characters.map(char => `### ${char.name}

${char.backstory || ''}

**Personality:** ${char.personalityTraits || ''}
**Motivation:** ${char.motivation || ''}
**Appearance:** ${char.appearance || ''}

`).join('\n')}

## Worlds

${project.worlds.map(world => `### ${world.name}

${world.description || ''}

**Setting:** ${world.setting || ''}
**Atmosphere:** ${world.atmosphere || ''}

`).join('\n')}

## Manuscript

${project.manuscript || 'No manuscript content yet.'}

`;

    return markdown;
  }

  private parseMarkdownProject(content: string): StoryProject {
    // Simple markdown parser - in a real implementation, you'd use a proper markdown parser
    const lines = content.split('\n');
    let title = 'Imported Project';
    let description = '';
    let author = '';
    let manuscript = '';

    let inFrontmatter = false;
    let inManuscript = false;

    for (const line of lines) {
      if (line.trim() === '---') {
        inFrontmatter = !inFrontmatter;
        continue;
      }

      if (inFrontmatter) {
        if (line.startsWith('title:')) {
          title = line.split(':')[1].trim().replace(/"/g, '');
        } else if (line.startsWith('author:')) {
          author = line.split(':')[1].trim().replace(/"/g, '');
        } else if (line.startsWith('description:')) {
          description = line.split(':')[1].trim().replace(/"/g, '');
        }
      } else if (line.startsWith('## Manuscript')) {
        inManuscript = true;
      } else if (inManuscript && line.startsWith('## ')) {
        inManuscript = false;
      } else if (inManuscript) {
        manuscript += line + '\n';
      }
    }

    return {
      id: Date.now().toString(),
      title,
      author,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      characters: [],
      worlds: [],
      manuscript: manuscript.trim(),
      templates: [],
      settings: {
        theme: 'dark',
        editorFont: 'serif',
        aiCreativity: 'Balanced',
        aiModel: 'gemini-1.5-flash',
        advancedAi: {
          model: 'gemini-1.5-flash',
          temperature: 0.7
        }
      }
    };
  }
}

export const fileSystemService = new FileSystemService();