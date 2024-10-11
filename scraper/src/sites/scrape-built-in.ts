import cheerio from "cheerio";
import { filterExistingJobs } from "../helpers/filter-existing-jobs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";
import { Job } from "../util/types";
import { saveNewJobsToSupabase } from "../helpers/save-new-jobs-to-supabase";

const WEBSITE = "BuiltIn";
const SITE_URL =
  "https://www.builtinaustin.com/jobs/remote/dev-engineering?city=Austin&state=Texas&country=USA";
const NUM_JOBS = 8;

export const scrapeBuiltIn = async (browser: Browser) => {
  console.info("Starting BuiltIn Job 🚧");

  try {
    const response = await fetch(SITE_URL);
    const text = await response.text();

    const $ = cheerio.load(text);
    const jobCards = $('[data-id="job-card"]');

    // Iterate over each job card and extract the text from the <a> tag inside the <h2> tag
    const recentJobs: Job[] = [];
    jobCards.each((index, element) => {
      if (index >= NUM_JOBS) return false;
      const job = $(element).find("h2 a");
      const jobTitle = job.text().trim();
      recentJobs.push({
        title: jobTitle,
        url: `https://www.builtinaustin.com${job.attr("href")}`,
        description: "",
      });
    });
    if (recentJobs.length === NUM_JOBS) {
      console.info(`Fetched ${WEBSITE} jobs index successfully`);
    } else {
      console.info(`No jobs found on ${WEBSITE}`);
    }
    return recentJobs;
  } catch (error) {
    console.error(`Error scraping ${WEBSITE}: ${error.message}`);
    return [];
  }
};
