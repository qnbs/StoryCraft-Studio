import { useState, useCallback } from 'react';
import { useTranslation } from './useTranslation';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAllCharacters } from '../features/project/projectSelectors';
import { projectActions, generateCharacterProfileThunk, regenerateCharacterFieldThunk, generateCharacterPortraitThunk } from '../features/project/projectSlice';
import { Character } from '../types';
import { dbService } from '../services/dbService';

export const useCharacterView = () => {
    const { t, language } = useTranslation();
    const dispatch = useAppDispatch();
    const characters = useAppSelector(selectAllCharacters);

    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiConcept, setAiConcept] = useState('');
    
    const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
    const [isRegeneratingField, setIsRegeneratingField] = useState<keyof Character | null>(null);
    const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);
    const [isRefiningPortrait, setIsRefiningPortrait] = useState(false);
    const [refinementPrompt, setRefinementPrompt] = useState('');

    const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

    const handleAddNewManually = useCallback(() => {
        dispatch(projectActions.addCharacter({ name: t('characters.newCharacterName') }));
    }, [dispatch, t]);

    const handleAddNewWithAI = useCallback(() => {
        setIsAiModalOpen(true);
    }, []);
    
    const handleGenerateProfile = useCallback(async () => {
        setIsGeneratingProfile(true);
        setIsAiModalOpen(false);

        const resultAction = await dispatch(generateCharacterProfileThunk({ concept: aiConcept, lang: language }));
        if (generateCharacterProfileThunk.fulfilled.match(resultAction)) {
            const newChar = resultAction.payload;
            dispatch(projectActions.addCharacter(newChar));
        } else {
            // Handle error
        }
        
        setIsGeneratingProfile(false);
        setAiConcept('');
    }, [dispatch, aiConcept, language]);

    const handleSelect = useCallback((character: Character) => {
        setSelectedCharacter(character);
        setIsDossierOpen(true);
    }, []);
    
    const handleFieldChange = useCallback((field: keyof Character, value: any) => {
        if (selectedCharacter) {
            const changes = { [field]: value };
            setSelectedCharacter(c => c ? { ...c, ...changes } : null);
            dispatch(projectActions.updateCharacter({ id: selectedCharacter.id, changes }));
        }
    }, [dispatch, selectedCharacter]);
    
    const handleRegenerateField = useCallback(async (field: keyof Character) => {
        if (!selectedCharacter) return;
        setIsRegeneratingField(field);
        const resultAction = await dispatch(regenerateCharacterFieldThunk({ character: selectedCharacter, field, lang: language }));
        if (regenerateCharacterFieldThunk.fulfilled.match(resultAction)) {
            handleFieldChange(resultAction.payload.field, resultAction.payload.value);
        }
        setIsRegeneratingField(null);
    }, [dispatch, selectedCharacter, language, handleFieldChange]);

    const handleGeneratePortrait = useCallback(async () => {
        if (!selectedCharacter || !selectedCharacter.appearance) return;
        setIsGeneratingPortrait(true);
        const resultAction = await dispatch(generateCharacterPortraitThunk({ characterId: selectedCharacter.id, description: selectedCharacter.appearance, lang: language }));
        if (!generateCharacterPortraitThunk.fulfilled.match(resultAction)) {
             alert(t('characters.error.portraitFailed'));
        } else {
            // Trigger re-render by updating local state, redux state will update via extraReducer
            setSelectedCharacter(c => c ? { ...c, hasAvatar: true } : null);
        }
        setIsGeneratingPortrait(false);
    }, [dispatch, selectedCharacter, language, t]);

    const handleRefinePortrait = useCallback(async () => {
        if (!selectedCharacter || !refinementPrompt) return;
        setIsRefiningPortrait(true);
        const description = `${selectedCharacter.appearance}. Refinement: ${refinementPrompt}`;
        const resultAction = await dispatch(generateCharacterPortraitThunk({ characterId: selectedCharacter.id, description, lang: language }));
        if (!generateCharacterPortraitThunk.fulfilled.match(resultAction)) {
            alert(t('characters.error.portraitFailed'));
        }
        setRefinementPrompt('');
        setIsRefiningPortrait(false);
    }, [dispatch, selectedCharacter, refinementPrompt, language, t]);

    const handleDelete = useCallback((id: string) => {
        const char = characters.find(c => c.id === id);
        if (char) {
            setCharacterToDelete(char);
        }
    }, [characters]);

    const confirmDelete = useCallback(async () => {
        if (characterToDelete) {
            await dbService.deleteImage(characterToDelete.id);
            dispatch(projectActions.deleteCharacter(characterToDelete.id));
            setCharacterToDelete(null);
            setIsDossierOpen(false);
            setSelectedCharacter(null);
        }
    }, [dispatch, characterToDelete]);

    return {
        t,
        characters,
        selectedCharacter,
        setSelectedCharacter,
        isDossierOpen,
        setIsDossierOpen,
        isAiModalOpen,
        setIsAiModalOpen,
        aiConcept,
        setAiConcept,
        isGeneratingProfile,
        isRegeneratingField,
        isGeneratingPortrait,
        isRefiningPortrait,
        refinementPrompt,
        setRefinementPrompt,
        characterToDelete,
        setCharacterToDelete,
        handleAddNewManually,
        handleAddNewWithAI,
        handleGenerateProfile,
        handleSelect,
        handleFieldChange,
        handleRegenerateField,
        handleGeneratePortrait,
        handleRefinePortrait,
        handleDelete,
        confirmDelete,
    };
};

export type UseCharacterViewReturnType = ReturnType<typeof useCharacterView>;