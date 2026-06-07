import { test, expect } from '@playwright/test';
import {
  openApp,
  uploadPdf,
  SAMPLE_PDF,
  enterEditMode,
  addAnnotation,
  addTextInsertion,
  savePdf,
  verifyPdfFile,
  selectTool,
  DOWNLOADS_DIR,
} from '../helpers/pdf-editor';

test.describe('Pattern B: 編集・保存', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await openApp(page);
    await uploadPdf(page, SAMPLE_PDF);
    await enterEditMode(page);
  });

  test('B-1: 日本語注釈 + 日本語テキスト挿入 → 保存', async ({ page }) => {
    await addAnnotation(page, '日本語注釈テスト');
    await addTextInsertion(page, '日本語テキスト');

    await expect(page.getByText('注釈 (1)')).toBeVisible();
    await expect(page.getByText('テキスト挿入 (1)')).toBeVisible();
    await expect(page.locator('.annotation-overlay')).toContainText('日本語注釈テスト');
    await expect(page.locator('.text-insertion-overlay')).toContainText('日本語テキスト');

    const savedPath = await savePdf(page, DOWNLOADS_DIR);
    await verifyPdfFile(savedPath, ['日本語注釈テスト', '日本語テキスト']);
  });

  test('B-2: 英数字テキスト（Helvetica）→ 保存', async ({ page }) => {
    await selectTool(page, 'テキスト挿入');
    await page.locator('#font-family').selectOption('Helvetica');
    await addTextInsertion(page, 'Hello PDF', { x: 200, y: 350 });

    const savedPath = await savePdf(page, DOWNLOADS_DIR);
    await verifyPdfFile(savedPath, ['Hello PDF']);
  });

  test('B-3: 注釈のみ追加 → 保存', async ({ page }) => {
    await addAnnotation(page, '注釈のみ');
    await expect(page.getByText('テキスト挿入 (1)')).not.toBeVisible();

    const savedPath = await savePdf(page, DOWNLOADS_DIR);
    await verifyPdfFile(savedPath, ['注釈のみ']);
  });

  test('B-4: テキスト挿入のみ → 保存', async ({ page }) => {
    await addTextInsertion(page, '挿入のみテキスト');
    await expect(page.getByText('注釈 (1)')).not.toBeVisible();

    const savedPath = await savePdf(page, DOWNLOADS_DIR);
    await verifyPdfFile(savedPath, ['挿入のみテキスト']);
  });

  test('B-5: 未編集時は保存ボタンが無効', async ({ page }) => {
    await expect(page.getByRole('button', { name: '保存・ダウンロード' })).toBeDisabled();
  });
});
