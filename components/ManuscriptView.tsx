import React, { FC, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
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
import { useManuscriptViewLogic } from '../hooks/useDashboard';
import { ManuscriptViewContext, useManuscriptViewContext } from '../contexts/DashboardContext';
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
const Resizer: FC<{ onMouseDown: (e: React.MouseEvent) => void }> = ({ onMouseDown }) => (
    <div 
        onMouseDown={onMouseDown}
        className="w-1.5 h-full cursor-col-resize flex items-center justify-center group"
    >
        <div className="w-px h-full bg-[var(--border-primary)] group-hover:bg-[var(--border-interactive)] transition-colors duration-200"></div>
    </div>
);


// --- SUB-COMPONENTS ---

const StoryNavigator: FC<{onSectionSelect?: () => void}> = React.memo(({ onSectionSelect }) => {
    const { t, manuscript, activeSectionId, setActiveSectionId, draggedItem, dragOverItem, handleDragSort, draggingIndex, setDraggingIndex } = useManuscriptViewContext();
    
    const handleSelect = (id: string) => {
        setActiveSectionId(id);
        onSectionSelect?.();
    }

    return (
        <div className="space-y-1 h-full overflow-y-auto p-2">
            {(Array.isArray(manuscript) ? manuscript : []).map((section, index) => (
                <div key={section.id} draggable onDragStart={() => { draggedItem.current = index; setDraggingIndex(index); }} onDragEnter={() => dragOverItem.current = index} onDragEnd={handleDragSort} onDragOver={(e) => e.preventDefault()}>
                    <button onClick={() => handleSelect(section.id)} className={`group rounded-md cursor-pointer p-2 flex items-center justify-between text-left transition-all duration-200 w-full ${activeSectionId === section.id ? 'bg-[var(--nav-background-active)] text-[var(--nav-text-active)]' : 'hover:bg-[var(--nav-background-hover)] text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)]'} ${draggingIndex === index ? 'opacity-60 scale-[1.02] shadow-2xl shadow-indigo-500/50' : ''}`}>
                        <span className="font-medium text-sm flex-grow truncate">{section.title}</span>
                        <div title={t('outline.result.dragHandleTooltip')} aria-label={t('outline.result.dragHandleTooltip')} className={`cursor-move flex-shrink-0 ${activeSectionId === section.id ? 'text-indigo-200 group-hover:text-white' : 'text-[var(--foreground-muted)] group-hover:text-[var(--foreground-primary)]'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 "><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.25h16.5" /></svg>
                        </div>
                    </button>
                </div>
            ))}
        </div>
    );
});
StoryNavigator.displayName = 'StoryNavigator';


const ManuscriptEditor: FC = React.memo(() => {
    const { t, activeSection, handleContentChange, mentions, handleMentionSelect, mentionPosition, setCursorPosition, editorRef, activeSectionWordCount, characters, worlds } = useManuscriptViewContext();
    const settings = useAppSelector((state) => state.settings);

    const editorStyles: React.CSSProperties = {
        fontFamily: settings.editorFont,
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineSpacing,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
    };

    const parseAndRenderContent = useCallback((text: string): ReactNode => {
        const regex = /([@#][\w\s]+?)(?=[.,:;!?\s]|$)/g;
        const characterMap = new Map(characters.map(c => [c.name.toLowerCase(), c]));
        const worldMap = new Map(worlds.map(w => [w.name.toLowerCase(), w]));
        
        let lastIndex = 0;
        const parts: ReactNode[] = [];
        
        if(!text) return '';

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
    }, [characters, worlds]);

    if (!activeSection) {
        return <div className="flex h-full w-full items-center justify-center text-center text-[var(--foreground-muted)] p-4"><p>{t('manuscript.select')}</p></div>;
    }

    return (
        <div className="relative h-full flex flex-col">
            <Textarea
                ref={editorRef}
                value={activeSection.content}
                onChange={(e) => handleContentChange(activeSection.id, e.target.value)}
                onSelect={(e: any) => setCursorPosition(e.target.selectionStart)}
                onKeyUp={(e: any) => setCursorPosition(e.target.selectionStart)}
                onClick={(e: any) => setCursorPosition(e.target.selectionStart)}
                className="h-full w-full text-lg leading-relaxed resize-none p-4 sm:p-6 bg-transparent border-0 focus:ring-0 flex-grow caret-[var(--foreground-primary)] text-transparent"
                placeholder={activeSection.prompt || t('manuscript.contentPlaceholder', { title: activeSection.title })}
            />
            <div 
                className="absolute inset-0 p-4 sm:p-6 text-lg leading-relaxed pointer-events-none overflow-auto" 
                style={editorStyles}
                aria-hidden="true"
            >
                {parseAndRenderContent(activeSection.content)}
            </div>
             <div className="absolute bottom-4 right-6 text-xs text-[var(--foreground-muted)] bg-[var(--background-secondary)]/80 px-2 py-1 rounded-full pointer-events-none">
                {activeSectionWordCount} {t('dashboard.stats.totalWordCount')}
            </div>
            {mentions.length > 0 && mentionPosition !== null && (
                <div className="absolute z-10 w-64 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-md shadow-lg" style={{ top: mentionPosition.top, left: mentionPosition.left }}>
                    <ul className="max-h-48 overflow-y-auto">
                        {mentions.map(item => (
                            <li key={item.id} onClick={() => handleMentionSelect(item)} className="px-3 py-2 text-sm text-[var(--foreground-primary)] hover:bg-[var(--background-interactive)] hover:text-white cursor-pointer flex items-center space-x-2">
                               {item.type === 'character' ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[var(--foreground-muted)]">{ICONS.CHARACTERS}</svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[var(--foreground-muted)]">{ICONS.WORLD}</svg>}
                               <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
});
ManuscriptEditor.displayName = 'ManuscriptEditor';


const InspectorPanel: FC = React.memo(() => {
    const { t, project, dispatch, isLoglineModalOpen, setIsLoglineModalOpen, loglineSuggestions, isAiLoading, handleGenerateLoglines, selectLogline } = useManuscriptViewContext();
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
                    <Button onClick={handleGenerateLoglines} disabled={isAiLoading} variant="ghost" className="text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-900/80 mt-2 p-2 w-full">
                        {isAiLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">{ICONS.SPARKLES}</svg>}
                        {t('dashboard.details.aiLoglineButton')}
                    </Button>
                </div>
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
            <header className="lg:hidden flex-shrink-0 flex justify-between items-center p-2 mb-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-primary)]">
                <Button variant="secondary" onClick={() => setIsNavDrawerOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{ICONS.OUTLINE}</svg>
                    <span className="hidden sm:inline ml-2">{t('manuscript.navigator.title')}</span>
                </Button>
                <h1 className="text-lg font-bold truncate px-4 text-center">{activeSection?.title || project.title}</h1>
                <Button variant="secondary" onClick={() => setIsInspectorDrawerOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{ICONS.DOCUMENT_TEXT}</svg>
                    <span className="hidden sm:inline ml-2">{t('manuscript.inspector.title')}</span>
                </Button>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow min-h-0 hidden lg:flex lg:flex-row">
                {/* Desktop Navigator */}
                <Card className="h-full flex flex-col" style={{ flexBasis: `${leftPanelWidth}%` }}>
                    <CardHeader><h2 className="font-semibold text-lg">{t('manuscript.navigator.title')}</h2></CardHeader>
                    <div className="flex-grow overflow-y-auto"><StoryNavigator /></div>
                </Card>
                
                <Resizer onMouseDown={startLeftResize} />

                {/* Editor */}
                <Card className="h-full flex-grow p-0">
                    <ManuscriptEditor />
                </Card>
                
                <Resizer onMouseDown={startRightResize} />

                {/* Desktop Inspector */}
                 <Card className="h-full flex flex-col" style={{ flexBasis: `${rightPanelWidth}%` }}>
                    <CardHeader><h2 className="font-semibold text-lg">{t('manuscript.inspector.title')}</h2></CardHeader>
                    <div className="flex-grow overflow-y-auto"><InspectorPanel /></div>
                </Card>
            </main>
            
            {/* Mobile Editor (takes full space) */}
            <main className="flex-grow min-h-0 lg:hidden bg-[var(--background-secondary)] rounded-lg border border-[var(--border-primary)]">
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
    // FIX: The useManuscriptViewLogic hook requires an onNavigate prop. Since this view does not navigate, passing an empty function.
    const contextValue = useManuscriptViewLogic({ onNavigate: () => {} });
    return (
        <ManuscriptViewContext.Provider value={contextValue}>
            <ManuscriptViewUI />
        </ManuscriptViewContext.Provider>
    );
};