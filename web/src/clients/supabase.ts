import { createClient } from "@supabase/supabase-js";

// Replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_KEY' with your actual Supabase URL and key
const supabaseUrl = "URL";
const supabaseKey = "ANON_KEY";

// Create a new Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
