import { test, expect } from '@playwright/test';
import {
  openApp,
  uploadPdf,
  INVALID_TXT,
  SAMPLE_PDF,
  enterEditMode,
  acceptNextDialog,
} from '../helpers/pdf-editor';

test.describe('Pattern F: バリデーション・エラー', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await openApp(page);
  });

  test('F-1: 非PDFファイルは拒否される', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(INVALID_TXT);
    await expect(page.getByText('PDFファイルを選択してください')).toBeVisible();
  });

  test('F-2: エラー後にリセットでアップロード画面に戻る', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(INVALID_TXT);
    await page.getByRole('button', { name: 'リセット' }).click();
    await expect(page.getByText('PDFファイルをドラッグ&ドロップ')).toBeVisible();
  });

  test('F-3: 編集中の別ファイル切替は確認ダイアログを表示', async ({ page }) => {
    await uploadPdf(page, SAMPLE_PDF);
    await enterEditMode(page);

    acceptNextDialog(page, '別のファイルを開きますか');
    await page.getByRole('button', { name: '別のファイル' }).click();
    await expect(page.getByText('PDFファイルをドラッグ&ドロップ')).toBeVisible();
  });
});
