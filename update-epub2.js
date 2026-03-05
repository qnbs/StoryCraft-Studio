const fs = require('fs');
const filepath = 'hooks/useExportView.ts';
let content = fs.readFileSync(filepath, 'utf8');

// The replacement done in the previous step needs to be adjusted
const previousReplacement = `      if (synopsis) {
            contentOpf += \`<item id="synopsis" href="synopsis.xhtml" media-type="application/xhtml+xml"/>\\n\`;
            spineRef += \`<itemref idref="synopsis"/>\\n\`;
            tocNcx += \`<navPoint id="navPoint-\\${chapterCount}" playOrder="\${chapterCount}"><navLabel><text>AI Synopsis</text></navLabel><content src="synopsis.xhtml"/></navPoint>\\n\`;
            chapterCount++;
            
            const synopsisHtml = \`<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>AI Synopsis</title></head>
<body><h2>AI Synopsis</h2>\${synopsis.split('\\n').map(p => p.trim() ? \`<p>\${p}</p>\` : '').join('')}</body></html>\`;
            folder?.file("synopsis.xhtml", synopsisHtml);
        }`;

// Let's restore the original using a broader replace and then inject below `let chapterCount = 2;`
// Actually, let's just insert after `let chapterCount = 2;`
