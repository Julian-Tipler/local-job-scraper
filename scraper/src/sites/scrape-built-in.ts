import cheerio from "cheerio";
import { filterExistingJobs } from "../helpers/filterExistingJobs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";
import { Job } from "../util/types";
import { saveNewJobsToSupabase } from "./save-new-jobs-to-supabase";

const WEBSITE = "BuiltIn";
const SITE_URL =
  "https://www.builtinaustin.com/jobs/remote/dev-engineering?city=Austin&state=Texas&country=USA";
const NUM_JOBS = 8;

export const scrapeBuiltIn = async () => {
  console.info("Starting BuiltIn Job 🚧");

  let browser: Browser | null = null;
  try {
    const response = await fetch(SITE_URL);
    const text = await response.text();

    const $ = cheerio.load(text);
    const jobCards = $('[data-id="job-card"]');

    // Iterate over each job card and extract the text from the <a> tag inside the <h2> tag
    const jobs: Job[] = [];
    jobCards.each((index, element) => {
      if (index >= NUM_JOBS) return false;
      const job = $(element).find("h2 a");
      const jobTitle = job.text().trim();
      jobs.push({
        title: jobTitle,
        url: `https://www.builtinaustin.com${job.attr("href")}`,
        description: "",
      });
    });
    if (jobs.length === NUM_JOBS) {
      console.info(`Fetched ${WEBSITE} jobs index successfully`);
    } else {
      console.info(`No jobs found on ${WEBSITE}`);
    }

    const newJobs = await filterExistingJobs(jobs, WEBSITE);

    browser = await puppeteer.use(StealthPlugin()).launch({
      headless: true,
    });

    const page = await browser.newPage();

    for (const job of newJobs) {
      console.info(`Fetching job description for ${job.title}`);
      try {
        await page.goto(job.url, { waitUntil: "domcontentloaded" });
        const number = Math.floor(Math.random() * 1000) + 1;
        await new Promise((resolve) => setTimeout(resolve, 1000 + number));

        await page.waitForSelector(".job-post-item", { timeout: 5000 });
        const jobDescriptionHtml = await page.evaluate(() => {
          const jobPostItem = document.querySelector(".job-post-item");
          if (jobPostItem) {
            const roleElement = Array.from(jobPostItem.querySelectorAll("*"))
              .find((el) => el.textContent?.trim() === "The Role");
            if (roleElement) {
              const nextSiblingDiv = roleElement.nextElementSibling;
              if (
                nextSiblingDiv &&
                nextSiblingDiv.tagName.toLowerCase() === "div"
              ) {
                return nextSiblingDiv.innerHTML;
              }
            }
          }
          return "";
        });
        if (!jobDescriptionHtml) {
          throw new Error("Job description not found");
        }
        // Replace certain HTML tags with line breaks
        const jobDescription = jobDescriptionHtml
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n\n")
          .replace(/<\/?[^>]+(>|$)/g, "") // Remove remaining HTML tags
          .trim();
        job.description = jobDescription;

        // Add job description to the job object
      } catch (jobError) {
        console.error(
          `Error fetching job description for ${job.title}: ${jobError.message}`,
        );
        throw new Error(`issue fetching job description: ${jobError}`);
      }
    }
    const savedJobs = await saveNewJobsToSupabase(newJobs);
    return savedJobs;
  } catch (error) {
    console.error(`Error scraping the website: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
