import React, { FC } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Select } from './ui/Select';
import { Spinner } from './ui/Spinner';
import { ICONS } from '../constants';
import { useExportView } from '../hooks/useExportView';
import { ExportViewContext, useExportViewContext } from '../contexts/ExportViewContext';

// --- SUB-COMPONENTS ---

const AccordionSection: FC<{ title: string; children: React.ReactNode; idSuffix: string; }> = React.memo(({ title, children, idSuffix }) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const panelId = `accordion-panel-${idSuffix}`;
    const headerId = `accordion-header-${idSuffix}`;
    return (
        <div className="border-b border-[var(--border-primary)]">
            <h3 id={headerId} className="font-semibold text-[var(--foreground-primary)]">
                <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-left hover:bg-[var(--background-tertiary)]/50" aria-expanded={isOpen} aria-controls={panelId}>
                    {title}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={headerId} hidden={!isOpen} className="p-4">{children}</div>
        </div>
    );
});

const CheckboxOption: FC<{label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean;}> = React.memo(({label, checked, onChange, disabled}) => (
    <div className="flex items-center">
        <input type="checkbox" id={label} checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="h-4 w-4 rounded border-gray-300 dark:border-gray-500 bg-gray-200 dark:bg-gray-800 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
        <label htmlFor={label} className={`ml-3 text-sm ${disabled ? 'text-[var(--foreground-muted)]' : 'text-[var(--foreground-secondary)]'}`}>{label}</label>
    </div>
));

const ExportControls: FC = () => {
    const { t, project, format, setFormat, contentToExport, setContentToExport, pdfOptions, setPdfOptions, aiEnhancements, setAiEnhancements, isGeneratingSynopsis, copied, handleDownload, handleCopyToClipboard } = useExportViewContext();
    return (
        <Card>
            <CardHeader><h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('export.options.title')}</h2></CardHeader>
            <CardContent className="space-y-4 p-0">
                <AccordionSection title={t('export.content.title')} idSuffix="content">
                    <div className="space-y-3">
                        <CheckboxOption label={t('export.content.titleAndLogline')} checked={contentToExport.title} onChange={v => setContentToExport(c => ({...c, title: v}))} />
                        <CheckboxOption label={t('export.content.characters')} checked={contentToExport.characters} onChange={v => setContentToExport(c => ({...c, characters: v}))} disabled={project.characters.length === 0}/>
                        <CheckboxOption label={t('export.content.worlds')} checked={contentToExport.worlds} onChange={v => setContentToExport(c => ({...c, worlds: v}))} disabled={project.worlds.length === 0}/>
                        <CheckboxOption label={t('export.content.manuscript')} checked={contentToExport.manuscript} onChange={v => setContentToExport(c => ({...c, manuscript: v}))} disabled={project.manuscript.length === 0}/>
                    </div>
                </AccordionSection>
                <AccordionSection title={t('export.ai.title')} idSuffix="ai">
                    <div className="space-y-3">
                        <CheckboxOption label={t('export.ai.synopsis')} checked={aiEnhancements.synopsis} onChange={v => setAiEnhancements(e => ({...e, synopsis: v}))} disabled={project.manuscript.length === 0} />
                        {isGeneratingSynopsis && <div className="flex items-center space-x-2 text-sm text-indigo-500 dark:text-indigo-400"><Spinner className="w-4 h-4"/><span>{t('export.ai.generating')}</span></div>}
                    </div>
                </AccordionSection>
                <AccordionSection title={t('export.format.title')} idSuffix="format">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-[var(--foreground-secondary)] mb-2 block">{t('export.format.format')}</label>
                            <Select value={format} onChange={e => setFormat(e.target.value as any)}><option value="md">{t('export.format.md')}</option><option value="txt">{t('export.format.txt')}</option><option value="pdf">{t('export.format.pdf')}</option></Select>
                        </div>
                        {format === 'pdf' && (
                            <div className="space-y-4 border-t border-[var(--border-primary)] pt-4">
                                <h4 className="font-semibold text-[var(--foreground-secondary)]">{t('export.format.pdfOptions')}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-[var(--foreground-muted)] mb-1 block">{t('export.format.font')}</label>
                                        <Select value={pdfOptions.font} onChange={e => setPdfOptions(o => ({...o, font: e.target.value as typeof o.font}))}><option value="Times">Times New Roman</option><option value="Courier">Courier</option><option value="Helvetica">Helvetica/Arial</option></Select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--foreground-muted)] mb-1 block">{t('export.format.fontSize')}</label>
                                        <Select value={pdfOptions.fontSize} onChange={e => setPdfOptions(o => ({...o, fontSize: Number(e.target.value) as typeof o.fontSize}))}><option value="12">12 pt</option><option value="11">11 pt</option></Select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--foreground-muted)] mb-1 block">{t('export.format.lineSpacing')}</label>
                                    <Select value={pdfOptions.lineSpacing} onChange={e => setPdfOptions(o => ({...o, lineSpacing: e.target.value as typeof o.lineSpacing}))}><option value="double">{t('export.format.double')}</option><option value="single">{t('export.format.single')}</option></Select>
                                </div>
                                <CheckboxOption label={t('export.format.titlePage')} checked={pdfOptions.includeTitlePage} onChange={v => setPdfOptions(o => ({...o, includeTitlePage: v}))} />
                            </div>
                        )}
                    </div>
                </AccordionSection>
                <div className="p-4 space-y-3">
                    <Button onClick={handleDownload} className="w-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">{ICONS.EXPORT}</svg>{t('export.options.downloadButton')}</Button>
                    <Button onClick={handleCopyToClipboard} variant="secondary" className="w-full">{copied ? t('export.options.copied') : t('common.copyToClipboard')}</Button>
                </div>
            </CardContent>
        </Card>
    );
};

const ExportPreview: FC = () => {
    const { t, formattedOutput } = useExportViewContext();
    return (
        <Card>
            <CardHeader><h2 className="text-xl font-semibold text-[var(--foreground-primary)]">{t('export.preview.title')}</h2></CardHeader>
            <CardContent>
                <pre className="bg-[var(--background-secondary)] p-4 rounded-md text-sm text-[var(--foreground-secondary)] h-[75vh] overflow-y-auto whitespace-pre-wrap font-sans">
                    {formattedOutput || <span className="text-[var(--foreground-muted)]">{t('export.preview.noContent')}</span>}
                </pre>
            </CardContent>
        </Card>
    );
};

const ExportViewUI: FC = () => {
    const { t, project } = useExportViewContext();
    if (!project) return <div className="flex h-[80vh] w-full items-center justify-center"><Spinner className="w-16 h-16" /></div>;

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1"><ExportControls /></div>
                <div className="lg:col-span-2"><ExportPreview /></div>
            </div>
        </div>
    );
};

export const ExportView: FC = () => {
    const contextValue = useExportView();
    return (
        <ExportViewContext.Provider value={contextValue}>
            <ExportViewUI />
        </ExportViewContext.Provider>
    );
};