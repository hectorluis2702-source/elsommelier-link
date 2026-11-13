#!/usr/bin/env python3
"""Descarga las fuentes libres (sustitutos de metrica compatible) usadas por
defecto: EB Garamond, PT Serif y Libre Baskerville, directamente desde
Google Fonts (CSS2 API + gstatic.com), licencia OFL.

Si ya tienes licencia de Adobe Garamond Pro, Palatino Linotype o Baskerville
originales, omite este script y copia tus .ttf/.otf en backend/fonts con los
nombres esperados (ver app/fonts.py).
"""

import re
import urllib.request
from pathlib import Path

DEST_DIR = Path(__file__).resolve().parent.parent / "fonts"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

# (familia en Google Fonts, peso, cursiva, nombre de archivo destino)
TARGETS = [
    ("EB Garamond", 400, False, "EBGaramond-Regular.woff2"),
    ("EB Garamond", 400, True, "EBGaramond-Italic.woff2"),
    ("EB Garamond", 700, False, "EBGaramond-Bold.woff2"),
    ("EB Garamond", 700, True, "EBGaramond-BoldItalic.woff2"),
    ("PT Serif", 400, False, "PTSerif-Regular.woff2"),
    ("PT Serif", 400, True, "PTSerif-Italic.woff2"),
    ("PT Serif", 700, False, "PTSerif-Bold.woff2"),
    ("PT Serif", 700, True, "PTSerif-BoldItalic.woff2"),
    ("Libre Baskerville", 400, False, "LibreBaskerville-Regular.woff2"),
    ("Libre Baskerville", 400, True, "LibreBaskerville-Italic.woff2"),
    ("Libre Baskerville", 700, False, "LibreBaskerville-Bold.woff2"),
]


def _fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8")


def _latin_url(css: str, weight: int, italic: bool) -> str:
    style = "italic" if italic else "normal"
    pattern = re.compile(
        r"/\* latin \*/\s*@font-face\s*\{[^}]*?font-style:\s*"
        + style
        + r";[^}]*?font-weight:\s*"
        + str(weight)
        + r";[^}]*?src:\s*url\(([^)]+)\)",
        re.DOTALL,
    )
    match = pattern.search(css)
    if not match:
        raise RuntimeError(f"No se encontró el bloque 'latin' para weight={weight} italic={italic}")
    return match.group(1)


def main() -> None:
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    for family, weight, italic, filename in TARGETS:
        family_param = family.replace(" ", "+")
        italic_axis = "1" if italic else "0"
        css_url = (
            f"https://fonts.googleapis.com/css2?family={family_param}:"
            f"ital,wght@{italic_axis},{weight}&display=swap"
        )
        print(f"Resolviendo {family} {weight}{' italic' if italic else ''}...")
        css = _fetch(css_url)
        font_url = _latin_url(css, weight, italic)
        print(f"  -> {font_url}")
        dest_path = DEST_DIR / filename
        req = urllib.request.Request(font_url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=20) as resp, open(dest_path, "wb") as out:
            out.write(resp.read())
        print(f"  guardado en {dest_path}")

    print(f"\nFuentes instaladas en {DEST_DIR}")


if __name__ == "__main__":
    main()
