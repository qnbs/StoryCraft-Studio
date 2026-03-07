// DEPRECATED: Node.js-Backend für EPUB-Export
// EPUB-Export ist seit v2.0 vollständig client-seitig implementiert (services/epubApiService.ts).
// Diese Datei wird nicht mehr verwendet und wird in einem zukünftigen Release entfernt.
// Ursprüngliches Beispiel für Express + epub-gen

const express = require('express');
const Epub = require('epub-gen');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json({ limit: '2mb' }));

app.post('/api/export/epub', async (req, res) => {
  const { title, author, synopsis, chapters, coverImage } = req.body;
  const content = [];
  if (synopsis) content.push({ title: 'Synopsis', data: synopsis });
  for (const chapter of chapters) {
    content.push({ title: chapter.title, data: chapter.content });
  }
  const epubOptions = {
    title,
    author,
    cover: coverImage,
    content,
    verbose: false,
    output: path.join(__dirname, 'temp.epub'),
  };
  try {
    await new Epub(epubOptions).promise;
    const epubBuffer = fs.readFileSync(epubOptions.output);
    res.setHeader('Content-Type', 'application/epub+zip');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.epub"`);
    res.send(epubBuffer);
    fs.unlinkSync(epubOptions.output);
  } catch (e) {
    res.status(500).json({ error: 'EPUB-Export fehlgeschlagen', details: e.message });
  }
});

app.listen(3001, () => console.log('EPUB-Export-API läuft auf Port 3001'));
