# elsommelier-academy (host temporal: `elsommelier-link`)

Monorepo El Sommelier RD Academy — pnpm workspaces + Turborepo.

> Renombrar el repo en GitHub a `elsommelier-academy` cuando quieras (Settings → Rename).

## Apps / tools

| Path | Origen | Notas |
|------|--------|-------|
| `apps/web` | elsommelier-pwa `main` | PWA estática |
| `apps/api` | elsommelier-backend | Historial limpio (sin `.env` / `node_modules`) |
| `apps/academy-site` | El-Sommelier-RD-Academy | Marketing / catálogo |
| `apps/vinotipos` | vinotipos `master` | Vite + Supabase |
| `tools/motor-agave` | motor-agave | Gemini editorial |
| `content/wset3-coach` | wset3-coach | Material estudio |
| `archive/el-sommelier-server` | El-Sommelier-Server | Legado |
| `packages/database` | nuevo | Migraciones canónicas |

## Setup

```bash
pnpm install
pnpm --filter @elsommelier/web test
pnpm --filter @elsommelier/api test
```

Secretos: `docs/SECRETS_ROTATION.md`. API usa `.env` local (no commitear).
