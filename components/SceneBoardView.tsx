import React, { FC, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Spinner } from './ui/Spinner';
import { ICONS } from '../constants';
import { useSceneBoardView } from '../hooks/useSceneBoardView';
import { SceneBoardViewContext, useSceneBoardViewContext } from '../contexts/SceneBoardViewContext';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SceneCard } from './ui/SceneCard';

// --- SUB-COMPONENTS ---

const SceneCard: FC<{
  section: any;
  characters: any[];
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
}> = ({ section, characters, onUpdate, onDelete, onMove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: section.title,
    summary: section.summary || '',
    color: section.color || '#3b82f6',
    status: section.status || 'draft'
  });

  const handleSave = () => {
    onUpdate(section.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: section.title,
      summary: section.summary || '',
      color: section.color || '#3b82f6',
      status: section.status || 'draft'
    });
    setIsEditing(false);
  };

  const linkedCharacters = characters.filter(char => section.characterIds?.includes(char.id));

  return (
    <Card
      className="w-80 h-64 cursor-move hover:shadow-lg transition-shadow"
      style={{ backgroundColor: `${editData.color}20`, borderColor: editData.color }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <Input
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="text-sm font-semibold"
            />
          ) : (
            <h3 className="text-sm font-semibold truncate">{section.title}</h3>
          )}
          <div className="flex items-center space-x-1">
            <div
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: editData.color }}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className="p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editData.summary}
              onChange={(e) => setEditData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Scene summary..."
              className="text-xs h-16 resize-none"
            />
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={editData.color}
                onChange={(e) => setEditData(prev => ({ ...prev, color: e.target.value }))}
                className="w-8 h-8 rounded border"
              />
              <Select
                value={editData.status}
                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                className="text-xs"
              >
                <option value="draft">Draft</option>
                <option value="outline">Outline</option>
                <option value="first-draft">First Draft</option>
                <option value="revised">Revised</option>
                <option value="final">Final</option>
              </Select>
            </div>
            <div className="flex justify-end space-x-1">
              <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 line-clamp-3">{section.summary || 'No summary yet...'}</p>
            {linkedCharacters.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {linkedCharacters.map(char => (
                  <span key={char.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    @{char.name}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{section.wordCount || 0} words</span>
              <span className="capitalize">{section.status || 'draft'}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SceneBoardUI: FC = () => {
  const { t, project, sections, characters, handleUpdateSection, handleDeleteSection, handleMoveSection } = useSceneBoardViewContext();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    setActiveId(null);

    if (delta.x !== 0 || delta.y !== 0) {
      handleMoveSection(active.id as string, {
        x: (sections.find(s => s.id === active.id)?.position?.x || 0) + delta.x,
        y: (sections.find(s => s.id === active.id)?.position?.y || 0) + delta.y,
      });
    }
  }, [sections, handleMoveSection]);

  if (!project) return <div className="flex h-[80vh] w-full items-center justify-center"><Spinner className="w-16 h-16" /></div>;

  return (
    <div className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground-primary)]">{t('sceneboard.title')}</h1>
        <Button>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            {ICONS.ADD}
          </svg>
          Add Scene
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="relative w-full h-[calc(100vh-200px)] bg-gray-50 rounded-lg overflow-hidden">
          <div className="absolute inset-0 p-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="absolute"
                style={{
                  left: section.position?.x || 0,
                  top: section.position?.y || 0,
                }}
              >
                <SceneCard
                  section={section}
                  characters={characters}
                  onUpdate={handleUpdateSection}
                  onDelete={handleDeleteSection}
                  onMove={handleMoveSection}
                />
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <SceneCard
              section={sections.find(s => s.id === activeId)!}
              characters={characters}
              onUpdate={() => {}}
              onDelete={() => {}}
              onMove={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export const SceneBoardView: FC = () => {
  const contextValue = useSceneBoardView();
  return (
    <SceneBoardViewContext.Provider value={contextValue}>
      <SceneBoardUI />
    </SceneBoardViewContext.Provider>
  );
};