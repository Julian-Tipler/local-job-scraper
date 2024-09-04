import cron from "node-cron";
import dotenv from "dotenv";
import { scrapeBuiltIn } from "./sites/scrape-built-in";
import { scrapeDice } from "./sites/scrape-dice";
import { scrapeMicrosoft } from "./sites/scrape-microsoft";
import { Job } from "./util/types";
import { saveNewJobsToSupabase } from "./helpers/save-new-jobs-to-supabase";
import { notify } from "./helpers/notify";
import { sortByRelevance } from "./helpers/sort-by-relevance";
dotenv.config();

type ScrapeMap = {
  [key: string]: () => Promise<Job[]>;
};

const SCRAPE_MAP: ScrapeMap = {
  "Microsoft": scrapeMicrosoft,
  "BuiltIn": scrapeBuiltIn,
  "Dice": scrapeDice,
};

export const setUpChronScrape = async () => {
  cron.schedule("*/5 * * * *", async () => {
  });

  await complete(Object.keys(SCRAPE_MAP));
};

export const complete = async (companies: string[]) => {
  try {
    const allNewJobs = {};
    for (const company of companies) {
      try {
        const scrape = SCRAPE_MAP[company];
        const newJobs = await scrape();
        const sortedNewJobs = await sortByRelevance(newJobs);
        const savedJobs = await saveNewJobsToSupabase(sortedNewJobs);
        if (savedJobs.length > 0) {
          allNewJobs[company] = savedJobs;
        }
      } catch (error) {
        console.error(`Error with ${company}:`, error);
      }
    }
    notify(allNewJobs);
  } catch (error) {
    console.error("General error in complete function:", error);
  }
};
