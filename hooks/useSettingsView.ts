import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Theme, EditorFont, AiCreativity, StoryProject, ProjectSnapshot } from '../types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { settingsActions } from '../features/settings/settingsSlice';
import { projectActions, importProjectThunk, restoreSnapshotThunk } from '../features/project/projectSlice';
import { selectProjectData, selectAllCharacters, selectAllWorlds } from '../features/project/projectSelectors';
import { dbService } from '../services/dbService';

type ModalState = 'closed' | 'reset' | 'restore' | 'delete' | 'create';
type ModalPayload = { id?: number; name?: string; date?: string; wordCount?: number; };

export const useSettingsView = () => {
  const { t, language, setLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const projectState = useAppSelector((state) => state.project.present);
  const project = projectState.data;
  const characters = selectAllCharacters({ project: { present: projectState } } as any);
  const worlds = selectAllWorlds({ project: { present: projectState } } as any);
  
  const [activeCategory, setActiveCategory] = useState('data');
  const [modal, setModal] = useState<{ state: ModalState, payload: ModalPayload }>({ state: 'closed', payload: {} });
  const importFileRef = useRef<HTMLInputElement>(null);
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [snapshotName, setSnapshotName] = useState('');

  const refreshSnapshots = useCallback(async () => {
    const snaps = await dbService.listSnapshots();
    setSnapshots(snaps);
  }, []);

  useEffect(() => {
    if (activeCategory === 'data') {
      refreshSnapshots();
    }
  }, [activeCategory, refreshSnapshots]);
  
  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'en' | 'de');
  }, [setLanguage]);

  const handleSettingChange = useCallback((key: keyof typeof settings, value: string | number | boolean) => {
    switch(key) {
        case 'theme': dispatch(settingsActions.setTheme(value as Theme)); break;
        case 'editorFont': dispatch(settingsActions.setEditorFont(value as EditorFont)); break;
        case 'fontSize': dispatch(settingsActions.setFontSize(Number(value))); break;
        case 'lineSpacing': dispatch(settingsActions.setLineSpacing(Number(value))); break;
        case 'aiCreativity': dispatch(settingsActions.setAiCreativity(value as AiCreativity)); break;
        case 'paragraphSpacing': dispatch(settingsActions.setParagraphSpacing(Number(value))); break;
        case 'indentFirstLine': dispatch(settingsActions.setIndentFirstLine(Boolean(value))); break;
    }
  }, [dispatch]);

  const projectSize = useMemo(() => {
    const size = new TextEncoder().encode(JSON.stringify(project)).length;
    return `${(size / 1024).toFixed(2)} KB`;
  }, [project]);
  
  const currentWordCount = useMemo(() => {
    return project.manuscript.reduce((sum, section) => sum + (section.content?.split(/\s+/).filter(Boolean).length || 0), 0);
  }, [project.manuscript]);

  const handleExport = useCallback(() => {
    if (!project) return;
    const projectToExport: StoryProject = {
      ...project,
      characters,
      worlds,
    };
    const dataStr = JSON.stringify(projectToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `${project.title.replace(/\s+/g, '_')}_backup.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [project, characters, worlds]);
  
  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const resultAction = await dispatch(importProjectThunk(file));
      if (importProjectThunk.fulfilled.match(resultAction)) {
        alert(t('settings.data.importSuccess'));
      } else {
        alert(t('settings.data.importError'));
      }
    }
    if(event.target) event.target.value = '';
  }, [dispatch, t]);

  const handleResetProject = useCallback(() => {
    dispatch(projectActions.resetProject({ title: t('initialProject.title'), logline: t('initialProject.logline') }));
    setModal({ state: 'closed', payload: {} });
  }, [dispatch, t]);
  
  const handleCreateSnapshot = useCallback(async () => {
      await dbService.createSnapshot(project, snapshotName);
      setSnapshotName('');
      setModal({ state: 'closed', payload: {} });
      refreshSnapshots();
  }, [project, snapshotName, refreshSnapshots]);
  
  const handleRestoreSnapshot = useCallback(async () => {
      if (modal.payload.id) {
          await dispatch(restoreSnapshotThunk(modal.payload.id));
          setModal({ state: 'closed', payload: {} });
      }
  }, [dispatch, modal.payload.id]);

  const handleDeleteSnapshot = useCallback(async () => {
    if (modal.payload.id) {
        await dbService.deleteSnapshot(modal.payload.id);
        setModal({ state: 'closed', payload: {} });
        refreshSnapshots();
    }
  }, [modal.payload.id, refreshSnapshots]);

  return {
    t,
    language,
    settings,
    project,
    activeCategory,
    setActiveCategory,
    modal,
    setModal,
    importFileRef,
    snapshots,
    snapshotName,
    setSnapshotName,
    handleLanguageChange,
    handleSettingChange,
    handleExport,
    handleImport,
    handleResetProject,
    handleCreateSnapshot,
    handleRestoreSnapshot,
    handleDeleteSnapshot,
    projectSize,
    currentWordCount,
  };
};

export type UseSettingsViewReturnType = ReturnType<typeof useSettingsView>;
