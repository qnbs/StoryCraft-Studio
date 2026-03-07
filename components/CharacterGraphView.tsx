import React, { FC, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { useCharacterGraphView } from '../hooks/useCharacterGraphView';
import { CharacterGraphViewContext, useCharacterGraphViewContext } from '../contexts/CharacterGraphViewContext';

// Deterministische Kreis-Layout-Funktion (kein Math.random() → kein Re-render-Crash)
function computeCircleLayout(count: number, radius = 280, centerX = 400, centerY = 300) {
    if (count === 0) return [];
    return Array.from({ length: count }, (_, i) => {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        };
    });
}

const RELATIONSHIP_COLORS: Record<string, string> = {
    family: '#ef4444',
    romantic: '#ec4899',
    friend: '#3b82f6',
    enemy: '#dc2626',
    mentor: '#f59e0b',
    rival: '#8b5cf6',
    ally: '#10b981',
    acquaintance: '#6b7280',
};

function getRelationshipColor(type: string): string {
    return RELATIONSHIP_COLORS[type] || '#6b7280';
}

// Leichtgewichtiger SVG-Graph ohne externe Abhängigkeit
const CharacterGraphSVG: FC = () => {
    const { t, characters, relationships, onAddRelationship, onUpdateRelationship } = useCharacterGraphViewContext();
    const svgRef = useRef<SVGSVGElement>(null);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 600 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    // Positionen deterministisch berechnen; bei >30 Chars engere Kreise
    const positions = useMemo(() => {
        const count = characters.length;
        const radius = count > 20 ? 350 : count > 10 ? 280 : 200;
        const layout = computeCircleLayout(count, radius, 400, 320);
        const map: Record<string, { x: number; y: number }> = {};
        characters.forEach((char, i) => { map[char.id] = layout[i]; });
        return map;
    }, [characters]);

    const zoom = useCallback((delta: number) => {
        setViewBox(vb => {
            const factor = delta > 0 ? 1.15 : 0.87;
            const newW = Math.max(200, Math.min(2000, vb.w * factor));
            const newH = Math.max(150, Math.min(1500, vb.h * factor));
            return { ...vb, w: newW, h: newH };
        });
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        zoom(e.deltaY);
    }, [zoom]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.target === svgRef.current || (e.target as Element).tagName === 'svg') {
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isPanning) return;
        const dx = (e.clientX - panStart.x) * (viewBox.w / (svgRef.current?.clientWidth || 800));
        const dy = (e.clientY - panStart.y) * (viewBox.h / (svgRef.current?.clientHeight || 600));
        setViewBox(vb => ({ ...vb, x: vb.x - dx, y: vb.y - dy }));
        setPanStart({ x: e.clientX, y: e.clientY });
    }, [isPanning, panStart, viewBox]);

    const handleMouseUp = useCallback(() => setIsPanning(false), []);

    const resetView = useCallback(() => setViewBox({ x: 0, y: 0, w: 800, h: 600 }), []);

    if (characters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--foreground-muted)]">
                <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <p>Keine Charaktere vorhanden</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            {/* Zoom-Buttons */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                <button onClick={() => zoom(-1)} className="w-8 h-8 rounded bg-[var(--background-secondary)] border border-[var(--border-primary)] text-[var(--foreground-primary)] hover:bg-[var(--background-tertiary)] font-bold text-lg flex items-center justify-center">+</button>
                <button onClick={() => zoom(1)} className="w-8 h-8 rounded bg-[var(--background-secondary)] border border-[var(--border-primary)] text-[var(--foreground-primary)] hover:bg-[var(--background-tertiary)] font-bold text-lg flex items-center justify-center">−</button>
                <button onClick={resetView} title="Ansicht zurücksetzen" className="w-8 h-8 rounded bg-[var(--background-secondary)] border border-[var(--border-primary)] text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] text-xs flex items-center justify-center">⊙</button>
            </div>

            <svg
                ref={svgRef}
                className="w-full h-full cursor-grab select-none"
                style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <defs>
                    <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                        <polygon points="0 0, 6 2, 0 4" fill="#6b7280" />
                    </marker>
                </defs>

                {/* Kanten / Beziehungen */}
                {relationships.map(rel => {
                    const from = positions[rel.fromCharacterId];
                    const to = positions[rel.toCharacterId];
                    if (!from || !to) return null;
                    const color = getRelationshipColor(rel.type);
                    const mx = (from.x + to.x) / 2;
                    const my = (from.y + to.y) / 2;
                    return (
                        <g key={rel.id}>
                            <line
                                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                stroke={color}
                                strokeWidth={Math.max(1, (rel.strength || 5) / 3)}
                                strokeOpacity={0.7}
                                markerEnd="url(#arrowhead)"
                            />
                            <text x={mx} y={my - 4} textAnchor="middle" fontSize="9" fill={color} opacity={0.9}>
                                {rel.type}
                            </text>
                        </g>
                    );
                })}

                {/* Knoten / Charaktere */}
                {characters.map(char => {
                    const pos = positions[char.id];
                    if (!pos) return null;
                    const isSelected = selectedNode === char.id;
                    const r = isSelected ? 32 : 28;
                    const letters = char.name.slice(0, 2).toUpperCase();
                    return (
                        <g key={char.id} onClick={() => setSelectedNode(isSelected ? null : char.id)} style={{ cursor: 'pointer' }}>
                            <circle
                                cx={pos.x} cy={pos.y} r={r + 4}
                                fill="var(--background-secondary)"
                                stroke={isSelected ? 'var(--background-interactive)' : 'var(--border-primary)'}
                                strokeWidth={isSelected ? 3 : 1.5}
                            />
                            <circle
                                cx={pos.x} cy={pos.y} r={r}
                                fill={isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)'}
                            />
                            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="var(--foreground-primary)">
                                {letters}
                            </text>
                            <text x={pos.x} y={pos.y + r + 14} textAnchor="middle" fontSize="10" fill="var(--foreground-secondary)">
                                {char.name.length > 12 ? char.name.slice(0, 11) + '…' : char.name}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Hinweis bei vielen Charakteren */}
            {characters.length > 30 && (
                <div className="absolute bottom-2 left-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1">
                    {characters.length} Charaktere – Scroll zum Zoomen, Ziehen zum Verschieben
                </div>
            )}
        </div>
    );
};

const CharacterGraphUI: FC = () => {
    const { t, characters, relationships, onAddRelationship, onUpdateRelationship } = useCharacterGraphViewContext();

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4 flex items-center justify-between flex-shrink-0">
                <h1 className="text-2xl font-bold text-[var(--foreground-primary)]">{t('characterGraph.title')}</h1>
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                    <span>{characters.length} Charaktere · {relationships.length} Beziehungen</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow min-h-0">
                {/* Graph */}
                <div className="lg:col-span-3">
                    <Card className="h-full min-h-[400px]">
                        <CardContent className="p-0 h-full min-h-[400px] rounded-xl overflow-hidden">
                            <CharacterGraphSVG />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Legende + Beziehungsliste */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto">
                    <Card>
                        <CardHeader>
                            <h3 className="text-sm font-semibold text-[var(--foreground-primary)]">{t('characterGraph.legend')}</h3>
                        </CardHeader>
                        <CardContent className="space-y-1 pt-0">
                            {Object.entries(RELATIONSHIP_COLORS).map(([type, color]) => (
                                <div key={type} className="flex items-center text-xs text-[var(--foreground-secondary)] gap-2">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                    <span className="capitalize">{type}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {relationships.length > 0 && (
                        <Card>
                            <CardHeader>
                                <h3 className="text-sm font-semibold text-[var(--foreground-primary)]">{t('characterGraph.relationships')}</h3>
                            </CardHeader>
                            <CardContent className="space-y-2 pt-0 max-h-64 overflow-y-auto">
                                {relationships.map(rel => {
                                    const fromChar = characters.find(c => c.id === rel.fromCharacterId);
                                    const toChar = characters.find(c => c.id === rel.toCharacterId);
                                    const color = getRelationshipColor(rel.type);
                                    return (
                                        <div key={rel.id} className="p-2 rounded-md border border-[var(--border-primary)] text-xs space-y-1">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                                <span className="font-medium text-[var(--foreground-primary)] truncate">{fromChar?.name}</span>
                                                <span className="text-[var(--foreground-muted)]">→</span>
                                                <span className="font-medium text-[var(--foreground-primary)] truncate">{toChar?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="capitalize text-[var(--foreground-muted)]">{rel.type}</span>
                                                <input
                                                    type="range" min="1" max="10"
                                                    value={rel.strength || 5}
                                                    onChange={e => onUpdateRelationship(rel.id, { strength: parseInt(e.target.value) })}
                                                    className="flex-1 h-1 accent-indigo-500"
                                                />
                                                <span className="text-[var(--foreground-muted)] w-4 text-right">{rel.strength || 5}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}
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
