import { get } from "./get/get.ts";

Deno.serve(async (req) => {
  const { method } = req;

  switch (method) {
    case "GET":
      return await get(req);
    default:
      return new Response(null, { status: 405 });
  }
});
