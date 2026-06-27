import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, 'fixtures', 'sample.pdf');
const shotsDir = path.join(__dirname, 'recordings', 'screenshots');

test('capture workflow screenshots for review', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('/');
  await page.screenshot({ path: path.join(shotsDir, '01-upload.png'), fullPage: true });

  await page.locator('input[type="file"]').setInputFiles(fixturePath);
  await expect(page.getByText('ページ数:')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('pdf-viewer-ready')).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: path.join(shotsDir, '02-edit-mode.png'), fullPage: true });

  await page.getByRole('button', { name: '注釈' }).click();
  const overlay = page.locator('.pdf-overlay.clickable');
  await overlay.click({ position: { x: 220, y: 280 } });
  await page.getByRole('dialog', { name: '注釈を追加' }).locator('input').fill('Review Note');
  await page.getByRole('button', { name: '追加' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotsDir, '04-annotation-added.png'), fullPage: true });

  await page.getByRole('button', { name: 'テキスト挿入' }).click();
  await overlay.click({ position: { x: 320, y: 380 } });
  await page.getByRole('dialog', { name: 'テキストを挿入' }).locator('input').fill('Review Text');
  await page.getByRole('button', { name: '追加' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotsDir, '05-edits-complete.png'), fullPage: true });

  await page.getByRole('button', { name: '保存・ダウンロード' }).click();
  await expect(page.getByTestId('toast-success')).toBeVisible();
  await page.screenshot({ path: path.join(shotsDir, '06-save-success.png'), fullPage: true });
});
