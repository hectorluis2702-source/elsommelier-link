# Checklist de rotación de secretos (autorizado 2026-11-13)

Antes de importar `apps/api` al monorepo y de cualquier push público del historial del backend.

## Variables a rotar (nombres)

| Variable | Dónde rotar |
|----------|-------------|
| `AZURE_OPENAI_KEY` | Azure OpenAI / portal Azure |
| `AZURE_OPENAI_ENDPOINT` | verificar; rotar key asociada |
| `AZURE_OPENAI_DEPLOYMENT` | verificar nombre deployment |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → reset/rotate |
| `SUPABASE_SERVICE_KEY` | Supabase service_role (si se usó) |
| `SUPABASE_URL` | verificar proyecto |

## Acciones en repos

1. En `elsommelier-backend`: mergear `fix/remove-committed-secrets` o equivalente; no commitear `.env` ni `node_modules`.
2. Actualizar env vars en Vercel del proyecto `elsommelier-backend` con las keys nuevas.
3. No imprimir valores en chat, issues ni commits.
4. Tratar `vinotipos/.env.example` como sensible si contiene valores reales; reemplazar por placeholders.

## Estado

- [ ] Keys rotadas en Azure
- [ ] Keys rotadas en Supabase
- [ ] Env actualizado en Vercel
- [ ] Backend limpio importado a `apps/api`
