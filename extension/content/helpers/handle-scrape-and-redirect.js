import { openai } from "../clients/openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

export const handleScrapeAndRedirect = async (button) => {
  try {
    const { title, description } = await extractJobParameters();
    const url = window.location.href;

    // later renditions should create the job event to bypass the create page
    const webUrl =
      `${import.meta.env.VITE_WEB_URL}/create?` +
      `title=${encodeURIComponent(title)}&` +
      `url=${encodeURIComponent(url)}&` +
      `description=${encodeURIComponent(description)}`;

    button.innerHTML = "Flashcards Created!";
    button.style.backgroundColor = "green";
    window.open(webUrl, "_blank");
  } catch (error) {
    console.error("Error extracting job parameters", error);
    button.innerHTML = "Error creating flashcards!";
    button.style.backgroundColor = "red";
  }
};

const extractJobParameters = async () => {
  console.log("Extracting job parameters...");
  // Common content selectors: These should be adjusted based on common patterns found in your target pages.

  const contentSelectors = [
    "job",
    ".post-body",
    ".entry-content",
    "main", // Some sites use main for their primary content
    'div[role="main"]', // A common attribute for main content areas
  ];

  // Find the first matching element for these selectors
  let content = contentSelectors.reduce((found, selector) => {
    return found || document.querySelector(selector);
  }, null);

  if (!content) {
    content = document.body;
  }
  // Here, you might want to filter or process the text to remove unwanted parts like ads, navigation elements, etc.
  const cleanedText = await cleanText(content.innerText);
  const jobParams = await openAIParseText(cleanedText);
  return jobParams;
};

const cleanText = (text) => {
  return text
    .replace(/\s{2,}/g, " ") // Replace multiple whitespace with a single space
    .replace(/[\r\n]+/g, "\n") // Replace multiple line breaks with a single one
    .trim(); // Trim whitespace from start and end of text
};

const openAIParseText = async (text) => {
  console.log("openai parsing text");
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini-2024-07-18",
    messages: [
      {
        role: "system",
        content:
          "You are an assistant that returns information in JSON format.",
      },
      {
        role: "user",
        content: jobParamsPrompt + text,
      },
    ],
    response_format: zodResponseFormat(JobOutput, "job_output"),
  });
  const response = completion.choices[0].message;
  console.log(response);
  if (response.parsed) {
    console.log(response.parsed);
  } else if (response.refusal) {
    // handle refusal
    console.log(response.refusal);
  }
  return {
    title: response.parsed.title,
    description: response.parsed.description,
  };
  // create a fetch request to openAI functions that specifies it must return title, url, descroption
  // handle incorrect response (if !title || !url || !description throw new Error())
};

const JobOutput = z.object({
  title: z.string(),
  description: z.string(),
});

const jobParamsPrompt = `You are a job description parser who extracts the title and description from a job page on a job website. 
You will be given the text from a webpage and must return only the title and description. 
Return the full description, which may be several paragraphs.
Here is the text from the website: `;