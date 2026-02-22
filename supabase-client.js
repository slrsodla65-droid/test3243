import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jcaauqgdjrwkzyiozvxy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_OiOsZ09K9J9iDDG_9LIP6w_zdutF24q";

const hasPlaceholderConfig =
  SUPABASE_URL.includes("YOUR_PROJECT_ID") ||
  SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY");

export const isSupabaseConfigured = !hasPlaceholderConfig;

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getSupabaseSetupMessage() {
  return "supabase-client.js 파일의 SUPABASE_URL, SUPABASE_ANON_KEY를 실제 값으로 먼저 바꿔주세요.";
}
