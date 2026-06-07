import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, StandardFonts, type PDFFont } from 'pdf-lib';

export const FONT_OPTIONS = [
  { value: 'Noto Sans JP', label: 'Noto Sans JP（日本語）' },
  { value: 'Helvetica', label: 'Helvetica（英数字）' },
  { value: 'Times-Roman', label: 'Times Roman（英数字）' },
  { value: 'Courier', label: 'Courier（英数字）' },
] as const;

export type FontFamily = (typeof FONT_OPTIONS)[number]['value'];

const STANDARD_FONT_MAP: Record<string, keyof typeof StandardFonts> = {
  Helvetica: 'Helvetica',
  'Times-Roman': 'TimesRoman',
  Courier: 'Courier',
};

const JAPANESE_FONT_URL = `${import.meta.env.BASE_URL}fonts/NotoSansJP-Regular.otf`;

let japaneseFontBytes: Uint8Array | null = null;
let japaneseFontLoadPromise: Promise<Uint8Array> | null = null;
const embeddedJapaneseFonts = new WeakMap<PDFDocument, PDFFont>();

export function containsNonAscii(text: string): boolean {
  return /[^\u0000-\u007f]/.test(text);
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

async function loadJapaneseFontBytes(): Promise<Uint8Array> {
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

async function embedJapaneseFont(pdfDoc: PDFDocument): Promise<PDFFont> {
  const cached = embeddedJapaneseFonts.get(pdfDoc);
  if (cached) {
    return cached;
  }

  pdfDoc.registerFontkit(fontkit);
  const bytes = await loadJapaneseFontBytes();
  const font = await pdfDoc.embedFont(bytes, { subset: true });
  embeddedJapaneseFonts.set(pdfDoc, font);
  return font;
}

export async function embedFontForPdf(
  pdfDoc: PDFDocument,
  fontFamily: string,
  text: string,
): Promise<PDFFont> {
  if (shouldUseJapaneseFont(fontFamily, text)) {
    return embedJapaneseFont(pdfDoc);
  }

  const standardKey = STANDARD_FONT_MAP[fontFamily] ?? 'Helvetica';
  return pdfDoc.embedFont(StandardFonts[standardKey]);
}

export function estimateTextWidth(text: string, fontSize: number, fontFamily: string): number {
  const charWidth = fontFamily === 'Noto Sans JP' || containsNonAscii(text) ? 1 : 0.55;
  return Math.max(text.length * fontSize * charWidth, 40);
}
