"""Construye el HTML/CSS del interior y lo compila a PDF con WeasyPrint.

Estrategia de dos pasadas:
  1. Se renderiza el manuscrito con un gutter "estimado" (bracket por defecto)
     únicamente para averiguar cuántas páginas ocupará realmente.
  2. Con el número de páginas real, se recalcula el gutter oficial de KDP
     (la tabla de márgenes cambia según el rango de páginas) y se vuelve a
     renderizar una segunda vez con la geometría definitiva.

Esto evita el problema típico de maquetación KDP: el gutter depende del
número de páginas, pero el número de páginas depende del tamaño de fuente,
márgenes e interlineado que uno mismo está definiendo.
"""

from dataclasses import dataclass
from weasyprint import HTML

from . import kdp_rules
from .content_model import Block, Chapter
from .fonts import font_face_css, css_family_name

LINE_HEIGHT = 1.2


@dataclass
class PdfRequest:
    trim_size_key: str
    font_key: str
    font_size_pt: float
    title: str
    author: str


def _page_css(geometry: kdp_rules.PageGeometry) -> str:
    return f"""
@page {{
  size: {geometry.trim_width_in}in {geometry.trim_height_in}in;
  margin-top: {geometry.top_in}in;
  margin-bottom: {geometry.bottom_in}in;
}}
@page :left {{
  margin-left: {geometry.outer_in}in;
  margin-right: {geometry.gutter_in}in;
}}
@page :right {{
  margin-left: {geometry.gutter_in}in;
  margin-right: {geometry.outer_in}in;
}}
"""


def _document_css(req: PdfRequest, geometry: kdp_rules.PageGeometry) -> str:
    family = css_family_name(req.font_key)
    return f"""
{font_face_css(req.font_key)}
{_page_css(geometry)}

* {{ box-sizing: border-box; }}

body {{
  font-family: '{family}', serif;
  font-size: {req.font_size_pt}pt;
  line-height: {LINE_HEIGHT};
  text-align: justify;
  hyphens: auto;
  -weasy-hyphens: auto;
  color: #000;
  orphans: 2;
  widows: 2;
}}

.title-page {{
  page-break-after: always;
  text-align: center;
  padding-top: 35%;
}}
.title-page h1 {{
  font-size: {req.font_size_pt * 2.6}pt;
  font-weight: 400;
  letter-spacing: 0.04em;
  margin-bottom: 1.5em;
}}
.title-page .author {{
  font-size: {req.font_size_pt * 1.3}pt;
  font-style: italic;
}}

.chapter {{
  page-break-before: always;
}}

.chapter-title {{
  font-size: {req.font_size_pt * 1.8}pt;
  font-weight: 400;
  text-align: center;
  letter-spacing: 0.03em;
  margin-top: 12%;
  margin-bottom: 2em;
  page-break-after: avoid;
}}

p {{
  margin: 0;
  text-indent: 1.4em;
}}

p.first-para {{
  text-indent: 0;
}}

.dropcap {{
  float: left;
  font-size: 3.4em;
  line-height: 0.78;
  font-weight: 400;
  padding-right: 0.1em;
  padding-top: 0.05em;
}}

h3.subheading {{
  font-size: {req.font_size_pt * 1.05}pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
  margin: 2em 0 1em;
  page-break-after: avoid;
}}

blockquote.pull-quote {{
  margin: 1.2em 2.2em;
  font-style: italic;
  text-align: left;
  text-indent: 0;
  border-left: 2px solid #000;
  padding-left: 1em;
}}

p.list-item {{
  margin: 0.5em 0;
  text-indent: -1em;
  padding-left: 1em;
}}
p.list-item::before {{
  content: "— ";
}}

p.divider {{
  text-align: center;
  margin: 1.6em 0;
  letter-spacing: 0.5em;
  text-indent: 0;
}}

.callout {{
  margin: 1.4em 1.4em;
  padding: 0.8em 1em;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
}}
.callout .callout-label {{
  display: block;
  font-weight: 700;
  font-style: italic;
  font-size: 0.92em;
  letter-spacing: 0.04em;
  margin-bottom: 0.4em;
  text-indent: 0;
}}
.callout p {{
  text-indent: 0;
  margin: 0;
}}
"""


