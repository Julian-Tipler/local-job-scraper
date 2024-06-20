import { supabase } from "../../shared/clients/supabase.ts";
// import PushBullet from "npm:pushbullet";

export const post = async (req: Request) => {
  console.log(req);

  return new Response(
    JSON.stringify("hello"),
    { headers: { "Content-Type": "application/json" } },
  );
};
