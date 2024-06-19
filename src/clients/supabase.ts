import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  // https://github.com/orgs/supabase/discussions/14169 best practice for connecting to supabase API
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_KEY ?? ""
);
