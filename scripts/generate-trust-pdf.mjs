/**
 * Generate Trust PDF
 * Converts MASTER_DOCUMENT_CONSOLIDATED.md → print-ready HTML → D drive
 * Open the output HTML in Chrome and File → Print → Save as PDF
 *
 * Run: node scripts/generate-trust-pdf.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { marked } from '../node_modules/marked/lib/marked.esm.js';

const inputPath  = 'legal/MASTER_DOCUMENT_CONSOLIDATED.md';
const outputPath = 'D:/HOWARD_JONES_TRUST_CONSOLIDATED.html';

const markdown = readFileSync(inputPath, 'utf8');
const body     = marked.parse(markdown);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Howard Jones Bloodline Ancestral Trust — Consolidated Master Book</title>
<style>
  @page {
    size: letter;
    margin: 1in 1in 1in 1in;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.7;
    color: #000;
    max-width: 100%;
  }
  h1 {
    font-size: 18pt;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1pt;
    margin: 24pt 0 12pt 0;
    page-break-before: always;
  }
  h1:first-of-type { page-break-before: avoid; }
  h2 {
    font-size: 14pt;
    text-transform: uppercase;
    margin: 18pt 0 8pt 0;
    border-bottom: 1px solid #000;
    padding-bottom: 3pt;
  }
  h3 {
    font-size: 12pt;
    font-weight: bold;
    margin: 14pt 0 6pt 0;
  }
  h4 {
    font-size: 12pt;
    font-weight: bold;
    font-style: italic;
    margin: 10pt 0 4pt 0;
  }
  p { margin-bottom: 10pt; text-align: justify; }
  ul, ol { margin: 8pt 0 8pt 24pt; }
  li { margin-bottom: 4pt; }
  strong { font-weight: bold; }
  em { font-style: italic; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
    font-size: 11pt;
  }
  th, td {
    border: 1px solid #000;
    padding: 5pt 8pt;
    text-align: left;
    vertical-align: top;
  }
  th { background: #f0f0f0; font-weight: bold; }
  blockquote {
    margin: 10pt 24pt;
    padding: 8pt 12pt;
    border-left: 3px solid #000;
    font-style: italic;
  }
  code {
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    background: #f5f5f5;
    padding: 1pt 3pt;
  }
  pre {
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    background: #f5f5f5;
    padding: 8pt;
    margin: 8pt 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  hr {
    border: none;
    border-top: 1px solid #000;
    margin: 16pt 0;
  }

  /* Page break control */
  h1, h2 { page-break-after: avoid; }
  table { page-break-inside: avoid; }

  /* Cover page */
  .cover {
    text-align: center;
    padding-top: 2in;
    page-break-after: always;
  }
  .cover h1 {
    font-size: 22pt;
    page-break-before: avoid;
    border-bottom: 2px solid #000;
    padding-bottom: 12pt;
    margin-bottom: 24pt;
  }
  .cover p {
    font-size: 13pt;
    text-align: center;
    margin-bottom: 8pt;
  }
  .cover .ein {
    margin-top: 24pt;
    font-size: 11pt;
    color: #333;
  }
</style>
</head>
<body>

<div class="cover">
  <h1>Howard Jones Bloodline Ancestral Trust</h1>
  <p><strong>Consolidated Master Trust Book</strong></p>
  <p>Complete Legal Package — 210 Pages</p>
  <p>Irrevocable Trust Agreement &amp; All Exhibits</p>
  <div class="ein">
    <p>EIN: 41-6850149</p>
    <p>Established: January 8, 2026</p>
    <p>Clarke County, Georgia</p>
    <p style="margin-top:16pt;font-style:italic;">Grantor: Rickey Allan Howard</p>
    <p style="font-style:italic;">Co-Trustees: Teara Howard &amp; Joseph Lumpkin Jr.</p>
    <p style="font-size:10pt;">Georgia Trust Code O.C.G.A. Title 53</p>
  </div>
</div>

${body}

</body>
</html>`;

writeFileSync(outputPath, html, 'utf8');
console.log('');
console.log('✓ Trust document written to D drive:');
console.log('  D:\\HOWARD_JONES_TRUST_CONSOLIDATED.html');
console.log('');
console.log('TO SAVE AS PDF:');
console.log('  1. Open D:\\HOWARD_JONES_TRUST_CONSOLIDATED.html in Chrome');
console.log('  2. Press Ctrl+P (Print)');
console.log('  3. Destination → Save as PDF');
console.log('  4. Paper size: Letter | Margins: Default | Background graphics: ON');
console.log('  5. Save as: D:\\HOWARD_JONES_TRUST_CONSOLIDATED.pdf');
console.log('');
console.log('Ready for print shop.');
