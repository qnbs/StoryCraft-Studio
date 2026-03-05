// Service für EPUB-Export via Node-Backend
// POST /api/export/epub mit Storydaten, Response: EPUB-Blob

export interface EpubExportOptions {
  title: string;
  author: string;
  synopsis?: string;
  chapters: Array<{ title: string; content: string }>;
  coverImage?: string; // base64
}

export async function exportEpubViaApi(options: EpubExportOptions): Promise<Blob> {
  const response = await fetch('/api/export/epub', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  if (!response.ok) {
    throw new Error('Serverfehler beim EPUB-Export');
  }
  const epubBlob = await response.blob();
  return epubBlob;
}
