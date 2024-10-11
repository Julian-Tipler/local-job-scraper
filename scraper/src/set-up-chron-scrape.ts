import cron from "node-cron";
import dotenv from "dotenv";
import { scrapeMicrosoft } from "./sites/scrape-microsoft";
import { Job } from "./util/types";
import { saveNewJobsToSupabase } from "./helpers/save-new-jobs-to-supabase";
import { notify } from "./helpers/notify";
import { sortByRelevance } from "./helpers/sort-by-relevance";
import { filterExistingJobs } from "./helpers/filter-existing-jobs";
import { Browser } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { jobDescriptionMicrosoft } from "./sites/job-description-microsoft";
import { scrapeBuiltIn } from "./sites/scrape-built-in";
import { jobDescriptionBuiltIn } from "./sites/job-description-built-in";
import { scrapeDice } from "./sites/scrape-dice";
import { jobDescriptionDice } from "./sites/job-description-dice";
dotenv.config();

type ScrapeMap = {
  [key: string]: {
    scrape: (browser: Browser) => Promise<Job[]>;
    description: (browser: Browser, newJobs: Job[]) => Promise<Job[]>;
  };
};

const activeCompanies = new Set<string>();
const SCRAPE_MAP: ScrapeMap = {
  "Microsoft": {
    scrape: scrapeMicrosoft,
    description: jobDescriptionMicrosoft,
  },
  "BuiltIn": { scrape: scrapeBuiltIn, description: jobDescriptionBuiltIn },
  "Dice": {
    scrape: scrapeDice,
    description: jobDescriptionDice,
  },
};

export const setUpChronScrape = async () => {
  cron.schedule("* * * * *", async () => {
    // cron.schedule("*/5 * * * *", async () => {
    console.info("Running cron job");
    await complete(Object.keys(SCRAPE_MAP));
  });

  await complete(Object.keys(SCRAPE_MAP));
};

export const complete = async (companies: string[]) => {
  try {
    const allNewJobs = {};
    for (const company of companies) {
      if (activeCompanies.has(company)) {
        console.log(`${company} is currently being scraped, skipping...`);
        continue;
      }

      let browser: Browser | null = null;

      try {
        browser = await puppeteer.use(StealthPlugin()).launch({
          headless: true,
        });
        activeCompanies.add(company);

        const { scrape, description } = SCRAPE_MAP[company];

        const recentJobs = await scrape(browser);
        const newJobs = await filterExistingJobs(recentJobs, company);
        const newJobsWithDescription = await description(browser, newJobs);
        const sortedNewJobs = await sortByRelevance(newJobsWithDescription);

        const savedJobs = await saveNewJobsToSupabase(sortedNewJobs);
        allNewJobs[company] = savedJobs;
      } catch (error) {
        console.error(`Error with ${company}:`, error);
      } finally {
        if (browser) {
          await browser.close();
        }
        activeCompanies.delete(company);
      }
    }
    // notify(allNewJobs);
  } catch (error) {
    console.error("General error in complete function:", error);
  }
};
