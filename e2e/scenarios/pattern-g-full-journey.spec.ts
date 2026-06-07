import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  openApp,
  uploadPdf,
  SAMPLE_PDF,
  MULTI_PAGE_PDF,
  INVALID_TXT,
  enterEditMode,
  enterViewMode,
  addAnnotation,
  addTextInsertion,
  goToPage,
  savePdf,
  verifyPdfFile,
  selectTool,
  editOverlay,
  acceptNextDialog,
  resetToUpload,
  DOWNLOADS_DIR,
} from '../helpers/pdf-editor';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const journeyDownloadDir = path.join(__dirname, '..', 'downloads', 'full-journey');

/**
 * Pattern G: 一連のユーザージャーニー
 * 単一ブラウザセッションで全パターンを順番に実行
 */
test.describe('Pattern G: フルジャーニー（一連の流れ）', () => {
  test('G-1: 全シナリオを順次実行', async ({ page }) => {
    test.setTimeout(180000);

    // --- Phase 1: バリデーション ---
    await openApp(page);
    await page.locator('input[type="file"]').setInputFiles(INVALID_TXT);
    await expect(page.getByText('PDFファイルを選択してください')).toBeVisible();
    await resetToUpload(page);

    // --- Phase 2: アップロード・表示 ---
    await uploadPdf(page, SAMPLE_PDF);
    await expect(page.getByText('sample.pdf')).toBeVisible();
    await expect(page.getByTestId('pdf-viewer-ready')).toBeVisible({ timeout: 15000 });

    // --- Phase 3: 編集モード開始 ---
    await enterEditMode(page);
    await expect(page.getByRole('button', { name: '保存・ダウンロード' })).toBeDisabled();

    // --- Phase 4: 空入力拒否 ---
    await selectTool(page, '注釈');
    await editOverlay(page).click({ position: { x: 200, y: 250 } });
    await page.getByRole('dialog', { name: '注釈を追加' }).getByRole('button', { name: '追加' }).click();
    await expect(page.getByTestId('toast-error')).toContainText('テキストを入力してください');
    await page.getByRole('dialog', { name: '注釈を追加' }).getByRole('button', { name: 'キャンセル' }).click();

    // --- Phase 5: 日本語編集 ---
    await addAnnotation(page, 'ジャーニー注釈', { x: 220, y: 280 });
    await addTextInsertion(page, 'ジャーニーテキスト', { x: 320, y: 380 });
    await expect(page.getByText('注釈 (1)')).toBeVisible();
    await expect(page.getByText('テキスト挿入 (1)')).toBeVisible();

    // --- Phase 6: 表示・スタイル ---
    await page.getByRole('button', { name: 'ズームイン' }).click();
    await expect(page.getByText('110%')).toBeVisible();
    await page.getByRole('button', { name: 'ズームアウト' }).click();

    // --- Phase 7: 表示モードに切替 → 編集再開 ---
    await enterViewMode(page);
    await expect(page.getByLabel('編集ツール')).not.toBeVisible();
    await enterEditMode(page);
    await expect(page.getByText('注釈 (1)')).toBeVisible();

    // --- Phase 8: 個別削除 → 再追加 ---
    await page.getByRole('button', { name: '注釈 ジャーニー注釈 を削除' }).click();
    await expect(page.getByText('注釈 (1)')).not.toBeVisible();
    await addAnnotation(page, '再追加注釈', { x: 240, y: 300 });

    // --- Phase 9: 保存（1ページ目） ---
    const savedPath1 = await savePdf(page, journeyDownloadDir);
    await verifyPdfFile(savedPath1, ['再追加注釈', 'ジャーニーテキスト']);

    // --- Phase 10: 複数ページPDFへ切替 ---
    acceptNextDialog(page, '別のファイルを開きますか');
    await page.getByRole('button', { name: '別のファイル' }).click();
    await uploadPdf(page, MULTI_PAGE_PDF);
    await expect(page.getByText('1 / 2')).toBeVisible();
    await enterEditMode(page);

    await addAnnotation(page, 'P1注釈', { x: 180, y: 250 });
    await goToPage(page, 'next');
    await expect(page.getByText('2 / 2')).toBeVisible();
    await addTextInsertion(page, 'P2テキスト', { x: 200, y: 320 });

    // --- Phase 11: ページ間オーバーレイ確認 ---
    await goToPage(page, 'prev');
    await expect(page.locator('.annotation-overlay')).toContainText('P1注釈');
    await goToPage(page, 'next');
    await expect(page.locator('.text-insertion-overlay')).toContainText('P2テキスト');

    // --- Phase 12: 最終保存 ---
    const savedPath2 = await savePdf(page, journeyDownloadDir);
    await verifyPdfFile(savedPath2, ['P1注釈', 'P2テキスト', 'Multi Page Sample'], { minPages: 2 });

    // --- Phase 13: すべて削除 ---
    acceptNextDialog(page, 'すべての編集内容を削除');
    await page.getByRole('button', { name: 'すべて削除' }).click();
    await expect(page.getByRole('button', { name: '保存・ダウンロード' })).toBeDisabled();

    // --- Phase 14: ホームに戻る ---
    acceptNextDialog(page, '別のファイルを開きますか');
    await page.getByRole('button', { name: '別のファイル' }).click();
    await expect(page.getByText('PDFファイルをドラッグ&ドロップ')).toBeVisible();
  });
});
