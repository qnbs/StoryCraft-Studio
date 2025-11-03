import React, { useState } from 'react';
import { World, StoryProject } from '../types';
import { ICONS } from '../constants';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card, CardContent, CardHeader } from './ui/Card';
import { generateWorldDetails } from '../services/geminiService';
import { Spinner } from './ui/Spinner';
import { useTranslation } from '../hooks/useTranslation';

interface WorldViewProps {
  project: StoryProject;
  setProject: React.Dispatch<React.SetStateAction<StoryProject>>;
}

export const WorldView: React.FC<WorldViewProps> = ({ project, setProject }) => {
  const { t } = useTranslation();
  const [editingWorld, setEditingWorld] = useState<World | null>(null);
  const [aiConcept, setAiConcept] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddNew = () => {
    const newWorld: World = {
      id: `world-${Date.now()}`,
      name: t('worlds.newWorldName'),
      description: '',
      history: '',
      geography: '',
      magicSystem: ''
    };
    setEditingWorld(newWorld);
  };

  const handleSelect = (world: World) => {
    setEditingWorld({ ...world });
  };

  const handleSave = () => {
    if (!editingWorld) return;
    setProject(p => {
      const exists = p.worlds.some(w => w.id === editingWorld.id);
      const updatedWorlds = exists
        ? p.worlds.map(w => (w.id === editingWorld.id ? editingWorld : w))
        : [...p.worlds, editingWorld];
      return { ...p, worlds: updatedWorlds };
    });
    setEditingWorld(null);
  };
    
  const handleDelete = (id: string) => {
    setProject(p => ({
        ...p,
        worlds: p.worlds.filter(w => w.id !== id)
    }));
    if(editingWorld?.id === id) {
        setEditingWorld(null);
    }
  };

  const handleFieldChange = (field: keyof World, value: string) => {
    if (editingWorld) {
      setEditingWorld({ ...editingWorld, [field]: value });
    }
  };

  const handleGenerate = async () => {
      if (!editingWorld || !aiConcept) return;
      setIsLoading(true);
      const worldDetails = await generateWorldDetails(editingWorld.name, aiConcept);
      handleFieldChange('description', worldDetails);
      setIsLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('worlds.title')}</h1>
            <p className="text-md md:text-lg text-gray-400">{t('worlds.description')}</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{ICONS.ADD}</svg>
            <span>{t('worlds.addNew')}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-semibold text-white mb-4">{t('worlds.yourWorlds')}</h2>
          <div className="space-y-2">
            {project.worlds.length > 0 ? project.worlds.map(world => (
              <div key={world.id} onClick={() => handleSelect(world)} className={`p-4 rounded-lg cursor-pointer transition-colors ${editingWorld?.id === world.id ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
                <p className="font-bold text-white">{world.name}</p>
              </div>
            )) : <p className="text-gray-400">{t('worlds.noWorlds')}</p>}
          </div>
        </div>

        <div className="md:col-span-2">
          {editingWorld ? (
            <Card>
              <CardHeader className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-white">{t('worlds.edit.title')}</h2>
                   <Button variant="danger" size="sm" onClick={() => handleDelete(editingWorld.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{ICONS.TRASH}</svg>
                  </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t('worlds.edit.name')}</label>
                  <Input value={editingWorld.name} onChange={e => handleFieldChange('name', e.target.value)} />
                </div>

                <Card className="bg-gray-700/50">
                    <CardContent className="space-y-4">
                         <label className="text-sm font-medium text-white">{t('worlds.edit.aiDescription')}</label>
                         <Textarea 
                            placeholder={t('worlds.edit.aiPlaceholder')}
                            value={aiConcept}
                            onChange={e => setAiConcept(e.target.value)}
                         />
                         <Button onClick={handleGenerate} disabled={isLoading || !aiConcept}>
                            {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">{ICONS.SPARKLES}</svg>}
                            {t('worlds.edit.generateButton')}
                         </Button>
                    </CardContent>
                </Card>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t('worlds.edit.description')}</label>
                  <Textarea value={editingWorld.description} onChange={e => handleFieldChange('description', e.target.value)} className="min-h-[150px]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t('worlds.edit.history')}</label>
                  <Textarea value={editingWorld.history} onChange={e => handleFieldChange('history', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t('worlds.edit.geography')}</label>
                  <Textarea value={editingWorld.geography} onChange={e => handleFieldChange('geography', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t('worlds.edit.magicSystem')}</label>
                  <Textarea value={editingWorld.magicSystem} onChange={e => handleFieldChange('magicSystem', e.target.value)} />
                </div>
                <div className="flex justify-end space-x-3">
                    <Button variant="secondary" onClick={() => setEditingWorld(null)}>{t('common.cancel')}</Button>
                    <Button onClick={handleSave}>{t('common.saveWorld')}</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
                <CardContent className="text-center text-gray-400 py-20">
                    <p>{t('worlds.selectWorld')}</p>
                </CardContent>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
};