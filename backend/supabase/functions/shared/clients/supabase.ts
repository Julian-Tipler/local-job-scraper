import { createClient } from "npm:@supabase/supabase-js@2.43.5";

export const supabase = createClient(
  Deno.env.get("URL" ?? "")!,
  Deno.env.get("ANON_KEY" ?? "")!,
);
