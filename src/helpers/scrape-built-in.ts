import cheerio from "cheerio";

const URL =
  "https://www.builtinaustin.com/jobs/remote/dev-engineering?city=Austin&state=Texas&country=USA";

export const scrapeBuiltIn = async () => {
  try {
    const response = await fetch(URL);
    const text = await response.text();

    const $ = cheerio.load(text);
    const jobCards = $('[data-id="job-card"]');

    // Iterate over each job card and extract the text from the <a> tag inside the <h2> tag
    const jobs: { title: string; url: string }[] = [];
    jobCards.each((index, element) => {
      const jobTitle = $(element).find("h2 a").text().trim();
      jobs.push({ title: jobTitle, url: URL });
    });

    return jobs;
  } catch (error) {
    console.error(`Error scraping the website: ${error.message}`);
  }
};
