-- Supabase RLS + audit policies for Vinotipos
-- Run this in the Supabase SQL editor or via the CLI against the project DB.

-- 1) Enable RLS and create row-level policies for user-scoped tables

-- PLAYER PROGRESS
ALTER TABLE IF EXISTS public.player_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "player_progress_select_own" ON public.player_progress
  FOR SELECT USING (auth.uid() = user_id::text);
CREATE POLICY IF NOT EXISTS "player_progress_insert_own" ON public.player_progress
  FOR INSERT WITH CHECK (auth.uid() = NEW.user_id::text);
CREATE POLICY IF NOT EXISTS "player_progress_update_own" ON public.player_progress
  FOR UPDATE USING (auth.uid() = user_id::text) WITH CHECK (auth.uid() = NEW.user_id::text);

-- PLAYER UNLOCKS
ALTER TABLE IF EXISTS public.player_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "player_unlocks_select_own" ON public.player_unlocks
  FOR SELECT USING (auth.uid() = user_id::text);
CREATE POLICY IF NOT EXISTS "player_unlocks_insert_own" ON public.player_unlocks
  FOR INSERT WITH CHECK (auth.uid() = NEW.user_id::text);
CREATE POLICY IF NOT EXISTS "player_unlocks_delete_own" ON public.player_unlocks
  FOR DELETE USING (auth.uid() = user_id::text);

-- REGION ANSWER HISTORY
ALTER TABLE IF EXISTS public.region_answer_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "region_answers_select_own" ON public.region_answer_history
  FOR SELECT USING (auth.uid() = user_id::text);
CREATE POLICY IF NOT EXISTS "region_answers_insert_own" ON public.region_answer_history
  FOR INSERT WITH CHECK (auth.uid() = NEW.user_id::text);
CREATE POLICY IF NOT EXISTS "region_answers_delete_own" ON public.region_answer_history
  FOR DELETE USING (auth.uid() = user_id::text);

-- Optional: purchases table (if you add one)
ALTER TABLE IF EXISTS public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "purchases_select_own" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id::text);
CREATE POLICY IF NOT EXISTS "purchases_insert_own" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = NEW.user_id::text);

-- 2) Audit log table + trigger function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id text,
  row_data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.log_audit_changes() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_log(table_name, operation, user_id, row_data)
    VALUES (TG_TABLE_NAME, TG_OP, COALESCE(NEW.user_id::text, auth.uid()::text), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_log(table_name, operation, user_id, row_data)
    VALUES (TG_TABLE_NAME, TG_OP, COALESCE(NEW.user_id::text, auth.uid()::text), jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_log(table_name, operation, user_id, row_data)
    VALUES (TG_TABLE_NAME, TG_OP, COALESCE(OLD.user_id::text, auth.uid()::text), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit trigger to tables of interest
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='region_answer_history') THEN
    BEGIN
      EXECUTE 'DROP TRIGGER IF EXISTS audit_region_answers ON public.region_answer_history';
      EXECUTE 'CREATE TRIGGER audit_region_answers AFTER INSERT OR UPDATE OR DELETE ON public.region_answer_history FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes()';
    EXCEPTION WHEN others THEN RAISE NOTICE 'Could not create trigger on region_answer_history: %', SQLERRM; END;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='player_unlocks') THEN
    BEGIN
      EXECUTE 'DROP TRIGGER IF EXISTS audit_player_unlocks ON public.player_unlocks';
      EXECUTE 'CREATE TRIGGER audit_player_unlocks AFTER INSERT OR UPDATE OR DELETE ON public.player_unlocks FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes()';
    EXCEPTION WHEN others THEN RAISE NOTICE 'Could not create trigger on player_unlocks: %', SQLERRM; END;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='player_progress') THEN
    BEGIN
      EXECUTE 'DROP TRIGGER IF EXISTS audit_player_progress ON public.player_progress';
      EXECUTE 'CREATE TRIGGER audit_player_progress AFTER INSERT OR UPDATE OR DELETE ON public.player_progress FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes()';
    EXCEPTION WHEN others THEN RAISE NOTICE 'Could not create trigger on player_progress: %', SQLERRM; END;
  END IF;
END$$;

-- 3) Notes / recommendations (run manually in Supabase SQL editor):
-- - Review the policies here and adapt column names/types to your schema.
-- - For operations that must be performed server-side (charges, granting paid skins), use a server-side service_role key endpoint.
-- - Do NOT commit service_role keys to the repo. Use environment variables in your deployment platform.
-- - After applying policies, test with an authenticated user and confirm the app still reads/writes only its own rows.
