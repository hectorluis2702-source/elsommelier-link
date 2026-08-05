import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error(
    'Faltan variables de entorno de Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY). ' +
    'Copia .env.example a .env y completa los valores.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // Persistimos la sesion anonima en localStorage para que el mismo dispositivo
    // conserve su identidad (y por lo tanto su progreso) entre visitas.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

/**
 * Devuelve la sesion activa, creando un usuario anonimo si aun no existe
 * ninguna sesion en este dispositivo. Se apoya en Supabase Anonymous Sign-Ins:
 * https://supabase.com/docs/guides/auth/auth-anonymous
 *
 * IMPORTANTE: "Anonymous Sign-Ins" debe estar habilitado en el dashboard del
 * proyecto (Authentication > Sign In / Providers) o esta llamada fallara.
 */
export async function ensureAnonymousSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('No se pudo iniciar sesion anonima en Supabase:', error);
    throw error;
  }
  return data.session;
}
