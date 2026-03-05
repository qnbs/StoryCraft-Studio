import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectProjectData } from '../features/project/projectSelectors';
import { projectActions } from '../features/project/projectSlice';
import { storageService } from '../services/storageService';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Modal } from './ui/Modal';
import { Select } from './ui/Select';
import { Spinner } from './ui/Spinner';
import { useToast } from './ui/Toast';
import mammoth from 'mammoth';

export const AdvancedImportExport: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const project = useAppSelector(selectProjectData);
  const toast = useToast();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [importFormat, setImportFormat] = useState<'json' | 'markdown' | 'docx'>('json');
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown' | 'docx'>('json');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = async () => {
    if (!project) return;

    setIsProcessing(true);
    try {
      const importedProject = await storageService.importProject();
      if (importedProject) {
        dispatch(projectActions.loadProject(importedProject));
        toast.success(t('export.importSuccess'), importedProject.title);
        setIsImportModalOpen(false);
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(t('export.importFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (!project) return;

    setIsProcessing(true);
    try {
      await storageService.exportProject(project, exportFormat);
      toast.success(t('export.exportSuccess'), project.title);
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('export.exportFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDocxImport = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      // Parse the text into a project structure
      const lines = text.split('\n');
      let title = 'Imported from Word';
      let manuscript = '';

      // Simple parsing - look for title and content
      for (const line of lines) {
        if (line.trim() && !title) {
          title = line.trim();
        } else if (line.trim()) {
          manuscript += line + '\n';
        }
      }

      const importedProject = {
        id: Date.now().toString(),
        title,
        author: '',
        description: 'Imported from Word document',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        characters: [],
        worlds: [],
        manuscript: manuscript.trim(),
        templates: [],
        settings: project?.settings || {
          theme: 'dark',
          editorFont: 'serif',
          aiCreativity: 'Balanced',
          aiModel: 'gemini-1.5-flash',
          advancedAi: {
            model: 'gemini-1.5-flash',
            temperature: 0.7
          }
        }
      };

      dispatch(projectActions.loadProject(importedProject));
      toast.success(t('export.importSuccess'), importedProject.title);
    } catch (error) {
      console.error('DOCX import failed:', error);
      toast.error(t('export.importFailed'));
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => setIsImportModalOpen(true)}
          className="w-full"
          variant="secondary"
        >
          {t('export.importProject')}
        </Button>
        <Button
          onClick={() => setIsExportModalOpen(true)}
          className="w-full"
          variant="secondary"
        >
          {t('export.exportProject')}
        </Button>
      </div>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={t('export.importModalTitle')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
              {t('export.importFormat')}
            </label>
            <Select
              value={importFormat}
              onChange={(e) => setImportFormat(e.target.value as any)}
            >
              <option value="json">JSON (.json)</option>
              <option value="markdown">Markdown (.md)</option>
              <option value="docx">Word Document (.docx)</option>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsImportModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleImport}
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner /> : t('export.import')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={t('export.exportModalTitle')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
              {t('export.exportFormat')}
            </label>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
            >
              <option value="json">JSON (.json)</option>
              <option value="markdown">Markdown (.md)</option>
              <option value="docx">Word Document (.docx)</option>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsExportModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleExport}
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner /> : t('export.export')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};