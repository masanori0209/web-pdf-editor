#!/usr/bin/env node
/**
 * Noto Sans JP (TrueType VF) を public/fonts/ に配置する。
 * harumi は CFF/OTF 非対応のため TTF が必須。
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const fontsDir = path.join(root, 'public', 'fonts');
const target = path.join(fontsDir, 'NotoSansJP-VF.ttf');
const zipUrl =
  'https://github.com/notofonts/noto-cjk/releases/download/Sans2.004/02_NotoSansCJK-TTF-VF.zip';
const zipPath = path.join(fontsDir, 'NotoSansCJK-TTF-VF.zip');
const entry = 'Variable/TTF/Subset/NotoSansJP-VF.ttf';

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }
  await pipeline(response.body, createWriteStream(dest));
}

function extractTtf() {
  execSync(`unzip -p "${zipPath}" "${entry}" > "${target}"`, { stdio: 'inherit', shell: true });
  const header = readFileSync(target, { encoding: 'binary', flag: 'r' }).slice(0, 4);
  if (header !== '\x00\x01\x00\x00') {
    throw new Error('Extracted file is not a TrueType font');
  }
}

async function main() {
  mkdirSync(fontsDir, { recursive: true });

  if (existsSync(target)) {
    const header = readFileSync(target, { encoding: 'binary', flag: 'r' }).slice(0, 4);
    if (header === '\x00\x01\x00\x00') {
      console.log('NotoSansJP-VF.ttf already present');
      return;
    }
    rmSync(target);
  }

  console.log('Downloading Noto Sans JP TTF (VF subset)...');
  await download(zipUrl, zipPath);
  console.log('Extracting', entry);
  extractTtf();
  rmSync(zipPath);
  console.log('Font ready:', target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
