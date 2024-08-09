import cheerio from "cheerio";
import { filterExistingJobs } from "../filterExistingJobs";
import { handleNewJobs } from "./handle-new-jobs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const WEBSITE = "BuiltIn";
const URL =
  "https://www.builtinaustin.com/jobs/remote/dev-engineering?city=Austin&state=Texas&country=USA";

export const scrapeBuiltIn = async () => {
  try {
    const response = await fetch(URL);
    const text = await response.text();

    const $ = cheerio.load(text);
    const jobCards = $('[data-id="job-card"]');

    // Iterate over each job card and extract the text from the <a> tag inside the <h2> tag
    const jobs: { title: string; url: string; description: string }[] = [];
    jobCards.each((index, element) => {
      if (index >= 5) return false;
      const job = $(element).find("h2 a");
      const jobTitle = job.text().trim();
      jobs.push({
        title: jobTitle,
        url: `https://www.builtinaustin.com${job.attr("href")}`,
        description: "",
      });
    });

    const newJobsOne = await filterExistingJobs(jobs, WEBSITE);
    const newJobs = newJobsOne.slice(0, 15);

    const browser = await puppeteer.use(StealthPlugin()).launch({
      headless: true,
    });

    // Fetch the descriptions for each page
    if (newJobs.length > 0) {
      const page = await browser.newPage();

      for (const job of newJobs) {
        console.info(`Fetching job description for ${job.title}`);
        try {
          await page.goto(job.url, { waitUntil: "domcontentloaded" });
          const number = Math.floor(Math.random() * 1000) + 1;
          await new Promise((resolve) => setTimeout(resolve, 1000 + number));
          await page.screenshot({
            path: `${new Date()}.png`,
            fullPage: true,
          });

          const jobDescriptionHtml = await page.evaluate(() => {
            const jobDescElement = document.querySelector(".job-description");
            return jobDescElement ? jobDescElement.innerHTML : "";
          });
          if (jobDescriptionHtml) {
            // Replace certain HTML tags with line breaks
            const jobDescription = jobDescriptionHtml
              .replace(/<br\s*\/?>/gi, "\n")
              .replace(/<\/p>/gi, "\n\n")
              .replace(/<\/?[^>]+(>|$)/g, "") // Remove remaining HTML tags
              .trim();
            job.description = jobDescription;
          }
          // Add job description to the job object
        } catch (jobError) {
          console.error(
            `Error fetching job description for ${job.title}: ${jobError.message}`,
          );
        }
      }
    }

    handleNewJobs(newJobs, WEBSITE);
  } catch (error) {
    console.error(`Error scraping the website: ${error.message}`);
  }
};
