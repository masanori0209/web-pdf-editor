import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'fixtures');

async function createSamplePdf(pages, label) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < pages; i += 1) {
    const page = pdfDoc.addPage([595, 842]);
    page.drawText(`${label} - Page ${i + 1}`, {
      x: 72,
      y: 760,
      size: 20,
      font,
      color: rgb(0.1, 0.1, 0.4),
    });
    page.drawText('E2E test document for PDF editing.', { x: 72, y: 720, size: 14, font });
  }

  return pdfDoc.save();
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const singlePageBytes = await createSamplePdf(1, 'PDF Editor E2E Sample');
  fs.writeFileSync(path.join(outDir, 'sample.pdf'), singlePageBytes);

  const multiPageBytes = await createSamplePdf(2, 'Multi Page Sample');
  fs.writeFileSync(path.join(outDir, 'multi-page.pdf'), multiPageBytes);

  fs.writeFileSync(path.join(outDir, 'invalid.txt'), 'not a pdf');
  console.log('E2E fixtures generated');
}

void main();
