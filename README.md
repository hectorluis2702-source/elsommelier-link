# elsommelier-academy (host temporal: elsommelier-link)

Monorepo de El Sommelier RD Academy (pnpm workspaces + Turborepo).

> **Nombre:** el código vive temporalmente en el repo GitHub `elsommelier-link`.
> Después se renombrará a `elsommelier-academy` (Settings → Rename). No hace falta re-importar.

## Decisiones

| # | Decisión | Estado |
|---|----------|--------|
| 1 | Cuenta `hectorluis2702-source` | Confirmada |
| 2 | `apps/web` ← `elsommelier-pwa` **main** (estático) | Hecho |
| 3 | Higiene/rotación secretos backend antes de `apps/api` | Autorizada — pendiente ejecutar |

## Estructura

```
apps/web/          ← elsommelier-pwa main (subtree, SHA ancestro b4100d8)
apps/api/          ← pendiente (tras higiene)
apps/academy-site/ ← pendiente
...
```

## Scripts raíz

- `pnpm install` / `pnpm build` / `pnpm test` (vía Turbo)
