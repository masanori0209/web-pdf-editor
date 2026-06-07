import { test, expect } from '@playwright/test';
import {
  openApp,
  uploadPdf,
  SAMPLE_PDF,
  enterEditMode,
  addAnnotation,
  addTextInsertion,
  selectTool,
  editOverlay,
  acceptNextDialog,
} from '../helpers/pdf-editor';

test.describe('Pattern C: 編集管理', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await openApp(page);
    await uploadPdf(page, SAMPLE_PDF);
    await enterEditMode(page);
  });

  test('C-1: 注釈入力を Escape でキャンセル', async ({ page }) => {
    await selectTool(page, '注釈');
    await editOverlay(page).click({ position: { x: 220, y: 280 } });

    const dialog = page.getByRole('dialog', { name: '注釈を追加' });
    await dialog.locator('input').fill('キャンセル対象');
    await dialog.locator('input').press('Escape');

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('button', { name: '保存・ダウンロード' })).toBeDisabled();
  });

  test('C-2: 空テキストの注釈は拒否される', async ({ page }) => {
    await selectTool(page, '注釈');
    await editOverlay(page).click({ position: { x: 220, y: 280 } });
    await page.getByRole('dialog', { name: '注釈を追加' }).getByRole('button', { name: '追加' }).click();

    await expect(page.getByTestId('toast-error')).toContainText('テキストを入力してください');
    await expect(page.getByText('注釈 (1)')).not.toBeVisible();
  });

  test('C-3: 注釈・テキストを個別削除', async ({ page }) => {
    await addAnnotation(page, '削除注釈');
    await addTextInsertion(page, '削除テキスト');

    await page.getByRole('button', { name: '注釈 削除注釈 を削除' }).click();
    await expect(page.getByText('注釈 (1)')).not.toBeVisible();

    await page.getByRole('button', { name: 'テキスト 削除テキスト を削除' }).click();
    await expect(page.getByText('テキスト挿入 (1)')).not.toBeVisible();
    await expect(page.getByRole('button', { name: '保存・ダウンロード' })).toBeDisabled();
  });

  test('C-4: すべて削除（確認ダイアログ）', async ({ page }) => {
    await addAnnotation(page, '一括削除');
    await addTextInsertion(page, '一括削除テキスト');

    acceptNextDialog(page, 'すべての編集内容を削除');
    await page.getByRole('button', { name: 'すべて削除' }).click();

    await expect(page.getByText('まだ編集がありません')).toBeVisible();
    await expect(page.getByRole('button', { name: '保存・ダウンロード' })).toBeDisabled();
  });
});
