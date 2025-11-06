import { useState, useMemo, useEffect, useCallback } from 'react';
import jspdf from 'jspdf';
import { useTranslation } from './useTranslation';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectProjectData, selectAllCharacters, selectAllWorlds } from '../features/project/projectSelectors';
import { generateSynopsisThunk } from '../features/project/projectSlice';
import { Character, World } from '../types';

type Format = 'md' | 'txt' | 'pdf';
interface ContentToExport {
    title: boolean;
    characters: boolean;
    worlds: boolean;
    manuscript: boolean;
}
interface PdfOptions {
    font: 'Times' | 'Courier' | 'Helvetica';
    fontSize: 11 | 12;
    lineSpacing: 'single' | 'double';
    includeTitlePage: boolean;
}
interface AiEnhancements {
    synopsis: boolean;
}

export const useExportView = () => {
    const { t, language } = useTranslation();
    const dispatch = useAppDispatch();
    const projectState = useAppSelector(state => state.project.present);
    const project = projectState.data;
    const characters = useAppSelector(selectAllCharacters);
    const worlds = useAppSelector(selectAllWorlds);

    const [format, setFormat] = useState<Format>('md');
    const [contentToExport, setContentToExport] = useState<ContentToExport>({ title: true, characters: true, worlds: true, manuscript: true });
    const [pdfOptions, setPdfOptions] = useState<PdfOptions>({ font: 'Times', fontSize: 12, lineSpacing: 'double', includeTitlePage: true });
    const [aiEnhancements, setAiEnhancements] = useState<AiEnhancements>({ synopsis: false });
    const [isGeneratingSynopsis, setIsGeneratingSynopsis] = useState(false);
    const [synopsis, setSynopsis] = useState('');
    const [copied, setCopied] = useState(false);

    const generateSynopsis = useCallback(async () => {
        setIsGeneratingSynopsis(true);
        const resultAction = await dispatch(generateSynopsisThunk(language));
        if (generateSynopsisThunk.fulfilled.match(resultAction)) {
            setSynopsis(resultAction.payload);
        }
        setIsGeneratingSynopsis(false);
    }, [dispatch, language]);

    useEffect(() => {
        if (aiEnhancements.synopsis && !synopsis && !isGeneratingSynopsis) {
            generateSynopsis();
        } else if (!aiEnhancements.synopsis) {
            setSynopsis('');
        }
    }, [aiEnhancements.synopsis, synopsis, isGeneratingSynopsis, generateSynopsis]);

    const formattedOutput = useMemo(() => {
        let output = '';
        if (contentToExport.title) {
            output += `# ${project.title}\n\n**${t('export.loglineLabel')}:** ${project.logline}\n\n`;
        }
        if (aiEnhancements.synopsis && synopsis) {
            output += `## ${t('export.ai.synopsisTitle')}\n\n${synopsis}\n\n`;
        }
        if (contentToExport.characters && characters.length > 0) {
            output += `## ${t('export.charactersLabel')}\n\n`;
            characters.forEach(char => {
                output += `### ${char.name}\n- **${t('export.appearanceLabel')}:** ${char.appearance}\n- **${t('export.motivationLabel')}:** ${char.motivation}\n- **${t('export.backstoryLabel')}:** ${char.backstory}\n- **${t('export.notesLabel')}:** ${char.notes}\n\n`;
            });
        }
        if (contentToExport.worlds && worlds.length > 0) {
            output += `## ${t('export.worldsLabel')}\n\n`;
            worlds.forEach(world => {
                output += `### ${world.name}\n- **${t('export.descriptionLabel')}:** ${world.description}\n- **${t('export.geographyLabel')}:** ${world.geography}\n- **${t('export.magicSystemLabel')}:** ${world.magicSystem}\n\n`;
            });
        }
        if (contentToExport.manuscript && project.manuscript.length > 0) {
            output += `## ${t('export.manuscriptLabel')}\n\n`;
            project.manuscript.forEach(section => {
                output += `### ${section.title}\n\n${section.content || `*(${t('export.emptySection')})*`}\n\n`;
            });
        }
        return output.trim();
    }, [project, characters, worlds, contentToExport, aiEnhancements, synopsis, t]);

    const downloadPdf = useCallback(() => {
        const doc = new jspdf();
        const margin = 20;
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = margin;
        
        doc.setFont(pdfOptions.font, 'normal');
        doc.setFontSize(pdfOptions.fontSize);
        const lineSpacingFactor = pdfOptions.lineSpacing === 'double' ? 10 : 5;

        const addText = (text: string, options: { size?: number, style?: string, isHeader?: boolean } = {}) => {
            doc.setFontSize(options.size || pdfOptions.fontSize);
            doc.setFont(pdfOptions.font, options.style || 'normal');
            
            const lines = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - margin * 2);
            lines.forEach((line: string) => {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += lineSpacingFactor;
            });
            if (options.isHeader) y += lineSpacingFactor / 2;
        };

        // Title Page
        if (pdfOptions.includeTitlePage) {
            doc.setFontSize(24);
            doc.text(project.title, doc.internal.pageSize.getWidth() / 2, pageHeight / 2 - 10, { align: 'center' });
            doc.setFontSize(14);
            doc.text(`Logline: ${project.logline}`, doc.internal.pageSize.getWidth() / 2, pageHeight / 2, { align: 'center' });
            doc.addPage();
            y = margin;
        }

        // Main content
        if (synopsis) {
            addText(t('export.ai.synopsisTitle'), { size: 18, style: 'bold', isHeader: true });
            addText(synopsis);
        }
        
        project.manuscript.forEach(section => {
            addText(section.title, { size: 16, style: 'bold', isHeader: true });
            addText(section.content || `(${t('export.emptySection')})`);
        });

        doc.save(`${project.title}.pdf`);
    }, [pdfOptions, project, synopsis, t]);

    const handleDownload = useCallback(() => {
        if (format === 'pdf') {
            downloadPdf();
        } else {
            const extension = format === 'md' ? 'md' : 'txt';
            let textOutput = formattedOutput;
            if (format === 'txt') {
                textOutput = textOutput.replace(/#+\s/g, '').replace(/\*\*(.*?)\*\*/g, '$1');
            }
            const blob = new Blob([textOutput], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title}.${extension}`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }, [format, formattedOutput, project.title, downloadPdf]);

    const handleCopyToClipboard = useCallback(() => {
        let textOutput = formattedOutput;
        if (format === 'txt') {
            textOutput = textOutput.replace(/#+\s/g, '').replace(/\*\*(.*?)\*\*/g, '$1');
        }
        navigator.clipboard.writeText(textOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [formattedOutput, format]);

    return {
        t,
        project,
        format,
        setFormat,
        contentToExport,
        setContentToExport,
        pdfOptions,
        setPdfOptions,
        aiEnhancements,
        setAiEnhancements,
        isGeneratingSynopsis,
        synopsis,
        copied,
        handleDownload,
        handleCopyToClipboard,
        formattedOutput,
    };
};

export type UseExportViewReturnType = ReturnType<typeof useExportView>;