// QNBS-v3: Local UI/layout state for ManuscriptView, extracted so ManuscriptViewUI orchestrates
// only rendering. Holds the nav tab, mobile drawers, desktop focus mode, and the resizable-panel
// state, plus the Escape-closes-research-split effect. Shared across the desktop + mobile layouts.
import { useEffect, useState } from 'react';
import { useTransientUiStore } from '../app/transientUiStore';
import { useResizablePanels } from './useResizablePanels';

export function useManuscriptLayout() {
  const manuscriptResearchSplitOpen = useTransientUiStore((s) => s.manuscriptResearchSplitOpen);
  const setManuscriptResearchSplitOpen = useTransientUiStore(
    (s) => s.setManuscriptResearchSplitOpen,
  );

  const [leftNavTab, setLeftNavTab] = useState<'chapters' | 'binder'>('chapters');
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isInspectorDrawerOpen, setIsInspectorDrawerOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const panels = useResizablePanels(20, 20);

  useEffect(() => {
    if (!manuscriptResearchSplitOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setManuscriptResearchSplitOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [manuscriptResearchSplitOpen, setManuscriptResearchSplitOpen]);

  return {
    leftNavTab,
    setLeftNavTab,
    isNavDrawerOpen,
    setIsNavDrawerOpen,
    isInspectorDrawerOpen,
    setIsInspectorDrawerOpen,
    isFocusMode,
    setIsFocusMode,
    manuscriptResearchSplitOpen,
    setManuscriptResearchSplitOpen,
    ...panels,
  };
}

export type UseManuscriptLayoutReturn = ReturnType<typeof useManuscriptLayout>;
