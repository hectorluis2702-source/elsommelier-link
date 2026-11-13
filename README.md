# elsommelier-academy

Monorepo de El Sommelier RD Academy (pnpm workspaces + Turborepo).

## Decisiones Fase 2a

- Cuenta: `hectorluis2702-source`
- `apps/web` ← `elsommelier-pwa` **main** (PWA estática; tip Next aplazado)
- Higiene de secretos del backend autorizada antes de importar `apps/api`

## Apps

| Path | Origen |
|------|--------|
| `apps/web` | elsommelier-pwa (main) |

Próximos imports: `apps/api`, `apps/academy-site`, etc.
