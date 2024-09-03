import cron from "node-cron";
import { supabase } from "../clients/supabase";
import dotenv from "dotenv";
import { scrapeBuiltIn } from "../sites/scrape-built-in";
import { scrapeDice } from "../sites/scrape-dice";
import { scrapeMicrosoft } from "../sites/scrape-microsoft";
import { Job } from "../util/types";
import { saveNewJobsToSupabase } from "../sites/save-new-jobs-to-supabase";
import { notify } from "./notify";
dotenv.config();

export const setUpChronScrape = async () => {
  cron.schedule("*/5 * * * *", async () => {
    const builtinJobs = await scrapeBuiltIn();
    const diceJobs = await scrapeDice();
    const newJobsAllCompanies = {
      "BuiltIn": builtinJobs,
      "Dice": diceJobs,
    };

    notify(newJobsAllCompanies);

    // Blocked by Cloudflare atm
    // scrapeIndeedData();
  });
  cron.schedule("*/30 * * * *", async () => {
    const microsoftJobs = await scrapeMicrosoft();
    const newJobsAllCompanies = {
      "Microsoft": microsoftJobs,
    };
    await notify(newJobsAllCompanies);

    await supabase
      .from("jobs")
      .delete()
      .lt("created_at", new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
  });

  // Initial calls to the scrape functions

  const microsoftJobs = await scrapeMicrosoft();
  const builtinJobs = await scrapeBuiltIn();
  const diceJobs = await scrapeDice();
  const newJobsAllCompanies = {
    "Microsoft": microsoftJobs,
    "BuiltIn": builtinJobs,
    "Dice": diceJobs,
  };

  notify(newJobsAllCompanies);
};

// const scrapeCareerBuilderData = async () => {
//   console.info("Starting Career Builder Job 🏗");
//   try {
//     await scrapeCareerBuilder();
//   } catch (error) {
//     console.error("Caught error scraping Career Builder: ", error);
//   }
// };

// const scrapeIndeedData = async () => {
//   console.info("Starting Indeed Job 🎩");
//   try {
//     const jobs = await scrapeIndeed();
//     if (!jobs) {
//       console.error("No jobs found from Indeed");
//       return;
//     }
//     await handleData(jobs, "Indeed");
//   } catch (error) {
//     console.error("Error scraping Indeed: ", error);
//   }
// };
