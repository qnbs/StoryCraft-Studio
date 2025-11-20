import React, { FC, useState } from 'react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { ICONS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import { writerActions, WriterTool } from '../features/writer/writerSlice';
import { DebouncedTextarea } from './ui/DebouncedTextarea';
import { useWriterView } from '../hooks/useWriterView';
import { WriterViewContext, useWriterViewContext } from '../contexts/WriterViewContext';
import { Textarea } from './ui/Textarea';
import { useAppSelector } from '../app/hooks';

// --- SUB-COMPONENTS ---

const ContextPanel: FC = React.memo(() => {
    const { t } = useTranslation();
    const { project, selectedSectionId, handleContentChange, writerState, dispatch } = useWriterViewContext();
    const { selection, activeTool } = writerState;
    const selectedSection = project.manuscript.find(s => s.id === selectedSectionId);
    const selectedSectionIndex = project.manuscript.findIndex(s => s.id === selectedSectionId);
    
    const settings = useAppSelector((state) => state.settings);
    const fontMap = {
        'serif': 'serif',
        'sans-serif': 'sans-serif',
        'monospace': 'monospace'
    };
    const editorStyles: React.CSSProperties = {
        fontFamily: fontMap[settings.editorFont],
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineSpacing,
    };

    const handleMouseAndKeyUp = (e: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        const { selectionStart, selectionEnd, value } = target;
        dispatch(writerActions.setSelection({ start: selectionStart, end: selectionEnd, text: value.substring(selectionStart, selectionEnd) }));
    };
    
    const shouldHighlightSelection = (activeTool === 'improve' || activeTool === 'changeTone') && selection.text.length > 0;
    const shouldShowInsertionPoint = (activeTool === 'continue' || activeTool === 'dialogue' || activeTool === 'brainstorm') && selection.start === selection.end;

    return (
        <div className="h-full flex flex-col">
            <Card className="h-full flex flex-col border-0 sm:border">
                <CardHeader className="hidden lg:block">
                     <h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('writer.studio.context.title')}</h2>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow flex flex-col p-4 sm:p-6 overflow-hidden">
                    <div className="flex flex-col space-y-2 flex-shrink-0">
                        <label className="text-sm font-medium text-[var(--foreground-secondary)]">{t('writer.studio.context.sectionLabel')}</label>
                        <Select value={selectedSectionId || ''} onChange={e => dispatch(writerActions.setSelectedSectionId(e.target.value))}>
                            <option value="" disabled>{t('writer.studio.context.selectSection')}</option>
                            {project.manuscript.map(sec => <option key={sec.id} value={sec.id}>{sec.title}</option>)}
                        </Select>
                    </div>
                    <div className="relative flex-grow border rounded-md border-[var(--border-primary)] bg-[var(--background-primary)] overflow-hidden min-h-[300px]">
                        <DebouncedTextarea
                            value={selectedSection?.content || ''}
                            onDebouncedChange={(content) => selectedSectionIndex > -1 && handleContentChange(selectedSectionIndex, content)}
                            onSelect={handleMouseAndKeyUp as any} onMouseUp={handleMouseAndKeyUp} onKeyUp={handleMouseAndKeyUp}
                            className="h-full absolute inset-0 resize-none text-transparent bg-transparent caret-[var(--foreground-primary)] z-10 p-4"
                            placeholder={t('writer.studio.context.contentPlaceholder')} />
                        <div 
                            className="absolute inset-0 p-4 leading-relaxed pointer-events-none overflow-auto whitespace-pre-wrap"
                            style={editorStyles}
                        >
                            {selectedSection?.content && (
                                <>
                                    <span>{selectedSection.content.substring(0, selection.start)}</span>
                                    {shouldShowInsertionPoint && <span className="inline-block w-0.5 h-5 bg-indigo-500 dark:bg-indigo-400 animate-pulse ml-px -mb-1 align-middle"></span>}
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
});

const ToolsPanel: FC = React.memo(() => {
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
            case 'improve': return <p className="text-sm text-[var(--foreground-muted)]">{t('writer.studio.tools.improve.instruction', {selection: selection.text ? `"${selection.text.substring(0, 50)}..."` : t('writer.studio.tools.improve.noSelection')})}</p>
            case 'changeTone': return <div><p className="text-sm text-[var(--foreground-muted)] mb-3">{t('writer.studio.tools.improve.instruction', {selection: selection.text ? `"${selection.text.substring(0, 50)}..."` : t('writer.studio.tools.improve.noSelection')})}</p><Select id="tone" value={tone} onChange={e => dispatch(writerActions.setTone(e.target.value))}><option value="">{t('writer.studio.controls.selectTone')}</option><option value="More Cinematic">{t('writer.studio.controls.tones.cinematic')}</option><option value="More Suspenseful">{t('writer.studio.controls.tones.suspenseful')}</option><option value="More Humorous">{t('writer.studio.controls.tones.humorous')}</option><option value="More Formal">{t('writer.studio.controls.tones.formal')}</option><option value="More Poetic">{t('writer.studio.controls.tones.poetic')}</option></Select></div>;
            case 'dialogue': return <div className="space-y-4"><div><label className="text-sm font-medium text-[var(--foreground-secondary)] mb-2 block">{t('writer.studio.tools.dialogue.charactersLabel')}</label><div className="space-y-2 max-h-32 overflow-y-auto bg-[var(--background-tertiary)]/30 p-2 rounded-md">{project.characters.map(char => (<div key={char.id} className="flex items-center p-1"><input type="checkbox" id={`char-${char.id}`} checked={dialogueCharacters.some(c => c.id === char.id)} onChange={() => dispatch(writerActions.toggleDialogueCharacter(char))} className="h-4 w-4 rounded border-gray-300 dark:border-gray-500 bg-gray-200 dark:bg-gray-800 text-indigo-600 focus:ring-indigo-500" /><label htmlFor={`char-${char.id}`} className="ml-3 text-sm text-[var(--foreground-primary)]">{char.name}</label></div>))}</div></div><div><label htmlFor="scenario" className="text-sm font-medium text-[var(--foreground-secondary)] mb-2 block">{t('writer.studio.tools.dialogue.scenarioLabel')}</label><DebouncedTextarea id="scenario" value={scenario} onDebouncedChange={(val) => dispatch(writerActions.setScenario(val))} placeholder={t('writer.studio.tools.dialogue.scenarioPlaceholder')} rows={3}/></div></div>;
            case 'brainstorm': return <div><label htmlFor="brainstorm-context" className="text-sm font-medium text-[var(--foreground-secondary)] mb-2 block">{t('writer.studio.tools.brainstorm.contextLabel')}</label><DebouncedTextarea id="brainstorm-context" value={brainstormContext} onDebouncedChange={(val) => dispatch(writerActions.setBrainstormContext(val))} placeholder={t('writer.studio.tools.brainstorm.contextPlaceholder')} rows={4}/></div>
            case 'synopsis': return <p className="text-sm text-[var(--foreground-muted)]">{t('writer.studio.tools.synopsis.instruction')}</p>
            default: return <p className="text-sm text-[var(--foreground-muted)]">{t('writer.studio.tools.continue.instruction')}</p>;
        }
    }

    return (
       <div className="h-full flex flex-col">
             <Card className="h-full flex flex-col sticky top-0 lg:top-20 border-0 sm:border">
                <CardHeader className="hidden lg:block">
                    <h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('writer.studio.tools.title')}</h2>
                </CardHeader>
                <CardContent className="flex flex-col space-y-4 flex-grow overflow-hidden p-4 sm:p-6">
                    <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-5 gap-2 flex-shrink-0" role="group" aria-label="Tool selection">
                        {tools.map(tool => (
                            <button 
                                key={tool.id}
                                title={tool.title}
                                onClick={() => dispatch(writerActions.setActiveTool(tool.id as WriterTool))} 
                                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] ${
                                    activeTool === tool.id 
                                    ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]' 
                                    : 'bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--border-primary)]'
                                }`}
                                aria-label={tool.title}
                                aria-pressed={activeTool === tool.id}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1" aria-hidden="true">{tool.icon}</svg>
                                <span className="text-[10px] text-center leading-none hidden sm:block">{tool.title.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-grow p-4 bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)] space-y-4 overflow-y-auto">
                        <h3 className="text-base font-bold text-[var(--foreground-primary)] flex items-center gap-2">
                             {tools.find(t => t.id === activeTool)?.icon}
                             {tools.find(t => t.id === activeTool)?.title}
                        </h3>
                        <div className="space-y-4">
                            {renderToolInputs()}
                        </div>
                        
                        {(activeTool === 'continue' || activeTool === 'improve') && (
                        <div className="pt-4 border-t border-[var(--border-primary)]">
                            <h3 className="text-sm font-semibold text-[var(--foreground-primary)] mb-2">{t('writer.studio.controls.title')}</h3>
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
                    
                    <div className="flex-shrink-0 pt-2">
                        {isLoading ? (
                            <Button onClick={handleGenerate} variant="danger" className="w-full py-3 text-base shadow-lg animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                                </svg>
                                Stop Generating
                            </Button>
                        ) : (
                            <Button onClick={handleGenerate} disabled={isGenerateDisabled()} className="w-full py-3 text-base shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">{ICONS.SPARKLES}</svg>
                                {t('common.generate')}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});


const AiScratchpad: FC = React.memo(() => {
    const { t } = useTranslation();
    const { writerState, handleAccept, handleGenerate, handleNavigateHistory, handleUpdateScratchpad, dispatch } = useWriterViewContext();
    const { generationHistory, activeHistoryIndex, isLoading, activeTool } = writerState;
    const currentResult = generationHistory[activeHistoryIndex] || '';

    return (
        <div className="h-full flex flex-col">
            <Card className="h-full min-h-[400px] flex flex-col border-0 sm:border">
                <CardHeader className="hidden lg:block">
                     <h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('writer.studio.result.title')}</h2>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow min-h-0 p-4 sm:p-6 overflow-hidden">
                    <div className="relative flex-grow mb-4 overflow-hidden flex flex-col">
                        <Textarea 
                            value={currentResult}
                            onChange={(e) => handleUpdateScratchpad(e.target.value)}
                            className="flex-grow w-full resize-none whitespace-pre-wrap bg-[var(--background-secondary)]/50 border-[var(--border-primary)] p-4 font-mono text-sm"
                            placeholder={isLoading ? '' : t('writer.studio.result.placeholder')}
                            disabled={isLoading}
                        />
                        {isLoading && currentResult === '' && <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--foreground-muted)]"><Spinner className="mb-2"/><p className="text-sm animate-pulse">Writing...</p></div>}
                    </div>
                    
                    <div className="flex flex-col gap-3 flex-shrink-0">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Button onClick={() => handleNavigateHistory('prev')} disabled={activeHistoryIndex <= 0} size="sm" variant="ghost" className="px-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                </Button>
                                <span className="text-xs font-mono text-[var(--foreground-muted)]">{generationHistory.length > 0 ? activeHistoryIndex + 1 : 0} / {generationHistory.length}</span>
                                <Button onClick={() => handleNavigateHistory('next')} disabled={activeHistoryIndex >= generationHistory.length - 1} size="sm" variant="ghost" className="px-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                </Button>
                            </div>
                             <div className="flex items-center space-x-2">
                                 {isLoading ? null : <Button onClick={handleGenerate} variant="secondary" size="sm" disabled={isLoading}>{t('writer.studio.result.retry')}</Button>}
                                 <Button onClick={() => navigator.clipboard.writeText(currentResult)} variant="ghost" size="sm" title={t('common.copyToClipboard')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg></Button>
                             </div>
                         </div>
                        {currentResult && !isLoading && activeTool !== 'synopsis' && (
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-primary)]">
                            {(activeTool === 'continue' || activeTool === 'dialogue' || activeTool === 'brainstorm') && <Button onClick={() => handleAccept('insert')} className="w-full">{t('writer.studio.result.insert')}</Button>}
                            {(activeTool === 'improve' || activeTool === 'changeTone') && <Button onClick={() => handleAccept('replace')} className="w-full">{t('writer.studio.result.replace')}</Button>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

const WriterViewUI: FC = () => {
    const { t } = useTranslation();
    const [activeMobileTab, setActiveMobileTab] = useState<'context' | 'tools' | 'result'>('tools');

    return (
        <div className="h-full flex flex-col">
            {/* Mobile Segmented Control - Top Navigation */}
            <div className="lg:hidden p-1 mx-0 mb-4 bg-[var(--background-tertiary)] rounded-xl flex items-center relative border border-[var(--border-primary)]/50 shadow-inner select-none">
                {(['context', 'tools', 'result'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveMobileTab(tab)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 z-10 touch-manipulation ${
                            activeMobileTab === tab
                                ? 'bg-[var(--background-secondary)] text-[var(--foreground-primary)] shadow-md transform scale-[1.02] ring-1 ring-black/5 dark:ring-white/5'
                                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground-secondary)]'
                        }`}
                    >
                        {tab === 'context' && t('writer.studio.context.title').split(' ')[0]}
                        {tab === 'tools' && t('writer.studio.tools.title').split(' ')[0]}
                        {tab === 'result' && 'Result'}
                    </button>
                ))}
            </div>

            {/* Mobile Views (Conditional Render) */}
            <div className="lg:hidden flex-grow min-h-0 overflow-hidden">
                {activeMobileTab === 'context' && <ContextPanel />}
                {activeMobileTab === 'tools' && <ToolsPanel />}
                {activeMobileTab === 'result' && <AiScratchpad />}
            </div>

            {/* Desktop Grid Layout (Always Visible on LG+) */}
            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6 h-full items-start">
                <div className="lg:col-span-4 h-full overflow-hidden"><ContextPanel /></div>
                <div className="lg:col-span-4 h-full overflow-hidden"><ToolsPanel /></div>
                <div className="lg:col-span-4 h-full overflow-hidden"><AiScratchpad /></div>
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