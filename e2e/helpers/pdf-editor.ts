import { expect, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');
export const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');
export const SAMPLE_PDF = path.join(FIXTURES_DIR, 'sample.pdf');
export const MULTI_PAGE_PDF = path.join(FIXTURES_DIR, 'multi-page.pdf');
export const INVALID_TXT = path.join(FIXTURES_DIR, 'invalid.txt');

export async function openApp(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'PDF Editor' })).toBeVisible();
}

export async function uploadPdf(page: Page, filePath: string): Promise<void> {
  await page.locator('input[type="file"]').setInputFiles(filePath);
  await expect(page.getByText('ページ数:')).toBeVisible({ timeout: 15000 });
}

export async function enterEditMode(page: Page): Promise<void> {
  await page.getByRole('button', { name: '編集モード' }).click();
  await expect(page.getByLabel('編集ツール')).toBeVisible();
  await expect(page.getByTestId('pdf-viewer-ready')).toBeVisible({ timeout: 15000 });
}

export async function enterViewMode(page: Page): Promise<void> {
  await page.getByRole('button', { name: '表示モード' }).click();
  await expect(page.getByRole('button', { name: '編集モード' })).toBeVisible();
  await expect(page.getByLabel('編集ツール')).not.toBeVisible();
}

export async function selectTool(page: Page, tool: '注釈' | 'テキスト挿入' | '選択'): Promise<void> {
  await page.getByRole('button', { name: tool }).click();
}

export function editOverlay(page: Page) {
  return page.locator('.pdf-overlay.clickable');
}

export async function addAnnotation(
  page: Page,
  text: string,
  position: { x: number; y: number } = { x: 220, y: 280 },
): Promise<void> {
  await selectTool(page, '注釈');
  await expect(editOverlay(page)).toBeVisible();
  await editOverlay(page).click({ position });
  const dialog = page.getByRole('dialog', { name: '注釈を追加' });
  await expect(dialog).toBeVisible({ timeout: 10000 });
  await dialog.locator('input').fill(text);
  await dialog.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText('注釈を追加しました')).toBeVisible();
}

export async function addTextInsertion(
  page: Page,
  text: string,
  position: { x: number; y: number } = { x: 320, y: 380 },
): Promise<void> {
  await selectTool(page, 'テキスト挿入');
  await expect(editOverlay(page)).toBeVisible();
  await editOverlay(page).click({ position });
  const dialog = page.getByRole('dialog', { name: 'テキストを挿入' });
  await expect(dialog).toBeVisible({ timeout: 10000 });
  await dialog.locator('input').fill(text);
  await dialog.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText('テキストを挿入しました')).toBeVisible();
}

export async function goToPage(page: Page, direction: 'next' | 'prev'): Promise<void> {
  const label = direction === 'next' ? '次のページ' : '前のページ';
  await page.getByRole('button', { name: label }).click();
}

export async function savePdf(page: Page, downloadDir = DOWNLOADS_DIR): Promise<string> {
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
  await page.getByRole('button', { name: '保存・ダウンロード' }).click();
  await expect(
    page.getByTestId('toast-success').filter({ hasText: 'PDFをダウンロードしました' }),
  ).toBeVisible({ timeout: 15000 });

  const download = await downloadPromise;
  fs.mkdirSync(downloadDir, { recursive: true });
  const savePath = path.join(downloadDir, download.suggestedFilename());
  await download.saveAs(savePath);
  return savePath;
}

export async function verifyPdfFile(
  filePath: string,
  expectedTexts: string[],
  options?: { minPages?: number },
): Promise<void> {
  const bytes = new Uint8Array(fs.readFileSync(filePath));
  expect(Buffer.from(bytes.subarray(0, 4)).toString()).toBe('%PDF');

  const pdfDoc = await PDFDocument.load(bytes);
  expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(options?.minPages ?? 1);

  const loadingTask = pdfjsLib.getDocument({ data: bytes, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  let combinedText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const pdfPage = await pdf.getPage(pageNum);
    const content = await pdfPage.getTextContent();
    combinedText += content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
  }

  for (const text of expectedTexts) {
    expect(combinedText).toContain(text);
  }
}

export function acceptNextDialog(page: Page, messageIncludes: string): void {
  page.once('dialog', (dialog) => {
    expect(dialog.message()).toContain(messageIncludes);
    dialog.accept();
  });
}

export async function resetToUpload(page: Page): Promise<void> {
  if (await page.getByRole('button', { name: '別のファイル' }).isVisible()) {
    acceptNextDialog(page, '別のファイルを開きますか');
    await page.getByRole('button', { name: '別のファイル' }).click();
  } else if (await page.getByRole('button', { name: 'リセット' }).isVisible()) {
    await page.getByRole('button', { name: 'リセット' }).click();
  }
  await expect(page.getByText('PDFファイルをドラッグ&ドロップ')).toBeVisible();
}
