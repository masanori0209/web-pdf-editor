import { test, expect } from '@playwright/test';
import {
  openApp,
  uploadPdf,
  MULTI_PAGE_PDF,
  enterEditMode,
  addAnnotation,
  addTextInsertion,
  goToPage,
  savePdf,
  verifyPdfFile,
  DOWNLOADS_DIR,
} from '../helpers/pdf-editor';

test.describe('Pattern D: 複数ページ', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await openApp(page);
    await uploadPdf(page, MULTI_PAGE_PDF);
    await expect(page.getByText('1 / 2')).toBeVisible();
    await enterEditMode(page);
  });

  test('D-1: 1ページ目と2ページ目に別々の編集', async ({ page }) => {
    await addAnnotation(page, '1ページ目注釈', { x: 180, y: 250 });

    await goToPage(page, 'next');
    await expect(page.getByText('2 / 2')).toBeVisible();
    await addTextInsertion(page, '2ページ目テキスト', { x: 200, y: 300 });

    await expect(page.getByText('P1: "1ページ目注釈"')).toBeVisible();
    await expect(page.getByText('P2: "2ページ目テキスト"')).toBeVisible();
  });

  test('D-2: ページ切り替えでオーバーレイ表示が切り替わる', async ({ page }) => {
    await goToPage(page, 'next');
    await addAnnotation(page, '2ページのみ', { x: 200, y: 300 });

    await goToPage(page, 'prev');
    await expect(page.locator('.annotation-overlay')).toHaveCount(0);

    await goToPage(page, 'next');
    await expect(page.locator('.annotation-overlay')).toContainText('2ページのみ');
  });

  test('D-3: 複数ページ編集後に保存', async ({ page }) => {
    await addAnnotation(page, 'Page1Note', { x: 180, y: 250 });
    await goToPage(page, 'next');
    await addTextInsertion(page, 'Page2Text', { x: 200, y: 300 });

    const savedPath = await savePdf(page, DOWNLOADS_DIR);
    await verifyPdfFile(savedPath, ['Page1Note', 'Page2Text', 'Multi Page Sample'], { minPages: 2 });
  });
});
