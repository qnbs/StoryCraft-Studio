import React from 'react';
import { ActionCreators as UndoAction } from 'redux-undo';
import { ICONS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import { SaveStatusIndicator } from './ui/SaveStatusIndicator';
import { selectCanUndo, selectCanRedo } from '../features/project/projectSelectors';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setIsSidebarOpen, isSidebarOpen }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);

  const handleUndo = () => {
    if (canUndo) {
      dispatch(UndoAction.undo());
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      dispatch(UndoAction.redo());
    }
  };

  const viewTitleMap: Record<View, string> = {
    'dashboard': 'sidebar.dashboard',
    'manuscript': 'sidebar.manuscript',
    'writer': 'sidebar.writer',
    'templates': 'sidebar.templates',
    'outline': 'sidebar.outline',
    'characters': 'sidebar.characters',
    'world': 'sidebar.world',
    'export': 'sidebar.export',
    'settings': 'sidebar.settings',
    'help': 'sidebar.help',
  };

  const pageTitle = t(viewTitleMap[currentView] || 'sidebar.dashboard');

  return (
    <header className="bg-[var(--background-secondary)]/70 backdrop-blur-md text-[var(--foreground-primary)] p-4 border-b border-[var(--border-primary)]/50 fixed top-0 left-0 right-0 z-20 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 -ml-2 mr-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)]"
          aria-label={t('header.openMenu')}
          aria-controls="sidebar"
          aria-expanded={isSidebarOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            {ICONS.MENU}
          </svg>
        </button>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
          {ICONS.WRITER}
        </svg>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">{pageTitle}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <SaveStatusIndicator />
        <div className="flex items-center space-x-2">
            <button onClick={handleUndo} disabled={!canUndo} className="p-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] disabled:opacity-40 disabled:cursor-not-allowed" aria-label={t('common.undo')} title={t('common.undo')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{ICONS.UNDO}</svg>
            </button>
            <button onClick={handleRedo} disabled={!canRedo} className="p-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] disabled:opacity-40 disabled:cursor-not-allowed" aria-label={t('common.redo')} title={t('common.redo')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{ICONS.REDO}</svg>
            </button>
        </div>
      </div>
    </header>
  );
};