import { post } from "./post/post.ts";

Deno.serve(async (req) => {
  const payload = await req.json();
  console.info("PAYLOAD", payload);
  const { method } = req;

  switch (method) {
    case "POST":
      return await post(req);
    default:
      return new Response(null, { status: 405 });
  }
});
