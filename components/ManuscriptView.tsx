import React, { FC, useState, useRef, useCallback, ReactNode, useMemo } from 'react';
import { Character, World } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { ICONS } from '../constants';
import { Button } from './ui/Button';
import { Drawer } from './ui/Drawer';
import { Modal } from './ui/Modal';
import { Spinner } from './ui/Spinner';
import { DebouncedTextarea } from './ui/DebouncedTextarea';
import { DebouncedInput } from './ui/DebouncedInput';
import { projectActions } from '../features/project/projectSlice';
import { useManuscriptView } from '../hooks/useManuscriptView';
import { ManuscriptViewContext, useManuscriptViewContext } from '../contexts/ManuscriptViewContext';
import { Textarea } from './ui/Textarea';
import { useAppSelector } from '../app/hooks';


// --- Custom Hook for Resizable Panels ---
const useResizablePanels = (initialLeft = 25, initialRight = 25) => {
    const [leftPanelWidth, setLeftPanelWidth] = useState(initialLeft);
    const [rightPanelWidth, setRightPanelWidth] = useState(initialRight);
    const isResizingLeft = useRef(false);
    const isResizingRight = useRef(false);

    const handleLeftResize = useCallback((e: MouseEvent) => {
        if (!isResizingLeft.current) return;
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 15 && newWidth < 50) {
            setLeftPanelWidth(newWidth);
        }
    }, []);
    
    const handleRightResize = useCallback((e: MouseEvent) => {
        if (!isResizingRight.current) return;
        const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
        if (newWidth > 15 && newWidth < 50) {
            setRightPanelWidth(newWidth);
        }
    }, []);

    const stopResizing = useCallback(() => {
        isResizingLeft.current = false;
        isResizingRight.current = false;
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', handleLeftResize);
        window.removeEventListener('mousemove', handleRightResize);
        window.removeEventListener('mouseup', stopResizing);
    }, [handleLeftResize, handleRightResize]);

    const startLeftResize = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingLeft.current = true;
        document.body.style.cursor = 'col-resize';
        window.addEventListener('mousemove', handleLeftResize);
        window.addEventListener('mouseup', stopResizing);
    }, [handleLeftResize, stopResizing]);

    const startRightResize = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRight.current = true;
        document.body.style.cursor = 'col-resize';
        window.addEventListener('mousemove', handleRightResize);
        window.addEventListener('mouseup', stopResizing);
    }, [handleRightResize, stopResizing]);

    return { leftPanelWidth, rightPanelWidth, startLeftResize, startRightResize };
};

// --- Resizer Component ---
const Resizer: FC<{ onMouseDown: (e: React.MouseEvent) => void }> = React.memo(({ onMouseDown }) => (
    <div 
        onMouseDown={onMouseDown}
        className="w-2 h-full cursor-col-resize flex items-center justify-center group -ml-1 z-10 hover:scale-x-110 transition-transform"
    >
        <div className="w-0.5 h-8 bg-[var(--border-primary)] group-hover:bg-indigo-400 group-hover:h-full transition-all duration-300 rounded-full"></div>
    </div>
));


// --- SUB-COMPONENTS ---

// Memoized Item Component for Performance
interface NavigatorItemProps {
    section: { id: string; title: string; };
    index: number;
    isActive: boolean;
    isDragging: boolean;
    isFirst: boolean;
    isLast: boolean;
    onSelect: (id: string) => void;
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDragEnd: () => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    t: (key: string, params?: any) => string;
}

