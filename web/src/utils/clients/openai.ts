// init openai client for vite

import { createClient } from "@openai/api";

export const openai = createClient({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});
