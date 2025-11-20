import { useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from './useTranslation';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectProjectData, selectManuscript, selectAllCharacters } from '../features/project/projectSelectors';
import { writerActions, WriterState } from '../features/writer/writerSlice';
import { projectActions, streamGenerationThunk } from '../features/project/projectSlice';

export const useWriterView = () => {
    const { t, language } = useTranslation();
    const dispatch = useAppDispatch();
    const project = useAppSelector(selectProjectData);
    const characters = useAppSelector(selectAllCharacters);
    const manuscript = useAppSelector(selectManuscript);
    const writerState = useAppSelector((state) => state.writer);

    const { activeTool, selection, dialogueCharacters, scenario, brainstormContext, tone, style, isLoading, generationHistory, activeHistoryIndex } = writerState;
    
    // Ref to hold the abort controller for the current generation request
    const abortControllerRef = useRef<AbortController | null>(null);

    const selectedSectionId = useMemo(() => {
        // If there's a valid selection in state, use it. Otherwise, default to the first section.
        return writerState.selectedSectionId && manuscript.some(s => s.id === writerState.selectedSectionId)
            ? writerState.selectedSectionId
            : manuscript[0]?.id || null;
    }, [writerState.selectedSectionId, manuscript]);
    
    // Effect to dispatch the default selection if it's not set
    useEffect(() => {
        if (selectedSectionId && !writerState.selectedSectionId) {
            dispatch(writerActions.setSelectedSectionId(selectedSectionId));
        }
    }, [selectedSectionId, writerState.selectedSectionId, dispatch]);

    // Cleanup function to abort any pending requests when unmounting or changing view
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            dispatch(writerActions.stopLoading());
        };
    }, [dispatch]);

    const handleContentChange = useCallback((index: number, content: string) => {
        const sectionId = manuscript[index].id;
        dispatch(projectActions.updateManuscriptSection({ id: sectionId, changes: { content } }));
    }, [dispatch, manuscript]);

    const isGenerateDisabled = useCallback(() => {
        if (isLoading) return true;
        if (activeTool === 'improve' || activeTool === 'changeTone') return !selection.text;
        if (activeTool === 'dialogue') return dialogueCharacters.length === 0 || !scenario;
        return !selectedSectionId;
    }, [isLoading, activeTool, selection.text, dialogueCharacters, scenario, selectedSectionId]);

    const getPromptForTool = useCallback((): string => {
        const selectedSection = manuscript.find(s => s.id === selectedSectionId);
        const content = selectedSection?.content || '';

        switch (activeTool) {
            case 'continue':
                const context = content.substring(0, selection.start);
                return `Continue writing this story in a ${style || 'compelling'} style. Here is the last part:\n\n"${context}"`;
            case 'improve':
                return `Improve the following text to be more ${style || 'engaging'}:\n\n"${selection.text}"`;
            case 'changeTone':
                return `Rewrite the following text in a ${tone || 'different'} tone:\n\n"${selection.text}"`;
            case 'dialogue':
                const charNames = dialogueCharacters.map(c => c.name).join(' and ');
                return `Write a piece of dialogue between ${charNames}. The scenario is: ${scenario}. The dialogue should be placed at the current cursor location in the text:\n\n${content}`;
            case 'brainstorm':
                const brainstormInput = brainstormContext || content;
                return `Brainstorm 3-5 interesting plot points or ideas for what could happen next, based on this context:\n\n"${brainstormInput}"`;
             case 'synopsis':
                return `Write a concise, one-paragraph synopsis of the following text from a story. Capture the key events, character actions, and tone of the passage.\n\nText:\n"""\n${content}\n"""\n`;
            default: return '';
        }
    }, [manuscript, selectedSectionId, activeTool, selection, style, tone, dialogueCharacters, scenario, brainstormContext]);

    const handleGenerate = useCallback(() => {
        // If already loading, checking explicitly to act as a "Stop" toggle
        if (isLoading) {
             if (abortControllerRef.current) {
                 abortControllerRef.current.abort();
             }
             dispatch(writerActions.stopLoading());
             return;
        }

        if (isGenerateDisabled()) return;
        
        // Create new controller
        abortControllerRef.current = new AbortController();
        
        const prompt = getPromptForTool();
        if (!prompt) return;

        dispatch(writerActions.startLoading());
        let fullStream = "";
        
        const onChunk = (chunk: string) => {
            fullStream += chunk;
            dispatch(writerActions.updateCurrentHistoryItem(fullStream));
        };
        
        dispatch(writerActions.addHistory("")); // Add empty item to start
        
        dispatch(streamGenerationThunk({ 
            prompt, 
            lang: language, 
            onChunk, 
            signal: abortControllerRef.current.signal 
        }))
        .unwrap() // Unwrap to handle errors locally if needed
        .catch((err) => {
            if (err.name !== 'AbortError') {
                console.error("Generation failed", err);
                dispatch(writerActions.updateCurrentHistoryItem("Error generating content. Please try again later or check your API key."));
            } else {
                // User cancelled
                dispatch(writerActions.updateCurrentHistoryItem(fullStream + " [Cancelled]"));
            }
        })
        .finally(() => {
            dispatch(writerActions.stopLoading());
            abortControllerRef.current = null;
        });
    }, [dispatch, isLoading, isGenerateDisabled, getPromptForTool, language]);
    
    const handleNavigateHistory = useCallback((direction: 'prev' | 'next') => {
        dispatch(writerActions.navigateHistory(direction));
    }, [dispatch]);

    const handleUpdateScratchpad = useCallback((text: string) => {
        dispatch(writerActions.updateCurrentHistoryItem(text));
    }, [dispatch]);
    
    const handleAccept = useCallback((action: 'insert' | 'replace') => {
        const selectedSectionIndex = manuscript.findIndex(s => s.id === selectedSectionId);
        if (selectedSectionIndex === -1) return;
        
        const section = manuscript[selectedSectionIndex];
        const currentResult = generationHistory[activeHistoryIndex] || '';

        let newContent = '';
        if (action === 'insert') {
            newContent = section.content.substring(0, selection.start) + currentResult + section.content.substring(selection.start);
        } else { // replace
            newContent = section.content.substring(0, selection.start) + currentResult + section.content.substring(selection.end);
        }
        
        handleContentChange(selectedSectionIndex, newContent);
    }, [manuscript, selectedSectionId, generationHistory, activeHistoryIndex, selection, handleContentChange]);

    const projectForContext = useMemo(() => ({
        ...project,
        characters,
    }), [project, characters]);

    return {
        t,
        project: projectForContext,
        writerState,
        selectedSectionId,
        dispatch,
        handleContentChange,
        isGenerateDisabled,
        handleGenerate,
        handleNavigateHistory,
        handleUpdateScratchpad,
        handleAccept,
    };
};

export type UseWriterViewReturnType = ReturnType<typeof useWriterView>;