# KDP Manuscript Formatter

Aplicación que convierte un manuscrito (texto plano, Markdown, o uno o
varios capítulos en HTML) en un PDF de interior listo para imprimir en
Amazon KDP: tamaño de libro (trim size), márgenes en espejo (gutter)
calculados según el número de páginas, interlineado 1.2 y capitulares
(drop caps) al inicio de cada capítulo.

Soporta subir **varios archivos `.html`** a la vez (uno por capítulo). Cada
archivo se interpreta con `backend/app/html_parser.py`, que reconstruye
párrafos, subtítulos, citas, listas y notas destacadas ("Dato curioso",
"Reflexión", "Para llevar", etc.) a partir de una estructura HTML tipo
lector web, y ordena los capítulos por el número detectado en cada uno. El
título y autor del libro se detectan automáticamente si el HTML los expone
(p. ej. `<span class="book-label">Título · Autor</span>`).

Este módulo vive dentro del repo `elsommelier-pwa` como un proyecto
independiente (`kdp-formatter/`) y no modifica la PWA existente.

## Estructura

```
kdp-formatter/
├── frontend/     Next.js 14 (App Router) + Tailwind CSS — estética "Dark Elegance"
└── backend/      FastAPI + WeasyPrint — genera el PDF final con fuentes incrustadas
```

## 1. Backend — desarrollo local

Requiere Python 3.11+.

```bash
cd kdp-formatter/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Descarga las fuentes libres por defecto (EB Garamond, PT Serif, Libre
# Baskerville — sustitutos de metrica compatible de Garamond/Palatino/
# Baskerville, ver app/fonts.py para más detalle sobre licencias).
python scripts/download_fonts.py

uvicorn app.main:app --reload --port 8000
```

El servidor queda en `http://localhost:8000`. Prueba `GET /api/health`.

### Usar las fuentes originales (con licencia propia)

Si tienes licencia de Adobe Garamond Pro, Palatino Linotype o Baskerville,
copia los `.ttf`/`.otf` a `backend/fonts/` con estos nombres exactos (ver
`app/fonts.py`) y el backend los usará automáticamente en vez de los
sustitutos libres:

```
EBGaramond-Regular.woff2 / -Italic.woff2 / -Bold.woff2 / -BoldItalic.woff2
PTSerif-Regular.woff2 / -Italic.woff2 / -Bold.woff2 / -BoldItalic.woff2
LibreBaskerville-Regular.woff2 / -Italic.woff2 / -Bold.woff2
```

(el formato puede ser `.ttf`, `.otf` o `.woff2`; `app/fonts.py` detecta la
extensión automáticamente).

## 2. Frontend — desarrollo local

Requiere Node.js 18+.

```bash
cd kdp-formatter/frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Abre `http://localhost:3000`.

## 3. Despliegue del backend

WeasyPrint necesita librerías nativas (Pango, Cairo, GDK-Pixbuf), por lo que
**no es compatible con funciones serverless de Vercel**. Se recomienda un
host basado en contenedores. Con el `Dockerfile` incluido:

### Opción A — Render.com
1. Crea un nuevo **Web Service** en Render, apuntando a este repositorio.
2. **Root Directory**: `kdp-formatter/backend`
3. Render detectará el `Dockerfile` automáticamente.
4. Variable de entorno `ALLOWED_ORIGIN`: la URL de tu frontend en Vercel
   (ej. `https://tu-app.vercel.app`).
5. Despliega. Anota la URL pública (ej. `https://kdp-backend.onrender.com`).

### Opción B — Fly.io
```bash
cd kdp-formatter/backend
fly launch --no-deploy   # genera fly.toml, usa el Dockerfile existente
fly secrets set ALLOWED_ORIGIN=https://tu-app.vercel.app
fly deploy
```

### Opción C — Railway
1. New Project → Deploy from GitHub repo.
2. Root directory: `kdp-formatter/backend`.
3. Railway detecta el `Dockerfile`; añade la variable `ALLOWED_ORIGIN`.

## 4. Despliegue del frontend en Vercel

1. En Vercel, **Add New Project** → importa este repositorio.
2. **Root Directory**: `kdp-formatter/frontend`.
3. Framework preset: Next.js (autodetectado).
4. Variable de entorno **`NEXT_PUBLIC_API_URL`**: la URL pública del backend
   desplegado en el paso 3 (ej. `https://kdp-backend.onrender.com`).
5. Deploy.

Una vez desplegados ambos, actualiza `ALLOWED_ORIGIN` en el backend con la
URL final de Vercel para que CORS permita las peticiones del frontend.

## Lógica KDP implementada

- **Trim sizes** estándar de KDP (5x8, 5.5x8.5, 6x9, 7x10, 8.5x11, etc.).
- **Gutter dinámico**: el backend renderiza el manuscrito en dos pasadas —
  la primera para contar las páginas reales, la segunda con el margen de
  encuadernación oficial que corresponde a ese rango de páginas (tabla en
  `backend/app/kdp_rules.py`, fuente: especificaciones públicas de Amazon
  KDP para interiores de tapa blanda).
- **Interlineado** fijo en 1.2.
- **Capitulares**: la primera letra de cada capítulo se envuelve en un
  `<span class="dropcap">` flotante con tamaño ampliado (no se usa
  `::first-letter` porque WeasyPrint reserva mal el ancho del float con ese
  pseudo-elemento y el texto queda superpuesto sobre la capitular).
- **Cada capítulo empieza en página nueva** (`page-break-before: always`),
  sin forzar página impar/recto — así nunca se inserta una página en blanco
  de relleno entre capítulos.
- **Fuentes incrustadas**: `@font-face` con los `.ttf`/`.woff2` locales del
  backend, garantizando que el PDF final las lleve embebidas (requisito de
  KDP).
