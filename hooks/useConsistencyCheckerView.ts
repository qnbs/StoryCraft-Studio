import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectAllCharacters, selectAllWorlds, selectProjectData } from '../features/project/projectSelectors';
import { useTranslation } from '../hooks/useTranslation';
import { checkConsistency } from '../services/geminiService';
import { AiCreativity } from '../types';

export const useConsistencyCheckerView = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const characters = useAppSelector(selectAllCharacters);
  const worlds = useAppSelector(selectAllWorlds);
  const projectData = useAppSelector(selectProjectData);

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  const runCheck = useCallback(async (characterId: string) => {
    if (!projectData) return;

    setIsChecking(true);
    try {
      const result = await checkConsistency(
        characterId,
        characters,
        worlds,
        projectData.manuscript,
        projectData.relationships || [],
        'en', // TODO: get from settings
        'Balanced' as AiCreativity
      );
      setCheckResult(result);
    } catch (error) {
      setCheckResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsChecking(false);
    }
  }, [characters, worlds, projectData]);

  return {
    t,
    characters,
    selectedCharacterId,
    setSelectedCharacterId,
    checkResult,
    isChecking,
    runCheck,
  };
};