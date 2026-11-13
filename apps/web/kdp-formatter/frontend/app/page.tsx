"use client";

import { useMemo, useState } from "react";
import Dropzone from "@/components/Dropzone";
import ControlsPanel from "@/components/ControlsPanel";
import PreviewPanel from "@/components/PreviewPanel";
import { FontFamilyKey, TrimSizeKey } from "@/lib/kdp";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type GenerationState = "idle" | "loading" | "success" | "error";

function extractPlainText(raw: string): string {
  return raw
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [manuscriptText, setManuscriptText] = useState("");
  const [trimSize, setTrimSize] = useState<TrimSizeKey>("6x9");
  const [fontSize, setFontSize] = useState(11);
  const [fontFamily, setFontFamily] = useState<FontFamilyKey>("garamond");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [state, setState] = useState<GenerationState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultInfo, setResultInfo] = useState<{ pages: string | null } | null>(null);

  const wordCount = useMemo(
    () => (manuscriptText.trim() ? manuscriptText.trim().split(/\s+/).length : 0),
    [manuscriptText]
  );

  async function handleFilesSelected(selected: File[]) {
    setFiles(selected);
    const texts = await Promise.all(selected.map((f) => f.text()));
    setManuscriptText(texts.map(extractPlainText).join(" "));
  }

  async function handleGenerate() {
    if (files.length === 0) return;
    setState("loading");
    setErrorMessage(null);
    setResultInfo(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("file", f));
      formData.append("trim_size", trimSize);
      formData.append("font_family", fontFamily);
      formData.append("font_size", String(fontSize));
      formData.append("title", title);
      formData.append("author", author);

      const response = await fetch(`${API_URL}/api/generate-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail || `Error del servidor (${response.status})`);
      }

      const pages = response.headers.get("X-Page-Count");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "manuscrito"}-kdp.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setResultInfo({ pages });
      setState("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error desconocido");
      setState("error");
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <header className="mb-16 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold-200/70">
          Editorial Boutique · KDP
        </p>
        <h1 className="font-display text-5xl font-medium text-cream sm:text-6xl">
          Formateador de Manuscritos
        </h1>
        <div className="gold-divider mx-auto mt-6" />
        <p className="mx-auto mt-6 max-w-xl text-sm text-cream/50">
          Sube tu manuscrito (uno o varios capítulos, en .txt, .md o .html) y
          obtén un interior de libro listo para imprimir en Amazon KDP:
          márgenes en espejo, capitulares e interlineado profesional,
          calculados automáticamente.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8">
          <Dropzone files={files} onFilesSelected={handleFilesSelected} />

          {wordCount > 0 && (
            <p className="text-center text-xs uppercase tracking-widest text-cream/40">
              {wordCount.toLocaleString("es")} palabras detectadas
              {files.length > 1 ? ` en ${files.length} capítulos` : ""}
            </p>
          )}

          <ControlsPanel
            trimSize={trimSize}
            onTrimSizeChange={setTrimSize}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            fontFamily={fontFamily}
            onFontFamilyChange={setFontFamily}
            title={title}
            onTitleChange={setTitle}
            author={author}
            onAuthorChange={setAuthor}
          />

          <button
            type="button"
            disabled={files.length === 0 || state === "loading"}
            onClick={handleGenerate}
            className="w-full rounded-sm border border-gold-200/30 bg-burgundy-900 px-6 py-4 font-display text-lg tracking-wide text-gold-100 transition-colors duration-300 hover:bg-burgundy-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {state === "loading" ? "Componiendo el interior…" : "Generar PDF para KDP"}
          </button>

          {state === "success" && resultInfo && (
            <p className="text-center text-sm text-gold-200">
              PDF generado{resultInfo.pages ? ` · ${resultInfo.pages} páginas` : ""}. Descarga
              iniciada.
            </p>
          )}
          {state === "error" && errorMessage && (
            <p className="text-center text-sm text-burgundy-600">{errorMessage}</p>
          )}
        </div>

        <div>
          <PreviewPanel
            wordCount={wordCount}
            trimSize={trimSize}
            fontSize={fontSize}
            fontFamily={fontFamily}
          />
        </div>
      </div>
    </main>
  );
}
