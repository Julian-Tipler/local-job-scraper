import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_URL;
const supabaseKey = import.meta.env.VITE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing env variable");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
