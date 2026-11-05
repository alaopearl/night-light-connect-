import { createClient } from "@supabase/supabase-js";

const backendMode = import.meta.env.VITE_BACKEND_MODE || "supabase";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ohrxdssaszfdeqremxsp.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_rY1r-smR-9GOrVi62STpog_fs7heYQc";

export const supabase =
  backendMode === "supabase" && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const hasSupabase = Boolean(supabase);
