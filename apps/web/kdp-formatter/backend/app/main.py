import io
import os
import re
from urllib.parse import quote

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from . import kdp_rules
from .content_model import Chapter
from .html_parser import parse_html_chapter
from .manuscript_parser import parse_manuscript
from .pdf_builder import PdfRequest, build_pdf

app = FastAPI(title="KDP Manuscript PDF Formatter")

_allowed_origins = os.environ.get("ALLOWED_ORIGIN", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB por archivo
SUPPORTED_EXTENSIONS = (".txt", ".md", ".markdown", ".html", ".htm")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/trim-sizes")
def trim_sizes():
    return {"sizes": list(kdp_rules.TRIM_SIZES.keys()), "default": kdp_rules.DEFAULT_TRIM_SIZE}


def _decode(raw_bytes: bytes) -> str:
    try:
        return raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return raw_bytes.decode("latin-1")


@app.post("/api/generate-pdf")
async def generate_pdf(
    file: list[UploadFile] = File(...),
    trim_size: str = Form(kdp_rules.DEFAULT_TRIM_SIZE),
    font_family: str = Form("garamond"),
    font_size: float = Form(11.0),
    title: str = Form(""),
    author: str = Form(""),
):
    files = file
    if trim_size not in kdp_rules.TRIM_SIZES:
        raise HTTPException(status_code=400, detail=f"trim_size inválido: {trim_size}")
    if not (10.0 <= font_size <= 12.0):
        raise HTTPException(status_code=400, detail="font_size debe estar entre 10 y 12 pt")

    for f in files:
        if not f.filename.lower().endswith(SUPPORTED_EXTENSIONS):
            raise HTTPException(
                status_code=400,
                detail=f"Formato no soportado: {f.filename} (usa .txt, .md o .html)",
            )

    all_chapters: list[Chapter] = []
    detected_title = title.strip()
    detected_author = author.strip()

    for f in sorted(files, key=lambda uf: uf.filename):
        raw_bytes = await f.read()
        if len(raw_bytes) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail=f"{f.filename} supera el límite de 15 MB")
        raw_text = _decode(raw_bytes)
        lower_name = f.filename.lower()

        if lower_name.endswith((".html", ".htm")):
            chapter, book_title, book_author = parse_html_chapter(
                raw_text, fallback_order=len(all_chapters) + 1
            )
            all_chapters.append(chapter)
            if not detected_title and book_title:
                detected_title = book_title
            if not detected_author and book_author:
                detected_author = book_author
        else:
            all_chapters.extend(parse_manuscript(raw_text))

    if not all_chapters or all(not ch.blocks for ch in all_chapters):
        raise HTTPException(status_code=422, detail="El manuscrito está vacío o no se pudo interpretar")

    if all(ch.number is not None for ch in all_chapters):
        all_chapters.sort(key=lambda ch: ch.number)

    req = PdfRequest(
        trim_size_key=trim_size,
        font_key=font_family,
        font_size_pt=font_size,
        title=detected_title,
        author=detected_author,
    )

    pdf_bytes, page_count, geometry = build_pdf(all_chapters, req)

    safe_title = re.sub(r'[\r\n"]', "", detected_title or "manuscrito").strip()
    download_name = f"{safe_title or 'manuscrito'}-kdp.pdf"
    ascii_fallback = download_name.encode("ascii", "ignore").decode("ascii") or "manuscrito-kdp.pdf"
    encoded_name = quote(download_name)
    headers = {
        "Content-Disposition": (
            f'attachment; filename="{ascii_fallback}"; filename*=UTF-8\'\'{encoded_name}'
        ),
        "X-Page-Count": str(page_count),
        "X-Gutter-Inches": str(geometry.gutter_in),
    }
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers=headers)
