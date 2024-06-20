import { supabase } from "../../shared/clients/supabase.ts";
import PushBullet from "https://esm.sh/pushbullet@3.0.0";

export const post = async (req: Request) => {
  const payload = await req.json();
  const apiKey = Deno.env.get("PUSHBULLET_API_KEY");
  const pusher = new PushBullet(apiKey);

  console.log("PAYLOAD", payload);
  pusher.note(
    "ujwk6Gf85i8sjuVmm2Ra9Y",
    "There are new job(s) available!",
    `${payload} new job(s) available! \n\n${"hello world"}`,
  );
  console.log(req);

  return new Response(
    JSON.stringify("hello"),
    { headers: { "Content-Type": "application/json" } },
  );
};
