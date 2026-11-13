// Espejo en cliente de las reglas oficiales de KDP definidas en
// backend/app/kdp_rules.py. Solo se usa para mostrar una estimación en vivo
// en la UI; el PDF final siempre se recalcula con precisión en el backend
// (dos pasadas de render), que es la fuente de verdad.

export type TrimSizeKey =
  | "5x8"
  | "5.25x8"
  | "5.5x8.5"
  | "6x9"
  | "6.14x9.21"
  | "7x10"
  | "8.5x11";

export const TRIM_SIZES: Record<TrimSizeKey, { width: number; height: number; label: string }> = {
  "5x8": { width: 5, height: 8, label: '5" x 8"' },
  "5.25x8": { width: 5.25, height: 8, label: '5.25" x 8"' },
  "5.5x8.5": { width: 5.5, height: 8.5, label: '5.5" x 8.5"' },
  "6x9": { width: 6, height: 9, label: '6" x 9" (más popular)' },
  "6.14x9.21": { width: 6.14, height: 9.21, label: '6.14" x 9.21" (Royal)' },
  "7x10": { width: 7, height: 10, label: '7" x 10"' },
  "8.5x11": { width: 8.5, height: 11, label: '8.5" x 11"' },
};

export const FONT_FAMILIES = [
  { key: "garamond", label: "Garamond" },
  { key: "palatino", label: "Palatino" },
  { key: "baskerville", label: "Baskerville" },
] as const;

export type FontFamilyKey = (typeof FONT_FAMILIES)[number]["key"];

const GUTTER_TABLE: Array<[number, number, number]> = [
  [24, 150, 0.375],
  [151, 300, 0.5],
  [301, 500, 0.625],
  [501, 700, 0.75],
  [701, 828, 0.875],
];

export function gutterForPageCount(pageCount: number): number {
  const clamped = Math.max(24, Math.min(pageCount, 828));
  for (const [low, high, gutter] of GUTTER_TABLE) {
    if (clamped >= low && clamped <= high) return gutter;
  }
  return GUTTER_TABLE[GUTTER_TABLE.length - 1][2];
}

const OUTER_MARGIN = 0.5;
const TOP_MARGIN = 0.75;
const BOTTOM_MARGIN = 0.75;

/** Estimación aproximada de páginas a partir del recuento de palabras, el
 * tamaño de fuente y el trim size. Es una heurística de vista previa, no el
 * cálculo definitivo (eso ocurre en WeasyPrint, en el backend). */
export function estimatePageCount(
  wordCount: number,
  trimSize: TrimSizeKey,
  fontSizePt: number
): number {
  const { width, height } = TRIM_SIZES[trimSize];
  const usableWidth = width - OUTER_MARGIN - gutterForPageCount(300);
  const usableHeight = height - TOP_MARGIN - BOTTOM_MARGIN;
  const lineHeightIn = (fontSizePt * 1.2) / 72;
  const linesPerPage = Math.max(1, Math.floor(usableHeight / lineHeightIn));
  const charsPerLine = Math.max(20, Math.floor((usableWidth * 72) / (fontSizePt * 0.5)));
  const wordsPerLine = Math.max(1, Math.floor(charsPerLine / 6));
  const wordsPerPage = wordsPerLine * linesPerPage;
  return Math.max(1, Math.ceil(wordCount / wordsPerPage));
}

export function marginsPreview(trimSize: TrimSizeKey, estimatedPages: number) {
  const gutter = gutterForPageCount(estimatedPages);
  return {
    gutter,
    outer: OUTER_MARGIN,
    top: TOP_MARGIN,
    bottom: BOTTOM_MARGIN,
    trim: TRIM_SIZES[trimSize],
  };
}
