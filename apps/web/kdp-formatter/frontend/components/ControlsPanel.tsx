"use client";

import { FONT_FAMILIES, FontFamilyKey, TRIM_SIZES, TrimSizeKey } from "@/lib/kdp";
import Slider from "./Slider";

interface ControlsPanelProps {
  trimSize: TrimSizeKey;
  onTrimSizeChange: (value: TrimSizeKey) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  fontFamily: FontFamilyKey;
  onFontFamilyChange: (value: FontFamilyKey) => void;
  title: string;
  onTitleChange: (value: string) => void;
  author: string;
  onAuthorChange: (value: string) => void;
}

export default function ControlsPanel({
  trimSize,
  onTrimSizeChange,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  title,
  onTitleChange,
  author,
  onAuthorChange,
}: ControlsPanelProps) {
  return (
    <div className="space-y-8 rounded-sm border border-gold-200/10 bg-matte-900/60 p-8 shadow-elegant">
      <div>
        <h3 className="font-display text-2xl text-gold-100">Especificaciones</h3>
        <div className="gold-divider mt-3" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-widest text-cream/50">
            Título
          </label>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Título del libro"
            className="w-full rounded-sm border border-gold-200/15 bg-matte-950 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-200/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-widest text-cream/50">
            Autor
          </label>
          <input
            value={author}
            onChange={(e) => onAuthorChange(e.target.value)}
            placeholder="Nombre del autor"
            className="w-full rounded-sm border border-gold-200/15 bg-matte-950 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-200/50 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-widest text-cream/50">
          Tamaño de libro (trim size)
        </label>
        <select
          value={trimSize}
          onChange={(e) => onTrimSizeChange(e.target.value as TrimSizeKey)}
          className="w-full rounded-sm border border-gold-200/15 bg-matte-950 px-3 py-2 text-sm text-cream focus:border-gold-200/50 focus:outline-none"
        >
          {Object.entries(TRIM_SIZES).map(([key, size]) => (
            <option key={key} value={key}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      <Slider
        label="Tamaño de fuente"
        value={fontSize}
        min={10}
        max={12}
        step={0.5}
        unit="pt"
        onChange={onFontSizeChange}
      />

      <div>
        <label className="mb-3 block text-xs uppercase tracking-widest text-cream/50">
          Familia tipográfica
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FONT_FAMILIES.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onFontFamilyChange(f.key)}
              className={`rounded-sm border px-3 py-3 font-display text-base transition-colors ${
                fontFamily === f.key
                  ? "border-gold-200 bg-burgundy-900/40 text-gold-100"
                  : "border-gold-200/15 text-cream/60 hover:border-gold-200/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="border-t border-gold-200/10 pt-4 text-xs leading-relaxed text-cream/40">
        Interlineado fijo en 1.2 y márgenes en espejo (gutter) calculados
        automáticamente según el número de páginas estimado, conforme a las
        especificaciones de Amazon KDP.
      </p>
    </div>
  );
}
