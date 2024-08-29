import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY,
  //TODO if I release for public use remove this
  dangerouslyAllowBrowser: true,
});
