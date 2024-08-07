import { post } from "./post/post.ts";

Deno.serve(async (req) => {

  const { method } = req;

  switch (method) {
    case "POST":
      return await post();
    default:
      return new Response(null, { status: 405 });
  }
});
