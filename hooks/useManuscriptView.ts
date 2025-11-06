import { useState, useMemo, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectProjectData, selectAllCharacters, selectAllWorlds } from '../features/project/projectSelectors';
import { projectActions, generateLoglineSuggestionsThunk } from '../features/project/projectSlice';
import { useTranslation } from './useTranslation';
import { Character, StorySection, View, World } from '../types';
import { useToast } from '../components/ui/Toast';

export const useManuscriptView = ({ onNavigate }: { onNavigate: (view: View) => void }) => {
  const { t, language } = useTranslation();
  const dispatch = useAppDispatch();
  const project = useAppSelector(selectProjectData);
  const manuscript = useAppSelector((state) => state.project.present.data.manuscript);
  const characters = useAppSelector(selectAllCharacters);
  const worlds = useAppSelector(selectAllWorlds);
  const toast = useToast();

  const [activeSectionId, setActiveSectionId] = useState<string | null>(manuscript?.[0]?.id || null);
  const [isLoglineModalOpen, setIsLoglineModalOpen] = useState(false);
  const [loglineSuggestions, setLoglineSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Drag and drop state
  const draggedItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Mention state
  const [mentions, setMentions] = useState<(Character & { type: 'character' })[] | (World & { type: 'world' })[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState<{ top: number, left: number } | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);


  const activeSection = useMemo(() => {
      if (!activeSectionId) return manuscript?.[0];
      return manuscript.find(s => s.id === activeSectionId) || manuscript?.[0];
  }, [activeSectionId, manuscript]);

  const activeSectionWordCount = useMemo(() => {
    if (!activeSection) return 0;
    return activeSection.content?.match(/\S+/g)?.length || 0;
  }, [activeSection]);
  
  const handleContentChange = useCallback((id: string, content: string) => {
    dispatch(projectActions.updateManuscriptSection({ id, changes: { content }}));

    // Mention logic
    if (editorRef.current) {
        const cursor = editorRef.current.selectionStart;
        const textBeforeCursor = content.substring(0, cursor);
        const mentionMatch = textBeforeCursor.match(/([@#])(\w*)$/);

        if (mentionMatch) {
            const [_, symbol, query] = mentionMatch;
            setMentionQuery(query.toLowerCase());
            
            const suggestions = symbol === '@'
                ? characters.filter(c => c.name.toLowerCase().startsWith(query.toLowerCase())).map(c => ({...c, type: 'character' as const}))
                : worlds.filter(w => w.name.toLowerCase().startsWith(query.toLowerCase())).map(w => ({...w, type: 'world' as const}));

            if(suggestions.length > 0) {
                 setMentions(suggestions as any);
                 // This part is tricky. Calculating position would ideally need a library.
                 // For now, a simplified approach:
                 const rect = editorRef.current.getBoundingClientRect();
                 setMentionPosition({ top: rect.height / 2, left: rect.width / 2 }); // Placeholder position
            } else {
                setMentions([]);
            }
        } else {
            setMentions([]);
        }
    }
  }, [dispatch, characters, worlds]);
  
  const handleMentionSelect = (item: { id: string, name: string }) => {
    if (!activeSection || !editorRef.current) return;
    
    const cursor = editorRef.current.selectionStart;
    const textBeforeCursor = activeSection.content.substring(0, cursor);
    const textAfterCursor = activeSection.content.substring(cursor);
    
    const mentionMatch = textBeforeCursor.match(/([@#])(\w*)$/);
    if (mentionMatch) {
        const startIndex = mentionMatch.index || 0;
        const newText = textBeforeCursor.substring(0, startIndex) + `${mentionMatch[1]}${item.name} ` + textAfterCursor;
        handleContentChange(activeSection.id, newText);
    }
    setMentions([]);
    editorRef.current?.focus();
  };

  const handleDragSort = useCallback(() => {
    if (draggedItem.current === null || dragOverItem.current === null) return;
    const newManuscript = [...manuscript];
    const [reorderedItem] = newManuscript.splice(draggedItem.current, 1);
    newManuscript.splice(dragOverItem.current, 0, reorderedItem);
    dispatch(projectActions.setManuscript(newManuscript));
    draggedItem.current = null;
    dragOverItem.current = null;
    setDraggingIndex(null);
  }, [manuscript, dispatch]);

  const handleGenerateLoglines = async () => {
    setIsAiLoading(true);
    setLoglineSuggestions([]);
    setIsLoglineModalOpen(true);
    try {
      const result = await dispatch(generateLoglineSuggestionsThunk(language)).unwrap();
      setLoglineSuggestions(result || []);
    } catch (e: any) {
      toast.error(t('error.apiErrorTitle'), typeof e === 'string' ? e : t('error.apiErrorDescription'));
      setIsLoglineModalOpen(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  const selectLogline = (logline: string) => {
    dispatch(projectActions.updateLogline(logline));
    setIsLoglineModalOpen(false);
  };
  
  return {
    t,
    project,
    manuscript,
    characters,
    worlds,
    dispatch,
    activeSectionId,
    setActiveSectionId,
    activeSection,
    activeSectionWordCount,
    handleContentChange,
    isLoglineModalOpen,
    setIsLoglineModalOpen,
    loglineSuggestions,
    isAiLoading,
    handleGenerateLoglines,
    selectLogline,
    // Drag & Drop
    draggedItem,
    dragOverItem,
    handleDragSort,
    draggingIndex,
    setDraggingIndex,
    // Mentions
    mentions,
    mentionQuery,
    mentionPosition,
    handleMentionSelect,
    setCursorPosition,
    editorRef,
  };
};

export type UseManuscriptViewReturnType = ReturnType<typeof useManuscriptView>;