import { test, expect } from '@playwright/test';
import {
  openApp,
  uploadPdf,
  SAMPLE_PDF,
  enterEditMode,
  addTextInsertion,
  selectTool,
  savePdf,
  verifyPdfFile,
  DOWNLOADS_DIR,
} from '../helpers/pdf-editor';

test.describe('Pattern E: 表示・スタイル', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await openApp(page);
    await uploadPdf(page, SAMPLE_PDF);
    await enterEditMode(page);
  });

  test('E-1: ズームイン・ズームアウト', async ({ page }) => {
    await expect(page.getByText('100%')).toBeVisible();
    await page.getByRole('button', { name: 'ズームイン' }).click();
    await expect(page.getByText('110%')).toBeVisible();
    await page.getByRole('button', { name: 'ズームアウト' }).click();
    await expect(page.getByText('100%')).toBeVisible();
  });

  test('E-2: フォントサイズ・色・フォント種別を変更して挿入', async ({ page }) => {
    await selectTool(page, 'テキスト挿入');
    await page.locator('#font-size').fill('20');
    await page.locator('#text-color').fill('#ff0000');
    await page.locator('#font-family').selectOption('Noto Sans JP');

    await addTextInsertion(page, 'スタイルテスト', { x: 250, y: 400 });

    const overlay = page.locator('.text-insertion-overlay').filter({ hasText: 'スタイルテスト' });
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveCSS('color', 'rgb(255, 0, 0)');

    const savedPath = await savePdf(page, DOWNLOADS_DIR);
    await verifyPdfFile(savedPath, ['スタイルテスト']);
  });

  test('E-3: 注釈ツール選択時に注釈設定が表示される', async ({ page }) => {
    await selectTool(page, '注釈');
    await expect(page.getByText('注釈設定')).toBeVisible();
    await expect(page.locator('#font-size')).toBeVisible();
    await expect(page.locator('#font-family')).toBeVisible();
  });

  test('E-4: 選択ツールではオーバーレイがクリック不可', async ({ page }) => {
    await selectTool(page, '選択');
    await expect(page.locator('.pdf-overlay.clickable')).toHaveCount(0);
  });
});
