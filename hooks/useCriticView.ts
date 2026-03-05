import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectAllCharacters, selectAllWorlds, selectProjectData } from '../features/project/projectSelectors';
import { useTranslation } from '../hooks/useTranslation';
import { analyzeAsCritic, detectPlotHoles } from '../services/geminiService';
import { AiCreativity } from '../types';

export const useCriticView = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const characters = useAppSelector(selectAllCharacters);
  const worlds = useAppSelector(selectAllWorlds);
  const projectData = useAppSelector(selectProjectData);

  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeText = useCallback(async (text: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeAsCritic(
        text,
        undefined, // context
        'en', // TODO: get from settings
        'Balanced' as AiCreativity
      );
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const detectPlotHolesFn = useCallback(async () => {
    if (!projectData) return;

    setIsAnalyzing(true);
    try {
      const result = await detectPlotHoles(
        {
          title: projectData.title,
          logline: projectData.logline,
          manuscript: projectData.manuscript,
          characters,
          worlds,
        },
        'en', // TODO: get from settings
        'Balanced' as AiCreativity
      );
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [projectData, characters, worlds]);

  return {
    t,
    analysisResult,
    isAnalyzing,
    analyzeText,
    detectPlotHoles: detectPlotHolesFn,
  };
};