const NavigatorItem: FC<NavigatorItemProps> = React.memo(({ 
    section, index, isActive, isDragging, isFirst, isLast, 
    onSelect, onDragStart, onDragEnter, onDragEnd, onMoveUp, onMoveDown, t 
}) => {
    return (
        <div 
            draggable 
            onDragStart={() => onDragStart(index)} 
            onDragEnter={() => onDragEnter(index)} 
            onDragEnd={onDragEnd} 
            onDragOver={(e) => e.preventDefault()}
        >
            <div 
                onClick={() => onSelect(section.id)} 
                className={`group rounded-md cursor-pointer p-2 flex items-center justify-between text-left transition-all duration-200 w-full ${isActive ? 'bg-[var(--nav-background-active)] text-[var(--nav-text-active)]' : 'hover:bg-[var(--nav-background-hover)] text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)]'} ${isDragging ? 'opacity-60 scale-[1.02] shadow-2xl shadow-indigo-500/50' : ''}`}
            >
                <span className="font-medium text-sm flex-grow truncate">{section.title}</span>
                 <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onMoveUp(index); }} 
                        disabled={isFirst} 
                        className="p-1 rounded-md hover:bg-[var(--background-secondary)] disabled:opacity-20 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-indigo-500" 
                        title={t('common.moveUp')} 
                        aria-label={t('outline.moveUp', { title: section.title })}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onMoveDown(index); }} 
                        disabled={isLast} 
                        className="p-1 rounded-md hover:bg-[var(--background-secondary)] disabled:opacity-20 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-indigo-500" 
                        title={t('common.moveDown')} 
                        aria-label={t('outline.moveDown', { title: section.title })}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    <div 
                        title={t('outline.result.dragHandleTooltip')} 
                        aria-label={t('outline.result.dragHandleTooltip')} 
                        className={`cursor-move p-1 ${isActive ? 'text-indigo-200 group-hover:text-white' : 'text-[var(--foreground-muted)] group-hover:text-[var(--foreground-primary)]'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 "><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.25h16.5" /></svg>
                    </div>
                </div>
            </div>
        </div>
    );
});
NavigatorItem.displayName = 'NavigatorItem';

const StoryNavigator: FC<{onSectionSelect?: () => void}> = React.memo(({ onSectionSelect }) => {
    const { t, manuscript, activeSectionId, setActiveSectionId, draggedItem, dragOverItem, handleDragSort, handleMoveSection, draggingIndex, setDraggingIndex } = useManuscriptViewContext();
    
    const handleSelect = useCallback((id: string) => {
        setActiveSectionId(id);
        onSectionSelect?.();
    }, [setActiveSectionId, onSectionSelect]);

    const handleDragStart = useCallback((index: number) => {
        draggedItem.current = index;
        setDraggingIndex(index);
    }, [setDraggingIndex, draggedItem]);

    const handleDragEnter = useCallback((index: number) => {
        dragOverItem.current = index;
    }, [dragOverItem]);

    const handleDragEnd = useCallback(() => {
        handleDragSort();
        setDraggingIndex(null);
    }, [handleDragSort, setDraggingIndex]);

    const handleMoveUp = useCallback((index: number) => {
        handleMoveSection(index, 'up');
    }, [handleMoveSection]);

    const handleMoveDown = useCallback((index: number) => {
        handleMoveSection(index, 'down');
    }, [handleMoveSection]);

    return (
        <div className="space-y-1 h-full overflow-y-auto p-2 no-scrollbar">
            {(Array.isArray(manuscript) ? manuscript : []).map((section, index) => (
                <NavigatorItem
                    key={section.id}
                    section={section}
                    index={index}
                    isActive={activeSectionId === section.id}
                    isDragging={draggingIndex === index}
                    isFirst={index === 0}
                    isLast={index === manuscript.length - 1}
                    onSelect={handleSelect}
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    onDragEnd={handleDragEnd}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    t={t}
                />
            ))}
        </div>
    );
});
StoryNavigator.displayName = 'StoryNavigator';


const ManuscriptEditor: FC = React.memo(() => {
    const { t, activeSection, handleContentChange, mentions, handleMentionSelect, mentionPosition, editorRef, activeSectionStats, characters, worlds } = useManuscriptViewContext();
    const settings = useAppSelector((state) => state.settings);

    const editorStyles: React.CSSProperties = {
        fontFamily: settings.editorFont,
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineSpacing,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
    };

    // Memoize the parsed content to prevent recalculation on every render/keystroke
    // This significantly improves performance for large documents.
    const renderedContent = useMemo(() => {
        if(!activeSection?.content) return '';

        const text = activeSection.content;
        const regex = /([@#][\w\s]+?)(?=[.,:;!?\s]|$)/g;
        const characterMap = new Map(characters.map(c => [c.name.toLowerCase(), c]));
        const worldMap = new Map(worlds.map(w => [w.name.toLowerCase(), w]));
        
        let lastIndex = 0;
        const parts: ReactNode[] = [];
        
        text.replace(regex, (match, p1, offset) => {
            const symbol = p1[0];
            const name = p1.substring(1).toLowerCase();
            let found = false;

            if (symbol === '@' && characterMap.has(name)) {
                found = true;
            } else if (symbol === '#' && worldMap.has(name)) {
                found = true;
            }
            
            if(offset > lastIndex) {
                 parts.push(text.substring(lastIndex, offset));
            }

            if (found) {
                const className = symbol === '@' ? 'mention-pill mention-pill-character' : 'mention-pill mention-pill-world';
                parts.push(<span key={offset} className={className}>{p1}</span>);
            } else {
                 parts.push(p1);
            }

            lastIndex = offset + p1.length;
            return match;
        });
        
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return <>{parts}</>;
    }, [activeSection?.content, characters, worlds]);

    if (!activeSection) {
        return <div className="flex h-full w-full items-center justify-center text-center text-[var(--foreground-muted)] p-4"><p>{t('manuscript.select')}</p></div>;
    }

    // Handle mobile specific logic for mentions (docking to bottom as sheet)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const mentionStyle: React.CSSProperties = isMobile 
        ? { bottom: '0', left: '0', right: '0', width: '100%', maxHeight: '50vh', borderTop: '1px solid var(--border-primary)', borderRadius: '16px 16px 0 0' } 
        : { top: mentionPosition?.top, left: mentionPosition?.left };

    const handleSelectionEvents = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        handleContentChange(activeSection.id, e.currentTarget.value);
    };

    return (
        <div className="relative h-full flex flex-col">
            <Textarea
                ref={editorRef}
                value={activeSection.content}
                onChange={(e) => handleContentChange(activeSection.id, e.target.value)}
                onSelect={handleSelectionEvents} // Trigger mention check on select
                onKeyUp={handleSelectionEvents} // and keyup
                onClick={handleSelectionEvents} // and click
                className="h-full w-full leading-relaxed resize-none p-4 sm:p-6 md:p-12 bg-transparent border-0 focus:ring-0 flex-grow caret-[var(--foreground-primary)] text-transparent max-w-3xl mx-auto selection:bg-indigo-500/30"
                placeholder={activeSection.prompt || t('manuscript.contentPlaceholder', { title: activeSection.title })}
                style={{
                     fontSize: `${settings.fontSize}px`,
                     fontFamily: settings.editorFont,
                     lineHeight: settings.lineSpacing
                }}
            />
            <div 
                className="absolute inset-0 p-4 sm:p-6 md:p-12 leading-relaxed pointer-events-none overflow-auto max-w-3xl mx-auto" 
                style={editorStyles}
                aria-hidden="true"
            >
                {renderedContent}
            </div>
             <div className="absolute bottom-4 right-6 text-xs text-[var(--foreground-muted)] bg-[var(--background-secondary)]/90 border border-[var(--border-primary)] px-3 py-1 rounded-full pointer-events-none backdrop-blur-sm shadow-sm">
                {activeSectionStats.wordCount} words
            </div>
            {mentions.length > 0 && (mentionPosition !== null || isMobile) && (
                <div className={`absolute z-20 bg-[var(--background-secondary)] border border-[var(--border-primary)] shadow-2xl overflow-hidden flex flex-col ${!isMobile ? 'rounded-md w-64' : ''}`} style={mentionStyle}>
                    {isMobile && <div className="flex justify-center p-3 bg-[var(--background-secondary)] cursor-grab active:cursor-grabbing"><div className="w-12 h-1.5 bg-[var(--border-primary)] rounded-full"></div></div>}
                    <div className="max-h-64 overflow-y-auto p-2">
                        <p className="text-xs font-semibold text-[var(--foreground-muted)] px-2 mb-2 uppercase tracking-wider">{t('manuscript.mention.suggestions')}</p>
                        <ul className="space-y-1">
                            {mentions.map(item => (
                                <li key={item.id} onMouseDown={(e) => { e.preventDefault(); handleMentionSelect(item); }} className="px-3 py-3 rounded-md text-sm text-[var(--foreground-primary)] hover:bg-[var(--background-interactive)] hover:text-white cursor-pointer flex items-center space-x-3 transition-colors">
                                {item.type === 'character' ? <div className="p-1 bg-blue-500/20 rounded flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-400">{ICONS.CHARACTERS}</svg></div> : <div className="p-1 bg-emerald-500/20 rounded flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-emerald-400">{ICONS.WORLD}</svg></div>}
                                <span className="font-medium truncate">{item.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
});
ManuscriptEditor.displayName = 'ManuscriptEditor';


const InspectorPanel: FC = React.memo(() => {
    const { t, project, dispatch, activeSectionStats, isLoglineModalOpen, setIsLoglineModalOpen, loglineSuggestions, isAiLoading, handleGenerateLoglines, selectLogline } = useManuscriptViewContext();
    return (
        <>
            <div className="space-y-4 p-4">
                 <div>
                    <label htmlFor="projectTitle" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">{t('dashboard.details.projectTitle')}</label>
                    <DebouncedInput id="projectTitle" value={project.title} onDebouncedChange={(value) => dispatch(projectActions.updateTitle(value))} placeholder={t('dashboard.details.projectTitlePlaceholder')} />
                </div>
                <div>
                    <label htmlFor="projectLogline" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">{t('dashboard.details.logline')}</label>
                    <DebouncedTextarea id="projectLogline" value={project.logline} onDebouncedChange={(value) => dispatch(projectActions.updateLogline(value))} placeholder={t('dashboard.details.loglinePlaceholder')} rows={3} />
                    <Button onClick={handleGenerateLoglines} disabled={isAiLoading} variant="ghost" className="text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-900/80 mt-2 p-2 w-full justify-start">
                        {isAiLoading ? <Spinner className="mr-2" /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">{ICONS.SPARKLES}</svg>}
                        {t('dashboard.details.aiLoglineButton')}
                    </Button>
                </div>
                 <Card>
                    <CardHeader><h3 className="text-base font-semibold">{t('manuscript.inspector.statsTitle')}</h3></CardHeader>
                    <CardContent className="text-sm space-y-3">
                        <div className="flex justify-between border-b border-[var(--border-primary)]/50 pb-2"><span>{t('dashboard.stats.totalWordCount')}</span><span className="font-bold">{activeSectionStats.wordCount.toLocaleString()}</span></div>
                        <div className="flex justify-between border-b border-[var(--border-primary)]/50 pb-2"><span>{t('manuscript.inspector.charCount')}</span><span className="font-bold">{activeSectionStats.charCount.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>{t('manuscript.inspector.readTime')}</span><span className="font-bold">{t('manuscript.inspector.readTimeValue', { time: String(activeSectionStats.readTime) })}</span></div>
                    </CardContent>
                </Card>
            </div>
             <Modal isOpen={isLoglineModalOpen} onClose={() => setIsLoglineModalOpen(false)} title={t('dashboard.loglineModal.title')}>
                {isAiLoading && <div className="flex flex-col items-center justify-center min-h-[200px]"><Spinner className="w-8 h-8" /><p className="mt-4 text-[var(--foreground-secondary)]">{t('dashboard.loglineModal.loading')}</p></div>}
                {!isAiLoading && loglineSuggestions.length > 0 && (
                    <div className="space-y-3">
                        {loglineSuggestions.map((line, idx) => (
                            <Card as="button" key={idx} className="hover:bg-[var(--background-tertiary)] transition-colors cursor-pointer w-full text-left" onClick={() => selectLogline(line)}>
                                <CardContent className="p-4"><p className="text-[var(--foreground-secondary)]">{line}</p></CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {!isAiLoading && loglineSuggestions.length === 0 && <div className="text-center text-red-400 min-h-[200px] flex items-center justify-center"><p>{t('outline.error.generationFailed')}</p></div>}
            </Modal>
        </>
    )
});
InspectorPanel.displayName = 'InspectorPanel';


const ManuscriptViewUI: FC = () => {
    const { project, activeSection, t } = useManuscriptViewContext();
    const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
    const [isInspectorDrawerOpen, setIsInspectorDrawerOpen] = useState(false);
    const { leftPanelWidth, rightPanelWidth, startLeftResize, startRightResize } = useResizablePanels(20, 20);

    if (!project) {
        return <div className="flex h-[80vh] w-full items-center justify-center"><Spinner className="w-16 h-16" /></div>;
    }
    
    return (
        <div className="h-full flex flex-col">
            {/* Mobile Header */}
            <header className="lg:hidden flex-shrink-0 flex justify-between items-center p-2 mb-2 bg-[var(--background-secondary)]/80 backdrop-blur-md border-b border-[var(--border-primary)] sticky top-0 z-20">
                <Button variant="ghost" onClick={() => setIsNavDrawerOpen(true)} size="sm" className="-ml-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                </Button>
                <h1 className="text-sm font-bold truncate px-2 text-center flex-grow text-[var(--foreground-primary)]">{activeSection?.title || project.title}</h1>
                <Button variant="ghost" onClick={() => setIsInspectorDrawerOpen(true)} size="sm" className="-mr-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                </Button>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow min-h-0 hidden lg:flex lg:flex-row">
                {/* Desktop Navigator */}
                <Card className="h-full flex flex-col rounded-r-none border-r-0" style={{ flexBasis: `${leftPanelWidth}%` }}>
                    <CardHeader className="py-3 min-h-[50px]"><h2 className="font-semibold text-sm uppercase tracking-wide text-[var(--foreground-muted)]">{t('manuscript.navigator.title')}</h2></CardHeader>
                    <div className="flex-grow overflow-y-auto"><StoryNavigator /></div>
                </Card>
                
                <Resizer onMouseDown={startLeftResize} />

                {/* Editor */}
                <Card className="h-full flex-grow p-0 rounded-none border-x-0 shadow-none z-0 bg-[var(--background-primary)]">
                    <ManuscriptEditor />
                </Card>
                
                <Resizer onMouseDown={startRightResize} />

                {/* Desktop Inspector */}
                 <Card className="h-full flex flex-col rounded-l-none border-l-0" style={{ flexBasis: `${rightPanelWidth}%` }}>
                    <CardHeader className="py-3 min-h-[50px]"><h2 className="font-semibold text-sm uppercase tracking-wide text-[var(--foreground-muted)]">{t('manuscript.inspector.title')}</h2></CardHeader>
                    <div className="flex-grow overflow-y-auto"><InspectorPanel /></div>
                </Card>
            </main>
            
            {/* Mobile Editor (takes full space) */}
            <main className="flex-grow min-h-0 lg:hidden bg-[var(--background-secondary)] overflow-hidden relative">
                <ManuscriptEditor />
            </main>

            {/* Mobile Drawers */}
            <Drawer isOpen={isNavDrawerOpen} onClose={() => setIsNavDrawerOpen(false)} title={t('manuscript.navigator.title')} position="left">
                <StoryNavigator onSectionSelect={() => setIsNavDrawerOpen(false)} />
            </Drawer>
            <Drawer isOpen={isInspectorDrawerOpen} onClose={() => setIsInspectorDrawerOpen(false)} title={t('manuscript.inspector.title')} position="right">
                <InspectorPanel />
            </Drawer>
        </div>
    );
};

export const ManuscriptView: React.FC = () => {
    // The useManuscriptView hook requires an onNavigate prop. Since this view does not navigate, passing an empty function.
    const contextValue = useManuscriptView({ onNavigate: () => {} });
    return (
        <ManuscriptViewContext.Provider value={contextValue}>
            <ManuscriptViewUI />
        </ManuscriptViewContext.Provider>
    );
};