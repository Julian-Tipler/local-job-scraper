import PushBullet from "https://esm.sh/pushbullet@3.0.0";

export const post = async () => {
  console.info("******");
  const apiKey = Deno.env.get("PUSHBULLET_API_KEY");
  const pusher = new PushBullet(apiKey);

  pusher.note(
    "ujwk6Gf85i8sjuVmm2Ra9Y",
    "There are new job(s) available!",
    `New job(s) available! \n\n${"https://www.builtinaustin.com/jobs/remote/dev-engineering?city=Austin&state=Texas&country=USA"}`,
  );

  return new Response(
    JSON.stringify("hello"),
    { headers: { "Content-Type": "application/json" } },
  );
};
