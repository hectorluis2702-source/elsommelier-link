# @elsommelier/database

Canonical location for Supabase migrations (`supabase/migrations`).

No academia schema migrations were found in source repos at import time.
Before adding migrations, dump the deployed project schema and reconcile with:
- backend REST tables: `vinos_catalogo`, `lecciones_academy`, `progreso_usuario_academy`, `ai_conversations`, `vinos_escaneados`
- vinotipos: `player_progress`, `player_unlocks`, `region_answer_history`, `pairing_answer_history`
- motor-agave: `enciclopedia_agave`

Copy of vinotipos policies (reference): see `apps/vinotipos/supabase_policies.sql`.
