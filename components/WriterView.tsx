import React, { FC } from 'react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { ICONS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import { writerActions } from '../features/writer/writerSlice';
import { DebouncedTextarea } from './ui/DebouncedTextarea';
import { useWriterView } from '../hooks/useWriterView';
import { WriterViewContext, useWriterViewContext } from '../contexts/WriterViewContext';
import { Textarea } from './ui/Textarea';

// --- SUB-COMPONENTS ---

const ContextPanel: FC = () => {
    const { t } = useTranslation();
    const { project, selectedSectionId, handleContentChange, writerState, dispatch } = useWriterViewContext();
    const { selection, activeTool } = writerState;
    const selectedSection = project.manuscript.find(s => s.id === selectedSectionId);
    const selectedSectionIndex = project.manuscript.findIndex(s => s.id === selectedSectionId);

    const handleMouseAndKeyUp = (e: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        const { selectionStart, selectionEnd, value } = target;
        dispatch(writerActions.setSelection({ start: selectionStart, end: selectionEnd, text: value.substring(selectionStart, selectionEnd) }));
    };
    
    const shouldHighlightSelection = (activeTool === 'improve' || activeTool === 'changeTone') && selection.text.length > 0;
    const shouldShowInsertionPoint = (activeTool === 'continue' || activeTool === 'dialogue' || activeTool === 'brainstorm') && selection.start === selection.end;

    return (
        <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('writer.studio.context.title')}</h2>
            <Card>
                <CardContent className="space-y-3">
                    <label className="text-sm font-medium text-[var(--foreground-secondary)] block">{t('writer.studio.context.sectionLabel')}</label>
                    <Select value={selectedSectionId || ''} onChange={e => dispatch(writerActions.setSelectedSectionId(e.target.value))}><option value="" disabled>{t('writer.studio.context.selectSection')}</option>{project.manuscript.map(sec => <option key={sec.id} value={sec.id}>{sec.title}</option>)}</Select>
                    <div className="relative">
                        <DebouncedTextarea
                            value={selectedSection?.content || ''}
                            onDebouncedChange={(content) => selectedSectionIndex > -1 && handleContentChange(selectedSectionIndex, content)}
                            onSelect={handleMouseAndKeyUp as any} onMouseUp={handleMouseAndKeyUp} onKeyUp={handleMouseAndKeyUp}
                            className="min-h-[400px] font-serif text-base text-transparent bg-transparent caret-[var(--foreground-primary)]"
                            placeholder={t('writer.studio.context.contentPlaceholder')} />
                        <div className="absolute inset-0 p-3 top-2.5 font-serif text-base leading-relaxed pointer-events-none overflow-auto min-h-[400px] whitespace-pre-wrap">
                            {selectedSection?.content && (
                                <>
                                    <span>{selectedSection.content.substring(0, selection.start)}</span>
                                    {shouldShowInsertionPoint && <span className="inline-block w-0.5 h-5 bg-indigo-500 dark:bg-indigo-400 animate-pulse ml-px -mb-1"></span>}
                                    {shouldHighlightSelection && <span className="bg-indigo-500/30 rounded-md">{selection.text}</span>}
                                    <span>{selectedSection.content.substring(selection.end)}</span>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const ToolsPanel: FC = () => {
    const { t } = useTranslation();
    const { project, writerState, dispatch, isGenerateDisabled, handleGenerate } = useWriterViewContext();
    const { activeTool, selection, dialogueCharacters, scenario, brainstormContext, tone, style, isLoading } = writerState;
    
    const tools = [
        { id: 'continue', title: t('writer.studio.tools.continue.title'), icon: ICONS.CONTINUE },
        { id: 'improve', title: t('writer.studio.tools.improve.title'), icon: ICONS.IMPROVE },
        { id: 'changeTone', title: t('writer.studio.tools.changeTone.title'), icon: ICONS.CHANGE_TONE },
        { id: 'dialogue', title: t('writer.studio.tools.dialogue.title'), icon: ICONS.DIALOGUE },
        { id: 'brainstorm', title: t('writer.studio.tools.brainstorm.title'), icon: ICONS.BRAINSTORM },
        { id: 'synopsis', title: t('writer.studio.tools.synopsis.title'), icon: ICONS.NEWSPAPER },
    ];
    
    const renderToolInputs = () => {
        switch(activeTool) {
            case 'improve': return <p className="text-sm text-[var(--foreground-muted)]">{t('writer.studio.tools.improve.instruction', {selection: selection.text ? `"${selection.text}"` : t('writer.studio.tools.improve.noSelection')})}</p>
            case 'changeTone': return <div><p className="text-sm text-[var(--foreground-muted)] mb-3">{t('writer.studio.tools.improve.instruction', {selection: selection.text ? `"${selection.text}"` : t('writer.studio.tools.improve.noSelection')})}</p><Select id="tone" value={tone} onChange={e => dispatch(writerActions.setTone(e.target.value))}><option value="">{t('writer.studio.controls.selectTone')}</option><option value="More Cinematic">{t('writer.studio.controls.tones.cinematic')}</option><option value="More Suspenseful">{t('writer.studio.controls.tones.suspenseful')}</option><option value="More Humorous">{t('writer.studio.controls.tones.humorous')}</option><option value="More Formal">{t('writer.studio.controls.tones.formal')}</option><option value="More Poetic">{t('writer.studio.controls.tones.poetic')}</option></Select></div>;
            case 'dialogue': return <div className="space-y-4"><div><label className="text-sm font-medium text-[var(--foreground-secondary)] mb-2 block">{t('writer.studio.tools.dialogue.charactersLabel')}</label><div className="space-y-1 max-h-24 overflow-y-auto">{project.characters.map(char => (<div key={char.id} className="flex items-center"><input type="checkbox" id={`char-${char.id}`} checked={dialogueCharacters.some(c => c.id === char.id)} onChange={() => dispatch(writerActions.toggleDialogueCharacter(char))} className="h-4 w-4 rounded border-gray-300 dark:border-gray-500 bg-gray-200 dark:bg-gray-800 text-indigo-600 focus:ring-indigo-500" /><label htmlFor={`char-${char.id}`} className="ml-2 text-sm text-[var(--foreground-primary)]">{char.name}</label></div>))}</div></div><div><label htmlFor="scenario" className="text-sm font-medium text-[var(--foreground-secondary)] mb-2 block">{t('writer.studio.tools.dialogue.scenarioLabel')}</label><DebouncedTextarea id="scenario" value={scenario} onDebouncedChange={(val) => dispatch(writerActions.setScenario(val))} placeholder={t('writer.studio.tools.dialogue.scenarioPlaceholder')} rows={3}/></div></div>;
            case 'brainstorm': return <div><label htmlFor="brainstorm-context" className="text-sm font-medium text-[var(--foreground-secondary)] mb-2 block">{t('writer.studio.tools.brainstorm.contextLabel')}</label><DebouncedTextarea id="brainstorm-context" value={brainstormContext} onDebouncedChange={(val) => dispatch(writerActions.setBrainstormContext(val))} placeholder={t('writer.studio.tools.brainstorm.contextPlaceholder')} rows={4}/></div>
            case 'synopsis': return <p className="text-sm text-[var(--foreground-muted)]">{t('writer.studio.tools.synopsis.instruction')}</p>
            default: return <p className="text-sm text-[var(--foreground-muted)]">{t('writer.studio.tools.continue.instruction')}</p>;
        }
    }

    return (
       <div className="lg:col-span-3 space-y-4">
             <Card className="sticky top-20">
                <CardHeader>
                    <h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('writer.studio.tools.title')}</h2>
                </CardHeader>
                <CardContent className="flex flex-col space-y-4 max-h-[calc(100vh-8rem)]">
                    <div className="grid grid-cols-5 gap-2 flex-shrink-0">
                        {tools.map(tool => (
                            <button 
                                key={tool.id}
                                title={tool.title}
                                onClick={() => dispatch(writerActions.setActiveTool(tool.id as any))} 
                                className={`aspect-square flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-indigo-500 ${
                                    activeTool === tool.id 
                                    ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                                    : 'bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--border-primary)] hover:scale-105'
                                }`}
                                aria-label={tool.title}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" aria-hidden="true">{tool.icon}</svg>
                            </button>
                        ))}
                    </div>

                    <div className="flex-grow p-4 bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)] space-y-4 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-[var(--foreground-primary)]">{tools.find(t => t.id === activeTool)?.title}</h3>
                        <div className="space-y-4">
                            {renderToolInputs()}
                        </div>
                        
                        {(activeTool === 'continue' || activeTool === 'improve') && (
                        <div className="pt-4 border-t border-[var(--border-primary)]">
                            <h3 className="text-base font-semibold text-[var(--foreground-primary)] mb-3">{t('writer.studio.controls.title')}</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label htmlFor="style" className="text-xs font-medium text-[var(--foreground-muted)] mb-1 block">{t('writer.studio.controls.style')}</label>
                                    <Select id="style" value={style} onChange={e => dispatch(writerActions.setStyle(e.target.value))}>
                                        <option value="">{t('writer.studio.controls.default')}</option>
                                        <option value="Cinematic">{t('writer.studio.controls.styles.cinematic')}</option>
                                        <option value="Concise">{t('writer.studio.controls.styles.concise')}</option>
                                        <option value="Descriptive">{t('writer.studio.controls.styles.descriptive')}</option>
                                        <option value="Minimalist">{t('writer.studio.controls.styles.minimalist')}</option>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                    
                    <div className="flex-shrink-0">
                        <Button onClick={handleGenerate} disabled={isGenerateDisabled()} className="w-full">
                            {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">{ICONS.SPARKLES}</svg>}
                            {t('common.generate')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


const AiScratchpad: FC = () => {
    const { t } = useTranslation();
    const { writerState, handleAccept, handleGenerate, handleNavigateHistory, handleUpdateScratchpad, dispatch } = useWriterViewContext();
    const { generationHistory, activeHistoryIndex, isLoading, activeTool } = writerState;
    const currentResult = generationHistory[activeHistoryIndex] || '';

    return (
        <div className="lg:col-span-4 space-y-4">
            <h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('writer.studio.result.title')}</h2>
            <Card className="min-h-[500px]">
                <CardContent className="flex flex-col h-full">
                    <Textarea 
                        value={currentResult}
                        onChange={(e) => handleUpdateScratchpad(e.target.value)}
                        className="prose dark:prose-invert prose-base min-h-[400px] flex-grow font-serif whitespace-pre-wrap bg-[var(--background-secondary)]/50 border-[var(--border-primary)]"
                        placeholder={isLoading ? '' : t('writer.studio.result.placeholder')}
                        disabled={isLoading}
                    />
                     {isLoading && currentResult === '' && <div className="absolute inset-0 top-16 flex items-center justify-center text-[var(--foreground-muted)]"><Spinner/></div>}
                     {isLoading && <span className="inline-block w-2 h-5 bg-indigo-500 dark:bg-indigo-400 animate-ping ml-1 absolute bottom-24 right-8"></span>}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
                         <div className="flex items-center space-x-2">
                             <Button onClick={() => handleNavigateHistory('prev')} disabled={activeHistoryIndex <= 0} size="sm" variant="ghost">{"< "}{t('writer.studio.result.prev')}</Button>
                             <span className="text-xs text-[var(--foreground-muted)]">{activeHistoryIndex + 1} / {generationHistory.length}</span>
                             <Button onClick={() => handleNavigateHistory('next')} disabled={activeHistoryIndex >= generationHistory.length - 1} size="sm" variant="ghost">{t('writer.studio.result.next')}{" >"}</Button>
                         </div>
                         <div className="flex items-center space-x-2">
                             <Button onClick={handleGenerate} variant="secondary" size="sm" disabled={isLoading}>{t('writer.studio.result.retry')}</Button>
                             <Button onClick={() => navigator.clipboard.writeText(currentResult)} variant="ghost" size="sm">{t('common.copyToClipboard')}</Button>
                         </div>
                    </div>
                    {currentResult && !isLoading && activeTool !== 'synopsis' && (
                        <div className="flex items-center space-x-2 pt-2 mt-2 border-t border-[var(--background-tertiary)]">
                           {(activeTool === 'continue' || activeTool === 'dialogue' || activeTool === 'brainstorm') && <Button onClick={() => handleAccept('insert')} className="flex-grow">{t('writer.studio.result.insert')}</Button>}
                           {(activeTool === 'improve' || activeTool === 'changeTone') && <Button onClick={() => handleAccept('replace')} className="flex-grow">{t('writer.studio.result.replace')}</Button>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const WriterViewUI: FC = () => {
    const { t } = useTranslation();
    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <ContextPanel />
                <ToolsPanel />
                <AiScratchpad />
            </div>
        </div>
    );
};

export const WriterView: FC = () => {
    const contextValue = useWriterView();
    return (
        <WriterViewContext.Provider value={contextValue}>
            <WriterViewUI />
        </WriterViewContext.Provider>
    );
};