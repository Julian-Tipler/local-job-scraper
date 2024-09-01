import { openai } from "./clients/openai";

export const fetchKeyWords = async (
  userBullets: string[],
  description: string,
) => {
  const prompt =
    `Extract any programming languages, technologies, or other skills (such as CI/CD) mentioned in this job description. 
        In addition to general programming languages and technologies, look for the following key words: ${
      userBullets.join(", ")
    } 
        Only return the programming languages or technologies separated by a comma and space and no other words
        Here is the job description: "${description}"`;
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125", // Use the appropriate GPT model
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
  });
  const extractedKeyWords = completion?.choices?.[0]?.message?.content;
  if (!extractedKeyWords) {
    console.error("No keywords extracted from OpenAI");
    throw new Error();
  }
  console.log("Extracted keywords:", extractedKeyWords);
  const trimmedKeyWords = extractedKeyWords
    .split(", ")
    .map((word: string) => word.trim());
  console.log("Trimmed keywords:", trimmedKeyWords);

  return trimmedKeyWords;
};
