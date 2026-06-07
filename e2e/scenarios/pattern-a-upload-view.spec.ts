import { test, expect } from '@playwright/test';
import {
  openApp,
  uploadPdf,
  SAMPLE_PDF,
  enterEditMode,
  enterViewMode,
} from '../helpers/pdf-editor';

test.describe('Pattern A: アップロード・表示', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await openApp(page);
  });

  test('A-1: 初期画面にドロップゾーンが表示される', async ({ page }) => {
    await expect(page.getByText('PDFファイルをドラッグ&ドロップ')).toBeVisible();
    await expect(page.getByText('最大 25MB まで対応')).toBeVisible();
  });

  test('A-2: PDFアップロード後にファイル情報が表示される', async ({ page }) => {
    await uploadPdf(page, SAMPLE_PDF);
    await expect(page.getByText('sample.pdf')).toBeVisible();
    await expect(page.getByText('ページ数:')).toBeVisible();
    await expect(page.getByRole('button', { name: '編集モード' })).toBeVisible();
    await expect(page.getByTestId('pdf-viewer-ready')).toBeVisible({ timeout: 15000 });
  });

  test('A-3: 表示モードでは編集ツールバーが非表示', async ({ page }) => {
    await uploadPdf(page, SAMPLE_PDF);
    await expect(page.getByLabel('編集ツール')).not.toBeVisible();
  });

  test('A-4: 編集モード ↔ 表示モードの切り替え', async ({ page }) => {
    await uploadPdf(page, SAMPLE_PDF);
    await enterEditMode(page);
    await expect(page.getByRole('button', { name: '表示モード' })).toBeVisible();
    await enterViewMode(page);
    await expect(page.getByRole('button', { name: '編集モード' })).toBeVisible();
  });
});
