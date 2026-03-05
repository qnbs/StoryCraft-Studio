import React, { FC, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Spinner } from './ui/Spinner';
import { useCharacterGraphView } from '../hooks/useCharacterGraphView';
import { CharacterGraphViewContext, useCharacterGraphViewContext } from '../contexts/CharacterGraphViewContext';
import ReactFlow, { Node, Edge, addEdge, Connection, useNodesState, useEdgesState, Controls, Background, MiniMap } from 'react-flow';

// Custom Node Component
const CharacterNode: FC<{ data: any }> = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex items-center">
        {data.avatar && (
          <img src={data.avatar} alt={data.name} className="w-8 h-8 rounded-full mr-2" />
        )}
        <div>
          <div className="text-sm font-bold">{data.name}</div>
          <div className="text-xs text-gray-500">{data.role}</div>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  characterNode: CharacterNode,
};

const CharacterGraphUI: FC = () => {
  const { t, characters, relationships, onConnect, onAddRelationship, onUpdateRelationship } = useCharacterGraphViewContext();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert characters and relationships to React Flow format
  const flowNodes: Node[] = useMemo(() => {
    return characters.map((char, index) => ({
      id: char.id,
      type: 'characterNode',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        name: char.name,
        role: char.personalityTraits,
        avatar: char.hasAvatar ? `/api/images/${char.id}` : null,
      },
    }));
  }, [characters]);

  const flowEdges: Edge[] = useMemo(() => {
    return relationships.map(rel => ({
      id: rel.id,
      source: rel.fromCharacterId,
      target: rel.toCharacterId,
      label: rel.type,
      type: 'smoothstep',
      style: { strokeWidth: rel.strength, stroke: getRelationshipColor(rel.type) },
    }));
  }, [relationships]);

  const onConnectCallback = useCallback((params: Connection) => {
    if (params.source && params.target) {
      onAddRelationship(params.source, params.target, 'friend', 5);
    }
  }, [onAddRelationship]);

  const getRelationshipColor = (type: string) => {
    const colors: { [key: string]: string } = {
      family: '#ef4444',
      romantic: '#ec4899',
      friend: '#3b82f6',
      enemy: '#dc2626',
      mentor: '#f59e0b',
      rival: '#8b5cf6',
      ally: '#10b981',
      acquaintance: '#6b7280',
    };
    return colors[type] || '#6b7280';
  };

  return (
    <div className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground-primary)]">{t('characterGraph.title')}</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            Auto Layout
          </Button>
          <Button>
            Add Relationship
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnectCallback}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="top-right"
              >
                <Controls />
                <MiniMap />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t('characterGraph.relationships')}</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              {relationships.map(rel => {
                const fromChar = characters.find(c => c.id === rel.fromCharacterId);
                const toChar = characters.find(c => c.id === rel.toCharacterId);
                return (
                  <div key={rel.id} className="p-2 border rounded">
                    <div className="text-sm">
                      <span className="font-medium">{fromChar?.name}</span>
                      <span className="mx-1 text-gray-500">→</span>
                      <span className="font-medium">{toChar?.name}</span>
                    </div>
                    <div className="text-xs text-gray-600 capitalize">{rel.type}</div>
                    <div className="flex items-center mt-1">
                      <span className="text-xs mr-2">Strength:</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={rel.strength}
                        onChange={(e) => onUpdateRelationship(rel.id, { strength: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-xs ml-2">{rel.strength}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t('characterGraph.legend')}</h3>
            </CardHeader>
            <CardContent className="space-y-1">
              {Object.entries({
                family: 'Family',
                romantic: 'Romantic',
                friend: 'Friend',
                enemy: 'Enemy',
                mentor: 'Mentor',
                rival: 'Rival',
                ally: 'Ally',
                acquaintance: 'Acquaintance',
              }).map(([type, label]) => (
                <div key={type} className="flex items-center text-sm">
                  <div
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: getRelationshipColor(type) }}
                  />
                  {label}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const CharacterGraphView: FC = () => {
  const contextValue = useCharacterGraphView();
  return (
    <CharacterGraphViewContext.Provider value={contextValue}>
      <CharacterGraphUI />
    </CharacterGraphViewContext.Provider>
  );
};