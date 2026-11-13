FROM python:3.11-slim

# WeasyPrint depende de librerías nativas de renderizado (Pango, Cairo,
# GDK-Pixbuf) que no vienen en la imagen base de Python.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    fonts-liberation \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY scripts/download_fonts.py scripts/download_fonts.py
RUN python scripts/download_fonts.py

COPY app ./app

ENV ALLOWED_ORIGIN=http://localhost:3000
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
