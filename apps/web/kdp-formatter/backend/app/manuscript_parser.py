"""Convierte un manuscrito en texto plano o Markdown en una lista de capítulos.

Un capítulo se detecta por:
  - Un encabezado Markdown de nivel 1 (`# Título`)
  - Una línea que empieza por "Capítulo"/"Chapter" seguida de número/nombre
Si no se detecta ningún encabezado, todo el manuscrito se trata como un
único capítulo sin título.
"""

import re

import markdown as md

from .content_model import Block, Chapter

_CHAPTER_HEADING_RE = re.compile(
    r"^\s*(#\s+.+|(cap[ií]tulo|chapter)\s+.+)$", re.IGNORECASE
)
_MD_H1_RE = re.compile(r"^\s*#\s+(.+)$")


def _clean_title(line: str) -> str:
    m = _MD_H1_RE.match(line)
    if m:
        return m.group(1).strip()
    return line.strip()


def _paragraphs_to_blocks(text: str) -> list[Block]:
    """Convierte un bloque de texto (varios párrafos separados por líneas en
    blanco) en bloques de párrafo, aplicando énfasis Markdown básico
    (negrita/cursiva)."""
    blocks = re.split(r"\n\s*\n", text.strip())
    result = []
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        rendered = md.markdown(block)
        rendered = re.sub(r"^<p>|</p>$", "", rendered.strip())
        rendered = rendered.replace("\n", " ")
        result.append(Block(kind="paragraph", html=rendered))
    return result


def parse_manuscript(raw_text: str) -> list[Chapter]:
    raw_text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    lines = raw_text.split("\n")

    chapter_boundaries: list[tuple[int, str]] = []
    for idx, line in enumerate(lines):
        if _CHAPTER_HEADING_RE.match(line):
            chapter_boundaries.append((idx, _clean_title(line)))

    chapters: list[Chapter] = []

    if not chapter_boundaries:
        blocks = _paragraphs_to_blocks(raw_text)
        chapters.append(Chapter(title="", blocks=blocks))
        return chapters

    for i, (start_idx, title) in enumerate(chapter_boundaries):
        end_idx = (
            chapter_boundaries[i + 1][0]
            if i + 1 < len(chapter_boundaries)
            else len(lines)
        )
        body_lines = lines[start_idx + 1 : end_idx]
        body_text = "\n".join(body_lines)
        blocks = _paragraphs_to_blocks(body_text)
        if blocks:
            chapters.append(Chapter(title=title, blocks=blocks))

    return chapters
