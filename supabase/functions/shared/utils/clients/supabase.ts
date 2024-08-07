import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const KEY = Deno.env.get("KEY");

if (!SUPABASE_URL || !KEY) {
  throw new Error(
    `Supabase Url or Key not found \n\n {SUPABASE_URL:${SUPABASE_URL},KEY:${KEY}}`,
  );
}

export const supabase = createClient(
  // https://github.com/orgs/supabase/discussions/14169 best practice for connecting to supabase API
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("KEY") ?? "",
);
