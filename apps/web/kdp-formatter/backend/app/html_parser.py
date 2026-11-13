"""Parser de capítulos exportados como HTML (p.ej. una web de lectura).

Estos exports suelen tener una particularidad: el texto de un mismo párrafo,
cita o entrada de lista viene partido en varias etiquetas `<p>` consecutivas
(aparentemente por un proceso de ajuste de línea previo), en vez de un único
`<p>` por párrafo real. Ejemplo típico:

    <p>Todo compite por ella: las notificaciones, la urgencia, el ruido de</p>
    <p>fondo permanente de la vida contemporánea.</p>

Para reconstruir el texto original, se usa una heurística simple: si el
fragmento no termina en puntuación de cierre de oración, se asume que
continúa en el siguiente `<p>` hermano, y se van concatenando hasta
encontrar uno que sí termine en puntuación (o hasta toparse con una
etiqueta que no sea `<p>`).
"""

import html as html_module
import re

from bs4 import BeautifulSoup, Tag

from .content_model import Block, Chapter

_TERMINAL_PUNCT = (".", "!", "?", '"', "”", "»", "'", ":", ")")


def _text(el: Tag) -> str:
    return el.get_text(" ", strip=True)


def _quote_unbalanced(text: str) -> bool:
    """Detecta comillas de apertura « sin su cierre » correspondiente, caso
    típico de una cita larga partida en varias etiquetas <p>/<blockquote>."""
    return text.count("«") > text.count("»")


def _ends_incomplete(text: str) -> bool:
    if not text:
        return False
    if _quote_unbalanced(text):
        return True
    return text[-1] not in _TERMINAL_PUNCT


def _escape(text: str) -> str:
    return html_module.escape(text)


def _consume_continuation(children: list[Tag], i: int, parts: list[str]) -> int:
    """Mientras el último fragmento acumulado no termine la oración y el
    siguiente hermano sea un <p>, lo va anexando. Devuelve el nuevo índice."""
    while (
        parts
        and _ends_incomplete(parts[-1])
        and i < len(children)
        and children[i].name == "p"
    ):
        parts.append(_text(children[i]))
        i += 1
    return i


def _consume_all_following_p(children: list[Tag], i: int) -> tuple[list[str], int]:
    """Recoge TODOS los <p> hermanos siguientes hasta toparse con una
    etiqueta que no sea <p> (límite estructural: el siguiente div/ul/h3/h4).
    A diferencia de `_consume_continuation`, no se detiene en el primer
    fragmento que "suena completo", porque dentro de un mismo bloque (una
    cita, un callout) puede haber varias oraciones/párrafos reales
    entremezclados con fragmentos partidos por saltos de línea.
    """
    collected = []
    while i < len(children) and children[i].name == "p":
        collected.append(_text(children[i]))
        i += 1
    return collected, i


def _regroup_fragments(fragments: list[str]) -> list[str]:
    """Reagrupa una lista plana de fragmentos de <p> en párrafos completos,
    fusionando los que no terminan en puntuación de cierre de oración con
    el siguiente."""
    paragraphs: list[str] = []
    current: list[str] = []
    for frag in fragments:
        current.append(frag)
        if not _ends_incomplete(frag):
            paragraphs.append(" ".join(current))
            current = []
    if current:
        paragraphs.append(" ".join(current))
    return [p for p in paragraphs if p]


def _extract_book_meta(soup: BeautifulSoup) -> tuple[str, str]:
    label = soup.select_one(".book-label")
    if not label:
        return "", ""
    raw = _text(label)
    if "·" in raw:
        title, _, author = raw.partition("·")
        return title.strip(), author.strip()
    return raw.strip(), ""


def _extract_chapter_number(soup: BeautifulSoup) -> int | None:
    super_el = soup.select_one(".chapter-super")
    if super_el:
        m = re.search(r"\d+", _text(super_el))
        if m:
            return int(m.group())
    title_el = soup.find("title")
    if title_el:
        m = re.search(r"[Cc]ap[ií]tulo\s+(\d+)", _text(title_el))
        if m:
            return int(m.group(1))
    return None


def parse_html_chapter(raw_html: str, fallback_order: int) -> tuple[Chapter, str, str]:
    """Devuelve (capítulo, título_del_libro, autor_del_libro)."""
    soup = BeautifulSoup(raw_html, "html.parser")

    book_title, book_author = _extract_book_meta(soup)

    title_el = soup.select_one(".chapter-header h1") or soup.select_one("h1")
    chapter_title = _text(title_el) if title_el else f"Capítulo {fallback_order}"
    chapter_number = _extract_chapter_number(soup)

    content_el = soup.select_one(".content") or soup.body or soup
    children = [c for c in content_el.find_all(recursive=False) if isinstance(c, Tag)]

    blocks: list[Block] = []
    i = 0
    while i < len(children):
        el = children[i]
        classes = el.get("class") or []

        if el.name == "div" and "sep" in classes:
            blocks.append(Block(kind="divider", html=_escape(_text(el) or "⋆")))
            i += 1

        elif el.name == "div" and "block-hdr" in classes:
            label = _text(el)
            i += 1
            fragments, i = _consume_all_following_p(children, i)
            paragraphs = _regroup_fragments(fragments)
            body = "\n\n".join(_escape(p) for p in paragraphs)
            blocks.append(Block(kind="callout", label=_escape(label), html=body))

        elif el.name in ("h3", "h4"):
            blocks.append(Block(kind="subheading", html=_escape(_text(el))))
            i += 1

        elif el.name == "blockquote":
            own_text = _text(el)
            i += 1
            fragments, i = _consume_all_following_p(children, i)
            full = " ".join(p for p in [own_text, *fragments] if p)
            blocks.append(Block(kind="quote", html=_escape(full)))

        elif el.name == "ul":
            li_items = [c for c in el.find_all("li", recursive=False)]
            item_texts = [_text(li) for li in li_items]
            i += 1
            if item_texts:
                fragments, i = _consume_all_following_p(children, i)
                item_texts[-1] = " ".join(p for p in [item_texts[-1], *fragments] if p)
            for t in item_texts:
                blocks.append(Block(kind="list_item", html=_escape(t)))

        elif el.name == "p":
            parts = [_text(el)]
            i += 1
            i = _consume_continuation(children, i, parts)
            text = " ".join(p for p in parts if p)
            if text:
                blocks.append(Block(kind="paragraph", html=_escape(text)))

        else:
            i += 1

    chapter = Chapter(title=chapter_title, number=chapter_number, blocks=blocks)
    return chapter, book_title, book_author
