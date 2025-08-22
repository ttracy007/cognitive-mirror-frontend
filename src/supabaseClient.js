// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ---- username helpers (single source of truth) ----
const USERNAME_KEY = 'cm_username';

export const UsernameStore = {
  set(name) { localStorage.setItem(USERNAME_KEY, name); },
  get()     { return localStorage.getItem(USERNAME_KEY) || ''; },
  clear()   { localStorage.removeItem(USERNAME_KEY); }
};

// ---- session bootstrap + listener (rehydrates on refresh) ----
export async function getBootSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session ?? null;
}

// subscribe once per app boot (call from App.js useEffect)
export function subscribeAuth(onChange) {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session || null);
  });
  return () => sub.subscription.unsubscribe();
}
