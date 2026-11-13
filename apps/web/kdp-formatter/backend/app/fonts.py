"""Definición de las familias tipográficas ofrecidas por el formateador.

KDP exige que las fuentes vayan INCRUSTADAS en el PDF final. Adobe Garamond
Pro, Palatino Linotype y Baskerville son fuentes comerciales: no pueden
redistribuirse en un repositorio público. Por eso, por defecto usamos
sustitutos de metrica compatible y licencia libre (Google Fonts):

  - "garamond"   -> EB Garamond       (alternativa libre a Garamond)
  - "palatino"   -> PT Serif          (alternativa libre a Palatino)
  - "baskerville"-> Libre Baskerville (alternativa libre a Baskerville)

Si el usuario posee licencia de las fuentes originales, basta con copiar los
.ttf/.otf a backend/fonts con el mismo nombre de archivo indicado abajo y el
resultado usará la fuente original sin tocar el código (ver README).
"""

from pathlib import Path

FONTS_DIR = Path(__file__).resolve().parent.parent / "fonts"

FONT_FAMILIES: dict[str, dict[str, str]] = {
    "garamond": {
        "css_name": "Garamond",
        "regular": "EBGaramond-Regular.woff2",
        "italic": "EBGaramond-Italic.woff2",
        "bold": "EBGaramond-Bold.woff2",
        "bold_italic": "EBGaramond-BoldItalic.woff2",
    },
    "palatino": {
        "css_name": "Palatino",
        "regular": "PTSerif-Regular.woff2",
        "italic": "PTSerif-Italic.woff2",
        "bold": "PTSerif-Bold.woff2",
        "bold_italic": "PTSerif-BoldItalic.woff2",
    },
    "baskerville": {
        "css_name": "Baskerville",
        "regular": "LibreBaskerville-Regular.woff2",
        "italic": "LibreBaskerville-Italic.woff2",
        "bold": "LibreBaskerville-Bold.woff2",
        "bold_italic": "LibreBaskerville-Bold.woff2",  # sin variante bold-italic real; se usa Bold como fallback
    },
}

DEFAULT_FONT_KEY = "garamond"


def font_face_css(font_key: str) -> str:
    spec = FONT_FAMILIES.get(font_key, FONT_FAMILIES[DEFAULT_FONT_KEY])
    css_name = spec["css_name"]
    rules = []
    variants = [
        ("normal", "normal", spec["regular"]),
        ("normal", "italic", spec["italic"]),
        ("bold", "normal", spec["bold"]),
        ("bold", "italic", spec["bold_italic"]),
    ]
    for weight, style, filename in variants:
        font_path = FONTS_DIR / filename
        if not font_path.exists():
            continue
        fmt = {".woff2": "woff2", ".otf": "opentype"}.get(font_path.suffix, "truetype")
        rules.append(
            f"""@font-face {{
  font-family: '{css_name}';
  font-weight: {weight};
  font-style: {style};
  src: url('{font_path.as_uri()}') format('{fmt}');
}}"""
        )
    return "\n".join(rules)


def css_family_name(font_key: str) -> str:
    spec = FONT_FAMILIES.get(font_key, FONT_FAMILIES[DEFAULT_FONT_KEY])
    return spec["css_name"]
