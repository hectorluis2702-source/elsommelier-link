# Vercel + rename (elsommelier-link → elsommelier-academy)

## A. Renombrar el repo en GitHub

1. Abre https://github.com/hectorluis2702-source/elsommelier-link
2. **Settings** → sección **General** → **Repository name**
3. Cambia a: `elsommelier-academy`
4. **Rename**
5. GitHub redirige la URL antigua automáticamente.
6. En tu Mac actualiza el remote:
   ```bash
   cd ~/ruta/al/clone
   git remote set-url origin git@github.com:hectorluis2702-source/elsommelier-academy.git
   # o HTTPS equivalente
   ```

## B. Conectar Vercel (2 proyectos, 1 repo)

Conserva los deploys viejos (`elsommelier-pwa` / `elsommelier-backend`) hasta que Preview del monorepo esté verde.

### B1. Proyecto WEB (PWA)

1. [vercel.com](https://vercel.com) → **Add New…** → **Project**
2. Importa `hectorluis2702-source/elsommelier-academy` (o `elsommelier-link` si aún no renombraste)
3. **Root Directory** → **Edit** → `apps/web`
4. Framework Preset: **Other**
5. Build & Output (si no lee vercel.json):
   - Install: `cd ../.. && pnpm install --filter @elsommelier/web...`
   - Build: `pnpm build`
   - Output: `dist`
6. Env (opcional ahora): ninguna obligatoria; `API_BASE` sigue hardcodeada a `https://elsommelier-backend.vercel.app`
7. **Deploy** → prueba Preview: `/`, `manifest.json`, `sw.js`, chat sommelier

### B2. Proyecto API

1. **Add New…** → **Project** → **mismo repo**
2. **Root Directory** → `apps/api`
3. Framework: **Other**
4. Env vars (Production + Preview):

| Name | Notas |
|------|--------|
| `SUPABASE_URL` | privado |
| `SUPABASE_ANON_KEY` | privado |
| `SUPABASE_SERVICE_KEY` | privado (si aplica) |
| `AZURE_OPENAI_ENDPOINT` | privado |
| `AZURE_OPENAI_KEY` | privado |
| `AZURE_OPENAI_DEPLOYMENT` | privado |
| `AZURE_OPENAI_API_VERSION` | opcional |

5. **Deploy** → Preview: `GET /api/health` debe devolver 200

### B3. Cutover

1. Cuando Preview web + api estén OK, asigna dominios de producción a los **nuevos** proyectos Vercel
2. Opcional Fase 2: cambiar `API_BASE` en `apps/web` al host del nuevo proyecto API (o Related Projects)
3. No borres los proyectos Vercel antiguos hasta 1 ciclo estable

## C. Checklist rápido

- [ ] PR #1 mergeado
- [ ] Repo renombrado
- [ ] Proyecto Vercel `…-web` → Root `apps/web`
- [ ] Proyecto Vercel `…-api` → Root `apps/api` + env
- [ ] Preview: health, PWA install, sommelier, academia
- [ ] Dominio producción apuntado