def _with_drop_cap(paragraph_html: str) -> str:
    """Envuelve la primera letra del párrafo en un <span> flotante.

    Se usa un span explícito en vez de ::first-letter porque WeasyPrint
    calcula mal el ancho reservado del float con ese pseudo-elemento y el
    texto de la primera línea termina superpuesto sobre la capitular.
    Si el párrafo empieza con una etiqueta HTML (p.ej. cursiva), se omite
    la capitular para no romper el marcado.
    """
    if not paragraph_html or paragraph_html[0] == "<":
        return paragraph_html
    return f'<span class="dropcap">{paragraph_html[0]}</span>{paragraph_html[1:]}'


def _render_block(block: Block, is_first_paragraph: bool) -> str:
    if block.kind == "paragraph":
        if is_first_paragraph:
            return f'<p class="first-para">{_with_drop_cap(block.html)}</p>'
        return f"<p>{block.html}</p>"
    if block.kind == "subheading":
        return f'<h3 class="subheading">{block.html}</h3>'
    if block.kind == "quote":
        return f'<blockquote class="pull-quote">{block.html}</blockquote>'
    if block.kind == "list_item":
        return f'<p class="list-item">{block.html}</p>'
    if block.kind == "divider":
        return f'<p class="divider">{block.html}</p>'
    if block.kind == "callout":
        paragraphs = "".join(f"<p>{p}</p>" for p in block.html.split("\n\n") if p)
        return (
            '<div class="callout">'
            f'<span class="callout-label">{block.label}</span>'
            f"{paragraphs}"
            "</div>"
        )
    return ""


def _render_chapter_html(chapter: Chapter, index: int) -> str:
    title_html = (
        f'<h2 class="chapter-title">{chapter.title}</h2>'
        if chapter.title
        else f'<h2 class="chapter-title">Capítulo {index}</h2>'
    )
    first_paragraph_seen = False
    blocks_html = []
    for block in chapter.blocks:
        is_first = block.kind == "paragraph" and not first_paragraph_seen
        if is_first:
            first_paragraph_seen = True
        blocks_html.append(_render_block(block, is_first))
    return f'<section class="chapter">{title_html}{"".join(blocks_html)}</section>'


def _build_full_html(
    chapters: list[Chapter], req: PdfRequest, geometry: kdp_rules.PageGeometry
) -> str:
    chapters_html = "".join(
        _render_chapter_html(ch, idx + 1) for idx, ch in enumerate(chapters)
    )
    title_page = ""
    if req.title:
        title_page = f"""
<div class="title-page">
  <h1>{req.title}</h1>
  {f'<div class="author">{req.author}</div>' if req.author else ''}
</div>
"""
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>{_document_css(req, geometry)}</style>
</head>
<body>
{title_page}
{chapters_html}
</body>
</html>"""


def build_pdf(chapters: list[Chapter], req: PdfRequest) -> tuple[bytes, int, kdp_rules.PageGeometry]:
    """Genera el PDF final. Devuelve (bytes_pdf, num_paginas, geometria_final)."""

    # Pasada 1: geometría provisional con el bracket de gutter más común
    # (24-150 páginas), solo para medir cuántas páginas ocupa el manuscrito.
    provisional_geometry = kdp_rules.build_geometry(req.trim_size_key, page_count=100)
    draft_html = _build_full_html(chapters, req, provisional_geometry)
    draft_document = HTML(string=draft_html).render()
    estimated_pages = len(draft_document.pages)

    # Pasada 2: geometría definitiva según el nº de páginas real.
    final_geometry = kdp_rules.build_geometry(req.trim_size_key, estimated_pages)

    if final_geometry.gutter_in == provisional_geometry.gutter_in:
        final_document = draft_document
    else:
        final_html = _build_full_html(chapters, req, final_geometry)
        final_document = HTML(string=final_html).render()

    final_page_count = len(final_document.pages)
    pdf_bytes = final_document.write_pdf()
    return pdf_bytes, final_page_count, final_geometry
