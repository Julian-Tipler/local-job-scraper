import { CohereClient } from "cohere";

const COHERE_API_KEY = Deno.env.get("COHERE_API_KEY");

export const cohere = new CohereClient({
  token: COHERE_API_KEY,
});
