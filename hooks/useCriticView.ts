import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import {
  selectAllCharacters,
  selectAllWorlds,
  selectProjectData,
  selectAiCreativity,
} from '../features/project/projectSelectors';
import { useTranslation } from '../hooks/useTranslation';
import { analyzeAsCritic, detectPlotHoles } from '../services/geminiService';

export const useCriticView = () => {
  const dispatch = useAppDispatch();
  const { t, language } = useTranslation();
  const aiCreativity = useAppSelector(selectAiCreativity);
  const characters = useAppSelector(selectAllCharacters);
  const worlds = useAppSelector(selectAllWorlds);
  const projectData = useAppSelector(selectProjectData);

  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeText = useCallback(
    async (text: string) => {
      setIsAnalyzing(true);
      try {
        const result = await analyzeAsCritic(text, aiCreativity, language);
        setAnalysisResult(result);
      } catch (error) {
        setAnalysisResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [aiCreativity, language]
  );

  const detectPlotHolesFn = useCallback(async () => {
    if (!projectData) return;

    setIsAnalyzing(true);
    try {
      const result = await detectPlotHoles(
        JSON.stringify({
          title: projectData.title,
          logline: projectData.logline,
          manuscript: projectData.manuscript,
          characters,
          worlds,
        }),
        aiCreativity,
        language
      );
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [projectData, characters, worlds, language, aiCreativity]);

  return {
    t,
    analysisResult,
    isAnalyzing,
    analyzeText,
    detectPlotHoles: detectPlotHolesFn,
  };
};
