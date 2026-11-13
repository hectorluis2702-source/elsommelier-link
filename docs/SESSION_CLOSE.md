# Cierre de sesión — migración a monorepo

**Fecha:** 2026-11-13  
**Repo unificado:** `hectorluis2702-source/elsommelier-link`  
**Estado:** Estructura lista · Vercel web + API respondiendo (health OK, confirmado por Héctor)

## Decisiones tomadas

1. Cuenta GitHub: `hectorluis2702-source`
2. `apps/web` desde `elsommelier-pwa` **main** (PWA estática; tip Next aplazado)
3. Higiene de secretos del backend antes de importar `apps/api` (historial sin `.env` / `node_modules`)
4. Host del monorepo: `elsommelier-link` (rename de display/slug opcional más adelante)

## Qué se importó

| Destino | Origen |
|---------|--------|
| `apps/web` | elsommelier-pwa |
| `apps/api` | elsommelier-backend (limpio) |
| `apps/academy-site` | El-Sommelier-RD-Academy |
| `apps/vinotipos` | vinotipos |
| `tools/motor-agave` | motor-agave |
| `content/wset3-coach` | wset3-coach |
| `archive/el-sommelier-server` | El-Sommelier-Server |
| `packages/database` | stub nuevo |

## Fuera de este monorepo

- `hg-creative-operation-center`
- `Maquetador-profesional-2`
- `Music_skill_elsommelierrd`

## Pendientes opcionales (no bloquean)

- Renombrar el repo en GitHub si se desea otro slug
- Parametrizar `API_BASE` en la PWA hacia el nuevo host API (hoy puede seguir el backend legacy)
- Integrar tip Next `cursor/ux-ui-refactor-luminoso-dc5a` cuando se decida
- Rellenar `packages/database/supabase/migrations` desde dump del proyecto Supabase real
- Corregir iconos PWA (`icons/` faltantes en main histórico)

## Repos y deploys originales

Conservados a propósito para rollback. No borrar hasta un ciclo estable en producción.

---

Sesión de arquitectura/migración **cerrada**. El monorepo queda como fuente de trabajo unificada.
