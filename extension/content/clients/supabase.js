import { createClient } from "@supabase/supabase-js";
console.log("supabase");
export const supabase = createClient(
  "https://erglkcrjqenxfhoprskp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZ2xrY3JqcWVueGZob3Byc2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg3NjQ2NzYsImV4cCI6MjAzNDM0MDY3Nn0.6tjTpCwmaBuKpjg4oVfff24RYuhRyj71gX6vKkfU6TM"
);
