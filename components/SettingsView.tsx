import React, { FC } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Spinner } from './ui/Spinner';
import { useSettingsView } from '../hooks/useSettingsView';
import { SettingsViewContext, useSettingsViewContext } from '../contexts/SettingsViewContext';
import { ICONS } from '../constants';

// --- SUB-COMPONENTS ---

const NavButton: FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = React.memo(({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center w-full px-3 py-2 text-left rounded-md transition-colors ${isActive ? 'bg-[var(--nav-background-active)] text-[var(--nav-text-active)]' : 'hover:bg-[var(--nav-background-hover)] text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)]'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">{icon}</svg>
        <span>{label}</span>
    </button>
));

const ToggleSwitch: FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; }> = React.memo(({ label, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--foreground-secondary)]">{label}</span>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`${checked ? 'bg-indigo-600' : 'bg-[var(--background-tertiary)]'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
            <span className={`${checked ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
        </button>
    </div>
));

const SettingsViewUI: FC = () => {
    const { t, project, settings, language, activeCategory, setActiveCategory, handleLanguageChange, handleSettingChange, importFileRef, handleExport, handleImport, setModal, projectSize, snapshots, setSnapshotName } = useSettingsViewContext();
    if (!project) return <div className="flex h-[80vh] w-full items-center justify-center"><Spinner className="w-16 h-16" /></div>;
    
    const navCategories = [
        { id: 'general', label: t('settings.categories.general'), icon: ICONS.SETTINGS },
        { id: 'appearance', label: t('settings.categories.appearance'), icon: <path d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" /> },
        { id: 'editor', label: t('settings.categories.editor'), icon: ICONS.WRITER },
        { id: 'ai', label: t('settings.categories.ai'), icon: ICONS.SPARKLES },
        { id: 'data', label: t('settings.categories.data'), icon: <path d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m17.25 0h.008v.008h-.008v-.008zm-17.25 0a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25 0h.008v.008h-.008v-.008zM6 16.5V9.75m6.75 6.75V9.75m6.75 6.75V9.75M9 9.75h.008v.008H9v-.008zm3.75 0h.008v.008h-.008v-.008zm3.75 0h.008v.008h-.008v-.008z" /> },
        { id: 'about', label: t('settings.categories.about'), icon: ICONS.HELP },
    ];

    const creativityMap = { Focused: 0, Balanced: 1, Imaginative: 2 };
    const creativityReverseMap = ['Focused', 'Balanced', 'Imaginative'];

    const renderContent = () => {
        switch (activeCategory) {
            case 'general': return (
                <Card><CardHeader><h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('settings.language.title')}</h2></CardHeader><CardContent><p className="text-sm text-[var(--foreground-secondary)] mb-2">{t('settings.language.description')}</p><Select id="language-select" value={language} onChange={handleLanguageChange}><option value="en">{t('settings.language.english')}</option><option value="de">{t('settings.language.german')}</option></Select></CardContent></Card>
            );
            case 'appearance': return (
                <Card><CardHeader><h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('settings.appearance.title')}</h2></CardHeader><CardContent className="space-y-4"><label className="text-sm font-medium text-[var(--foreground-secondary)]">{t('settings.appearance.theme')}</label><div className="grid grid-cols-2 gap-4"><Button variant={settings.theme === 'dark' ? 'primary' : 'secondary'} onClick={() => handleSettingChange('theme', 'dark')} className="text-center justify-center py-4">{t('settings.theme.dark')}</Button><Button variant={settings.theme === 'light' ? 'primary' : 'secondary'} onClick={() => handleSettingChange('theme', 'light')} className="text-center justify-center py-4">{t('settings.theme.light')}</Button></div></CardContent></Card>
            );
            case 'editor':
                const previewStyle = {
                    fontFamily: settings.editorFont,
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: settings.lineSpacing,
                    '--paragraph-spacing': `${settings.paragraphSpacing * 0.5}rem`,
                    textIndent: settings.indentFirstLine ? '2em' : '0',
                } as React.CSSProperties;
                return (
                 <div className="space-y-6">
                    <Card><CardHeader><h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('settings.editor.title')}</h2></CardHeader>
                        <CardContent className="space-y-6">
                            <div><label htmlFor="font-family-select" className="text-sm font-medium text-[var(--foreground-secondary)]">{t('settings.editor.fontFamily')}</label><Select id="font-family-select" value={settings.editorFont} onChange={e => handleSettingChange('editorFont', e.target.value)}><option value="serif">{t('settings.font.serif')}</option><option value="sans-serif">{t('settings.font.sans')}</option><option value="monospace">{t('settings.font.mono')}</option></Select></div>
                            <div className="space-y-2"><label htmlFor="font-size-input" className="flex justify-between text-sm font-medium text-[var(--foreground-secondary)]"><span>{t('settings.editor.fontSize')}</span><span>{settings.fontSize}px</span></label><input id="font-size-input" type="range" min="12" max="24" value={settings.fontSize} onChange={e => handleSettingChange('fontSize', e.target.value)} className="w-full" /></div>
                            <div className="space-y-2"><label htmlFor="line-height-input" className="flex justify-between text-sm font-medium text-[var(--foreground-secondary)]"><span>{t('settings.editor.lineHeight')}</span><span>{settings.lineSpacing}</span></label><input id="line-height-input" type="range" min="1.2" max="2.2" step="0.1" value={settings.lineSpacing} onChange={e => handleSettingChange('lineSpacing', e.target.value)} className="w-full" /></div>
                            <div className="space-y-2"><label htmlFor="p-spacing-input" className="flex justify-between text-sm font-medium text-[var(--foreground-secondary)]"><span>{t('settings.editor.paragraphSpacing')}</span><span>{settings.paragraphSpacing.toFixed(1)}</span></label><input id="p-spacing-input" type="range" min="0.5" max="2" step="0.1" value={settings.paragraphSpacing} onChange={e => handleSettingChange('paragraphSpacing', e.target.value)} className="w-full" /></div>
                            <ToggleSwitch label={t('settings.editor.indentFirstLine')} checked={settings.indentFirstLine} onChange={v => handleSettingChange('indentFirstLine', v)} />
                        </CardContent>
                    </Card>
                    <Card><CardHeader><h3 className="text-lg font-semibold text-[var(--foreground-primary)]">{t('settings.editor.previewTitle')}</h3></CardHeader>
                        <CardContent><div style={previewStyle} className="p-4 bg-[var(--background-secondary)] rounded-md border border-[var(--border-primary)] max-h-48 overflow-y-auto text-[var(--foreground-primary)]"><p className="[&&]:my-0 [&&]:mb-[var(--paragraph-spacing)]">{t('settings.editor.previewText1')}</p><p className="[&&]:my-0">{t('settings.editor.previewText2')}</p></div></CardContent>
                    </Card>
                 </div>
                );
            case 'ai': return (
                <Card><CardHeader><h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('settings.ai.title')}</h2></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="ai-creativity-select" className="flex justify-between text-sm font-medium text-[var(--foreground-secondary)]"><span>{t('settings.ai.creativity')}</span><span className="font-bold text-[var(--foreground-primary)]">{settings.aiCreativity}</span></label>
                            <p className="text-xs text-[var(--foreground-muted)] mb-2">{t('settings.ai.creativityDescription')}</p>
                            <input id="ai-creativity-select" type="range" min="0" max="2" step="1" value={creativityMap[settings.aiCreativity]} onChange={e => handleSettingChange('aiCreativity', creativityReverseMap[Number(e.target.value)])} className="w-full" />
                            <div className="flex justify-between text-xs text-[var(--foreground-muted)]"><span>{t('settings.creativity.focused')}</span><span>{t('settings.creativity.balanced')}</span><span>{t('settings.creativity.imaginative')}</span></div>
                        </div>
                    </CardContent>
                </Card>
            );
            case 'data': return (
                <div className="space-y-6">
                    <Card><CardHeader><h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('settings.data.title')}</h2></CardHeader>
                        <CardContent>
                            <p className="text-sm text-[var(--foreground-secondary)] mb-6">{t('settings.data.description')}</p>
                            <div className="p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-primary)] space-y-3">
                                <h3 className="font-semibold text-[var(--foreground-primary)]">{t('settings.data.actions')}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Button onClick={handleExport} variant="secondary">{t('settings.data.export')}</Button>
                                    <Button onClick={() => importFileRef.current?.click()} variant="secondary">{t('settings.data.import')}</Button>
                                    <input type="file" ref={importFileRef} onChange={handleImport} accept=".json" className="hidden" />
                                    <Button onClick={() => setModal({state: 'reset', payload: {}})} variant="danger">{t('settings.data.reset')}</Button>
                                </div>
                            </div>
                            <div className="text-xs text-center text-[var(--foreground-muted)] pt-2">{t('settings.data.projectSize', { size: projectSize })}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('settings.data.snapshots')}</h2>
                            <Button onClick={() => { setSnapshotName(''); setModal({ state: 'create', payload: {} }); }}>{t('settings.data.createSnapshot')}</Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[var(--foreground-secondary)] mb-4">{t('settings.data.snapshotsDescription')}</p>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {snapshots.length > 0 ? snapshots.map(snap => (
                                    <div key={snap.id} className="flex items-center justify-between p-3 bg-[var(--background-secondary)] rounded-md border border-[var(--border-primary)]">
                                        <div>
                                            <p className="font-semibold text-[var(--foreground-primary)]">{snap.name === 'Automatic Snapshot' ? t('settings.data.automaticSnapshot') : snap.name}</p>
                                            <p className="text-xs text-[var(--foreground-muted)]">{new Date(snap.date).toLocaleString()} - {snap.wordCount} {t('dashboard.stats.totalWordCount')}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button onClick={() => setModal({ state: 'restore', payload: {id: snap.id, date: new Date(snap.date).toLocaleString(), wordCount: snap.wordCount}})} variant="secondary" size="sm">{t('settings.data.restore')}</Button>
                                            <Button onClick={() => setModal({ state: 'delete', payload: {id: snap.id, name: snap.name}})} variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 dark:hover:bg-red-900/50" aria-label={`${t('settings.data.delete')} ${snap.name}`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{ICONS.TRASH}</svg></Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-sm text-center text-[var(--foreground-muted)] py-8 border-2 border-dashed border-[var(--border-primary)] rounded-md">{t('settings.data.noSnapshots')}</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
            case 'about': return (
                <Card><CardHeader><h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('settings.about.title')}</h2></CardHeader>
                    <CardContent className="text-center text-[var(--foreground-muted)] space-y-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-indigo-400 mx-auto">{ICONS.WRITER}</svg>
                        <h3 className="text-2xl font-bold text-[var(--foreground-primary)]">StoryCraft Studio</h3>
                        <p>Version 2.0.0</p>
                        <p>{t('settings.about.description')}</p>
                    </CardContent>
                </Card>
            );
            default: return null;
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <div className="space-y-2 sticky top-20">
                        {navCategories.map(cat => (
                            <NavButton key={cat.id} icon={cat.icon} label={cat.label} isActive={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id)} />
                        ))}
                    </div>
                </div>
                <div className="md:col-span-3">
                    {renderContent()}
                </div>
            </div>
            <SettingsModals />
        </div>
    );
};

const SettingsModals: FC = () => {
    const { t, modal, setModal, handleResetProject, snapshotName, setSnapshotName, handleCreateSnapshot, handleRestoreSnapshot, handleDeleteSnapshot, currentWordCount } = useSettingsViewContext();
    
    if (modal.state === 'closed') return null;

    if (modal.state === 'reset') return (
        <Modal isOpen={true} onClose={() => setModal({state: 'closed', payload: {}})} title={t('settings.resetModal.title')}>
            <div className="space-y-4"> <p className="text-[var(--foreground-secondary)]">{t('settings.resetModal.description')}</p> <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModal({state: 'closed', payload: {}})}>{t('common.cancel')}</Button><Button variant="danger" onClick={handleResetProject}>{t('settings.resetModal.confirm')}</Button></div></div>
        </Modal>
    );

    if (modal.state === 'create') return (
        <Modal isOpen={true} onClose={() => setModal({state: 'closed', payload: {}})} title={t('settings.data.createSnapshot')}>
            <div className="space-y-4"><label htmlFor="snapshot-name">{t('settings.data.snapshotName')}</label><Input id="snapshot-name" value={snapshotName} onChange={e => setSnapshotName(e.target.value)} placeholder={t('settings.data.snapshotNamePlaceholder')} /><div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModal({state: 'closed', payload: {}})}>{t('common.cancel')}</Button><Button onClick={handleCreateSnapshot}>{t('common.generate')}</Button></div></div>
        </Modal>
    );

    if (modal.state === 'restore') return (
        <Modal isOpen={true} onClose={() => setModal({state: 'closed', payload: {}})} title={t('settings.restoreModal.title')}>
            <div className="space-y-4">
                <p className="text-[var(--foreground-secondary)]">{t('settings.restoreModal.description', { date: modal.payload.date || 'the past' })}</p>
                <p className="text-sm bg-[var(--background-tertiary)] p-3 rounded-md border border-[var(--border-primary)]">{t('settings.restoreModal.wordCountInfo', { snapshotWordCount: modal.payload.wordCount || 0, currentWordCount })}</p>
                <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModal({state: 'closed', payload: {}})}>{t('common.cancel')}</Button><Button variant="danger" onClick={handleRestoreSnapshot}>{t('settings.restoreModal.confirm')}</Button></div>
            </div>
        </Modal>
    );

    if (modal.state === 'delete') return (
         <Modal isOpen={true} onClose={() => setModal({state: 'closed', payload: {}})} title={t('settings.deleteModal.title')}>
            <div className="space-y-4"><p className="text-[var(--foreground-secondary)]">{t('settings.deleteModal.description')}</p><div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModal({state: 'closed', payload: {}})}>{t('common.cancel')}</Button><Button variant="danger" onClick={handleDeleteSnapshot}>{t('settings.deleteModal.confirm')}</Button></div></div>
        </Modal>
    );

    return null;
}

export const SettingsView: FC = () => {
    const contextValue = useSettingsView();
    return (
        <SettingsViewContext.Provider value={contextValue}>
            <SettingsViewUI />
        </SettingsViewContext.Provider>
    );
};