export const handleScrapeAndRedirect = async (button) => {
  try {
    const articleText = await extractJobParameters();

    // later renditions should create the job event to bypass the create page

    button.innerHTML = "Flashcards Created!";
    button.style.backgroundColor = "green";
    window.open(
      `${import.meta.env.VITE_WEB_URL}/create?` +
        `title=` +
        `url=` +
        `description=`,
      "_blank"
    );
  } catch (error) {
    console.error("Error creating flashcards");
    button.innerHTML = "Error creating flashcards!";
    button.style.backgroundColor = "red";
  }
};

const extractJobParameters = async () => {
  // Common content selectors: These should be adjusted based on common patterns found in your target pages.
  const contentSelectors = [
    "job",
    ".post-content",
    ".article-content",
    ".post-body",
    ".entry-content",
    "main", // Some sites use main for their primary content
    'div[role="main"]', // A common attribute for main content areas
  ];

  // Find the first matching element for these selectors
  const content = contentSelectors.reduce((found, selector) => {
    return found || document.querySelector(selector);
  }, null);

  if (!content) {
    return document.body.innerText.trim();
  }

  // Here, you might want to filter or process the text to remove unwanted parts like ads, navigation elements, etc.
  const cleanedText = await cleanText(content.innerText);
  const { title, url, description } = await openAIParseText(cleanedText);
};

const cleanText = (text) => {
  return text
    .replace(/\s{2,}/g, " ") // Replace multiple whitespace with a single space
    .replace(/[\r\n]+/g, "\n") // Replace multiple line breaks with a single one
    .trim(); // Trim whitespace from start and end of text
};

const openAIParseText = async (text) => {
    
  // create a fetch request to openAI functions that specifies it must return title, url, descroption
  // handle incorrect response
};
