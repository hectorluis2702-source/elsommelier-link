"use client";

import { FontFamilyKey, TrimSizeKey, estimatePageCount, marginsPreview } from "@/lib/kdp";

interface PreviewPanelProps {
  wordCount: number;
  trimSize: TrimSizeKey;
  fontSize: number;
  fontFamily: FontFamilyKey;
}

const FONT_STACK: Record<FontFamilyKey, string> = {
  garamond: "'Cormorant Garamond', serif",
  palatino: "Palatino, 'Palatino Linotype', serif",
  baskerville: "Baskerville, Georgia, serif",
};

export default function PreviewPanel({
  wordCount,
  trimSize,
  fontSize,
  fontFamily,
}: PreviewPanelProps) {
  const estimatedPages = wordCount > 0 ? estimatePageCount(wordCount, trimSize, fontSize) : 0;
  const margins = marginsPreview(trimSize, estimatedPages || 100);

  return (
    <div className="rounded-sm border border-gold-200/10 bg-matte-900/60 p-8 shadow-elegant">
      <h3 className="font-display text-2xl text-gold-100">Vista previa de maquetación</h3>
      <div className="gold-divider mt-3" />

      <div className="mt-6 flex items-center justify-center">
        <div
          className="relative border border-gold-200/30 bg-[#f2ede1]"
          style={{
            width: `${margins.trim.width * 22}px`,
            height: `${margins.trim.height * 22}px`,
          }}
        >
          <div
            className="absolute border border-dashed border-burgundy-700/60"
            style={{
              top: `${margins.top * 22}px`,
              bottom: `${margins.bottom * 22}px`,
              left: `${margins.gutter * 22}px`,
              right: `${margins.outer * 22}px`,
            }}
          >
            <p
              className="p-1 text-[7px] leading-tight text-matte-900/70"
              style={{ fontFamily: FONT_STACK[fontFamily] }}
            >
              El interior del libro se maqueta con esta caja de texto. El
              margen izquierdo (gutter) es mayor porque absorbe la
              encuadernación.
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
        <dt className="text-cream/40">Páginas estimadas</dt>
        <dd className="text-right text-gold-200">
          {estimatedPages > 0 ? `~${estimatedPages}` : "—"}
        </dd>
        <dt className="text-cream/40">Gutter (encuadernación)</dt>
        <dd className="text-right text-gold-200">{margins.gutter}&quot;</dd>
        <dt className="text-cream/40">Margen exterior</dt>
        <dd className="text-right text-gold-200">{margins.outer}&quot;</dd>
        <dt className="text-cream/40">Margen sup./inf.</dt>
        <dd className="text-right text-gold-200">
          {margins.top}&quot; / {margins.bottom}&quot;
        </dd>
        <dt className="text-cream/40">Interlineado</dt>
        <dd className="text-right text-gold-200">1.2</dd>
      </dl>
      <p className="mt-4 text-xs text-cream/30">
        Estimación orientativa. El PDF final recalcula la geometría exacta en
        dos pasadas de render sobre el manuscrito real.
      </p>
    </div>
  );
}
