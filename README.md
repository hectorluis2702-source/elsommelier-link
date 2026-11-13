# El Sommelier RD — Monorepo

**GitHub:** [hectorluis2702-source/elsommelier-link](https://github.com/hectorluis2702-source/elsommelier-link)

Monorepo de la academia (pnpm workspaces + Turborepo). PWA + API en Vercel operativos.

## Estructura

| Path | Contenido |
|------|-----------|
| `apps/web` | PWA principal (`elsommelier-pwa` main) |
| `apps/api` | Backend Express + Azure OpenAI + Supabase |
| `apps/academy-site` | Landing / catálogo de cursos |
| `apps/vinotipos` | App gamificada |
| `tools/motor-agave` | Motor editorial Gemini |
| `content/wset3-coach` | Material WSET3 |
| `archive/el-sommelier-server` | API legado (no deploy) |
| `packages/database` | Migraciones Supabase (canónico) |

## Desarrollo local

```bash
pnpm install
pnpm --filter @elsommelier/web dev
pnpm --filter @elsommelier/api dev   # requiere apps/api/.env (ver .env.example)
```

## Despliegue Vercel

Ver `docs/VERCEL_SETUP.md`.

- **Web:** Root Directory `apps/web`
- **API:** Root Directory `apps/api` + variables Supabase / Azure OpenAI

## Documentación

- `docs/VERCEL_SETUP.md` — rename, dos proyectos Vercel, cutover
- `docs/SECRETS_ROTATION.md` — checklist de rotación (nombres de vars)
- `docs/SESSION_CLOSE.md` — cierre de la sesión de migración a monorepo
