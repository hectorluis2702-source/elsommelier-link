"""Modelo de contenido compartido entre el parser de texto/Markdown y el
parser de HTML. `pdf_builder` renderiza únicamente en términos de estos
tipos, sin conocer de dónde vino el manuscrito original.
"""

from dataclasses import dataclass, field

BLOCK_KINDS = {"paragraph", "subheading", "quote", "list_item", "divider", "callout"}


@dataclass
class Block:
    kind: str  # uno de BLOCK_KINDS
    html: str = ""
    label: str = ""  # solo para "callout" (p.ej. "Dato curioso")


@dataclass
class Chapter:
    title: str
    number: int | None = None
    blocks: list[Block] = field(default_factory=list)
