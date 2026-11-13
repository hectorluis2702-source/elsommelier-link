"""Reglas oficiales de maquetación de interior para KDP (Kindle Direct Publishing).

Fuente: especificaciones públicas de Amazon KDP para libros de tapa blanda
(«Paperback interior margins»). Los márgenes mínimos son un requisito de
impresión; el gutter (margen de encuadernación) depende directamente del
número de páginas del interior porque a más páginas, más curvatura absorbe
el lomo.
"""

from dataclasses import dataclass

# Tamaños de libro estándar soportados por KDP, en pulgadas (ancho x alto).
TRIM_SIZES: dict[str, tuple[float, float]] = {
    "5x8": (5.0, 8.0),
    "5.25x8": (5.25, 8.0),
    "5.5x8.5": (5.5, 8.5),
    "6x9": (6.0, 9.0),
    "6.14x9.21": (6.14, 9.21),
    "7x10": (7.0, 10.0),
    "8.5x11": (8.5, 11.0),
}

DEFAULT_TRIM_SIZE = "6x9"

# Márgenes mínimos exigidos por KDP (pulgadas).
MIN_OUTER_MARGIN = 0.25
MIN_TOP_MARGIN = 0.25
MIN_BOTTOM_MARGIN = 0.25

# Márgenes "boutique" recomendados por defecto (más generosos que el mínimo,
# para una lectura cómoda tipo editorial premium).
DEFAULT_OUTER_MARGIN = 0.5
DEFAULT_TOP_MARGIN = 0.75
DEFAULT_BOTTOM_MARGIN = 0.75

# Tabla oficial de gutter (margen interior/encuadernación) según nº de páginas.
_GUTTER_TABLE: list[tuple[int, int, float]] = [
    (24, 150, 0.375),
    (151, 300, 0.5),
    (301, 500, 0.625),
    (501, 700, 0.75),
    (701, 828, 0.875),
]

MAX_KDP_PAGES = 828
MIN_KDP_PAGES = 24


def gutter_for_page_count(page_count: int) -> float:
    """Devuelve el gutter (en pulgadas) que exige KDP para un nº de páginas dado."""
    page_count = max(MIN_KDP_PAGES, min(page_count, MAX_KDP_PAGES))
    for low, high, gutter in _GUTTER_TABLE:
        if low <= page_count <= high:
            return gutter
    return _GUTTER_TABLE[-1][2]


@dataclass(frozen=True)
class PageGeometry:
    trim_width_in: float
    trim_height_in: float
    gutter_in: float
    outer_in: float
    top_in: float
    bottom_in: float


def build_geometry(trim_size_key: str, page_count: int) -> PageGeometry:
    width, height = TRIM_SIZES.get(trim_size_key, TRIM_SIZES[DEFAULT_TRIM_SIZE])
    gutter = gutter_for_page_count(page_count)
    return PageGeometry(
        trim_width_in=width,
        trim_height_in=height,
        gutter_in=gutter,
        outer_in=DEFAULT_OUTER_MARGIN,
        top_in=DEFAULT_TOP_MARGIN,
        bottom_in=DEFAULT_BOTTOM_MARGIN,
    )
