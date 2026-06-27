import { test, expect } from '@playwright/test';
import {
  openApp,
  uploadPdf,
  SAMPLE_PDF,
  enterEditMode,
  selectTool,
  addTextInsertion,
  addShape,
  pdfOverlay,
  savePdf,
  verifyPdfFile,
  DOWNLOADS_DIR,
} from '../helpers/pdf-editor';

test.describe('Pattern H: 高度な編集ツール', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await openApp(page);
    await uploadPdf(page, SAMPLE_PDF);
    await enterEditMode(page);
  });

  test('H-1: スタイル付きテキスト・図形・吹き出しを追加して保存', async ({ page }) => {
    await selectTool(page, 'テキスト挿入');
    await page.locator('#font-size').fill('18');
    await page.getByLabel('太字').check();
    await page.getByLabel('斜体').check();
    await page.getByLabel('取り消し線').check();
    await addTextInsertion(page, 'Styled PDF Text', { x: 140, y: 160 });

    await addShape(page, '四角', { x: 160, y: 230 }, { x: 280, y: 300 });
    await expect(page.getByText('図形 (1)')).toBeVisible();
    await page.locator('#shape-opacity').fill('55');
    await expect(page.locator('#shape-opacity')).toHaveValue('55');
    await selectTool(page, '選択');
    const overlayBox = await pdfOverlay(page).boundingBox();
    expect(overlayBox).not.toBeNull();
    await page.mouse.dblclick(overlayBox!.x + 220, overlayBox!.y + 265);
    await page.getByLabel('図形内テキスト').fill('四角メモ');
    await page.getByLabel('図形内テキスト').press('Enter');
    await expect(page.locator('.edit-object-svg text').filter({ hasText: '四角メモ' })).toBeVisible();

    await page.getByLabel('背景色を使う').check();
    await addShape(page, '丸', { x: 320, y: 230 }, { x: 430, y: 300 });
    await addShape(page, '矢印', { x: 160, y: 330 }, { x: 340, y: 370 });
    await addShape(page, '斜線', { x: 360, y: 330 }, { x: 480, y: 380 });
    await addShape(page, '吹き出し', { x: 160, y: 410 }, { x: 360, y: 480 });

    await page.locator('#selected-object-text').fill('吹き出しメモ');
    await expect(page.getByText('図形 (5)')).toBeVisible();
    await expect(page.locator('.edit-object-svg-item')).toHaveCount(5);
    await expect(page.locator('.text-insertion-overlay')).toContainText('Styled PDF Text');

    const savedPath = await savePdf(page, DOWNLOADS_DIR);
    await verifyPdfFile(savedPath, ['Styled PDF Text', '四角メモ', '吹き出しメモ']);
  });

  test('H-2: 選択した図形を移動・リサイズ・削除できる', async ({ page }) => {
    await addShape(page, '四角', { x: 220, y: 320 }, { x: 360, y: 420 });
    await expect(page.getByText('図形 (1)')).toBeVisible();

    const selectedShape = page.locator('.edit-object-svg-item.is-selected');
    const selectedShapeBody = selectedShape.locator('rect').first();
    await expect(selectedShapeBody).toBeVisible();

    const boxBefore = await selectedShapeBody.boundingBox();
    expect(boxBefore).not.toBeNull();

    await page.locator('#selected-object-x').fill('300');
    const boxAfterMove = await selectedShapeBody.boundingBox();
    expect(boxAfterMove).not.toBeNull();
    expect(boxAfterMove!.x).not.toBe(boxBefore!.x);

    await page.locator('#selected-object-width').fill('220');
    await expect(page.locator('#selected-object-width')).toHaveValue('220');

    await page.getByRole('button', { name: '四角 を削除' }).click();
    await expect(page.getByText('まだ編集がありません')).toBeVisible();
    await expect(page.getByRole('button', { name: '保存・ダウンロード' })).toBeDisabled();
  });
});
