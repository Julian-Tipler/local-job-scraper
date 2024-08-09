import { CohereClient } from "cohere-ai";

const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY;

export const cohere = new CohereClient({
  token: COHERE_API_KEY,
});
