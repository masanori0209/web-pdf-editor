#!/usr/bin/env node
/**
 * Downloads PDFium WASM build (paulocoutinhox/pdfium-lib) for pdfium-render.
 * Apache 2.0 — same engine used in Chrome.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', 'pdfium');

const RELEASE_TAG = '7623';
const TARBALL_URL = `https://github.com/paulocoutinhox/pdfium-lib/releases/download/${RELEASE_TAG}/wasm.tgz`;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

function findPdfiumFiles(baseDir) {
  const stack = [baseDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    const js = path.join(dir, 'pdfium.js');
    const wasm = path.join(dir, 'pdfium.wasm');
    if (fs.existsSync(js) && fs.existsSync(wasm)) {
      return { js, wasm };
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        stack.push(path.join(dir, entry.name));
      }
    }
  }
  return null;
}

async function main() {
  ensureDir(outDir);

  if (fs.existsSync(path.join(outDir, 'pdfium.js')) && fs.existsSync(path.join(outDir, 'pdfium.wasm'))) {
    console.log('PDFium WASM already present in public/pdfium/');
    return;
  }

  console.log(`Downloading PDFium WASM (${RELEASE_TAG})...`);
  const tgzPath = path.join(outDir, 'wasm.tgz');
  await download(TARBALL_URL, tgzPath);
  execSync(`tar -xzf "${tgzPath}" -C "${outDir}"`, { stdio: 'inherit' });

  const found = findPdfiumFiles(outDir);
  if (!found) {
    throw new Error('Could not locate pdfium.js / pdfium.wasm after extraction.');
  }

  fs.copyFileSync(found.js, path.join(outDir, 'pdfium.js'));
  fs.copyFileSync(found.wasm, path.join(outDir, 'pdfium.wasm'));
  fs.unlinkSync(tgzPath);
  console.log('PDFium WASM installed to public/pdfium/');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
