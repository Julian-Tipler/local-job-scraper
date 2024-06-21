import { supabase } from "../../shared/clients/supabase.ts";
import PushBullet from "https://esm.sh/pushbullet@3.0.0";

export const post = async (req: Request) => {
  console.info("******");
  const { row } = await req.json();
  const { title } = row;
  const apiKey = Deno.env.get("PUSHBULLET_API_KEY");
  const pusher = new PushBullet(apiKey);

  pusher.note(
    "ujwk6Gf85i8sjuVmm2Ra9Y",
    "There are new job(s) available!",
    `${title} new job(s) available! \n\n${"link would go here"}`,
  );

  return new Response(
    JSON.stringify("hello"),
    { headers: { "Content-Type": "application/json" } },
  );
};
