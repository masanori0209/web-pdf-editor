export const FONT_OPTIONS = [
  { value: 'Noto Sans JP', label: 'Noto Sans JP（日本語）' },
  { value: 'Helvetica', label: 'Helvetica（英数字）' },
  { value: 'Times-Roman', label: 'Times Roman（英数字）' },
  { value: 'Courier', label: 'Courier（英数字）' },
] as const;

export type FontFamily = (typeof FONT_OPTIONS)[number]['value'];

const JAPANESE_FONT_URL = `${import.meta.env.BASE_URL}fonts/NotoSansJP-VF.ttf`;

let japaneseFontBytes: Uint8Array | null = null;
let japaneseFontLoadPromise: Promise<Uint8Array> | null = null;

export function containsNonAscii(text: string): boolean {
  return Array.from(text).some((character) => character.charCodeAt(0) > 0x7f);
}

export function shouldUseJapaneseFont(fontFamily: string, text: string): boolean {
  return fontFamily === 'Noto Sans JP' || containsNonAscii(text);
}

export function getOverlayFontFamily(fontFamily: string): string {
  switch (fontFamily) {
    case 'Noto Sans JP':
      return '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif';
    case 'Times-Roman':
      return '"Times New Roman", Times, serif';
    case 'Courier':
      return 'Courier, monospace';
    default:
      return 'Helvetica, Arial, sans-serif';
  }
}

export async function preloadJapaneseFont(): Promise<void> {
  await loadJapaneseFontBytes();
}

export async function loadJapaneseFontBytes(): Promise<Uint8Array> {
  if (japaneseFontBytes) {
    return japaneseFontBytes;
  }

  if (!japaneseFontLoadPromise) {
    japaneseFontLoadPromise = fetch(JAPANESE_FONT_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('日本語フォント（Noto Sans JP）の読み込みに失敗しました。npm run setup:fonts を実行してください。');
        }
        return response.arrayBuffer();
      })
      .then((buffer) => {
        japaneseFontBytes = new Uint8Array(buffer);
        return japaneseFontBytes;
      })
      .catch((error) => {
        japaneseFontLoadPromise = null;
        throw error;
      });
  }

  return japaneseFontLoadPromise;
}

export function estimateTextWidth(text: string, fontSize: number, fontFamily: string): number {
  const charWidth = fontFamily === 'Noto Sans JP' || containsNonAscii(text) ? 1 : 0.55;
  return Math.max(text.length * fontSize * charWidth, 40);
}
