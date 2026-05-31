import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fxxclrcwpiyxrdjhjxdf.supabase.co";
const SUPABASE_KEY = "sb_publishable_ADFV2C040yqhUYR6huJZdQ_aW2DNDDR";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
