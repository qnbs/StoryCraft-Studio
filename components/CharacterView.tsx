import React, { useState } from 'react';
import { Character, StoryProject } from '../types';
import { ICONS } from '../constants';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card, CardContent, CardHeader } from './ui/Card';
import { generateCharacterProfile } from '../services/geminiService';
import { Spinner } from './ui/Spinner';
import { useTranslation } from '../hooks/useTranslation';

interface CharacterViewProps {
  project: StoryProject;
  setProject: React.Dispatch<React.SetStateAction<StoryProject>>;
}

export const CharacterView: React.FC<CharacterViewProps> = ({ project, setProject }) => {
  const { t } = useTranslation();
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [aiConcept, setAiConcept] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddNew = () => {
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: t('characters.newCharacterName'),
      backstory: '',
      motivation: '',
      appearance: '',
      notes: ''
    };
    setEditingCharacter(newChar);
  };

  const handleSelect = (character: Character) => {
    setEditingCharacter({ ...character });
  };

  const handleSave = () => {
    if (!editingCharacter) return;
    setProject(p => {
      const exists = p.characters.some(c => c.id === editingCharacter.id);
      const updatedCharacters = exists
        ? p.characters.map(c => c.id === editingCharacter.id ? editingCharacter : c)
        : [...p.characters, editingCharacter];
      return { ...p, characters: updatedCharacters };
    });
    setEditingCharacter(null);
  };
    
  const handleDelete = (id: string) => {
      setProject(p => ({
          ...p,
          characters: p.characters.filter(c => c.id !== id)
      }));
      if(editingCharacter?.id === id) {
          setEditingCharacter(null);
      }
  };

  const handleFieldChange = (field: keyof Character, value: string) => {
    if (editingCharacter) {
      setEditingCharacter({ ...editingCharacter, [field]: value });
    }
  };

  const handleGenerate = async () => {
      if (!editingCharacter || !aiConcept) return;
      setIsLoading(true);
      const profileText = await generateCharacterProfile(editingCharacter.name, aiConcept);
      handleFieldChange('backstory', profileText);
      setIsLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('characters.title')}</h1>
            <p className="text-md md:text-lg text-gray-400">{t('characters.description')}</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{ICONS.ADD}</svg>
            <span>{t('characters.addNew')}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-semibold text-white mb-4">{t('characters.yourCharacters')}</h2>
          <div className="space-y-2">
            {project.characters.length > 0 ? project.characters.map(char => (
              <div key={char.id} onClick={() => handleSelect(char)} className={`p-4 rounded-lg cursor-pointer transition-colors ${editingCharacter?.id === char.id ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
                <p className="font-bold text-white">{char.name}</p>
              </div>
            )) : <p className="text-gray-400">{t('characters.noCharacters')}</p>}
          </div>
        </div>

        <div className="md:col-span-2">
          {editingCharacter ? (
            <Card>
              <CardHeader className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-white">{t('characters.edit.title')}</h2>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(editingCharacter.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{ICONS.TRASH}</svg>
                  </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t('characters.edit.name')}</label>
                  <Input value={editingCharacter.name} onChange={e => handleFieldChange('name', e.target.value)} />
                </div>
                
                <Card className="bg-gray-700/50">
                    <CardContent className="space-y-4">
                         <label className="text-sm font-medium text-white">{t('characters.edit.aiBackstory')}</label>
                         <Textarea 
                            placeholder={t('characters.edit.aiPlaceholder')}
                            value={aiConcept}
                            onChange={e => setAiConcept(e.target.value)}
                         />
                         <Button onClick={handleGenerate} disabled={isLoading || !aiConcept}>
                            {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">{ICONS.SPARKLES}</svg>}
                            {t('characters.edit.generateButton')}
                         </Button>
                    </CardContent>
                </Card>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t('characters.edit.backstory')}</label>
                  <Textarea value={editingCharacter.backstory} onChange={e => handleFieldChange('backstory', e.target.value)} className="min-h-[150px]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t('characters.edit.motivation')}</label>
                  <Textarea value={editingCharacter.motivation} onChange={e => handleFieldChange('motivation', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t('characters.edit.appearance')}</label>
                  <Textarea value={editingCharacter.appearance} onChange={e => handleFieldChange('appearance', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t('characters.edit.notes')}</label>
                  <Textarea value={editingCharacter.notes} onChange={e => handleFieldChange('notes', e.target.value)} />
                </div>
                <div className="flex justify-end space-x-3">
                    <Button variant="secondary" onClick={() => setEditingCharacter(null)}>{t('common.cancel')}</Button>
                    <Button onClick={handleSave}>{t('common.saveCharacter')}</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
             <Card>
                <CardContent className="text-center text-gray-400 py-20">
                    <p>{t('characters.selectCharacter')}</p>
                </CardContent>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
};