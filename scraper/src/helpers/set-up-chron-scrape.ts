import cron from "node-cron";
import { supabase } from "../clients/supabase";
import dotenv from "dotenv";
import { scrapeBuiltIn } from "../sites/scrape-built-in";
import { scrapeDice } from "../sites/scrape-dice";
import { scrapeCareerBuilder } from "../sites/scrape-career-builder";
import { scrapeMicrosoft } from "../sites/scrape-microsoft";
dotenv.config();

export const setUpChronScrape = async () => {
  // Schedule the BuiltIn scrape job to run every minute
  cron.schedule("* * * * *", async () => {
    await scrapeBuiltInData();
  });

  // Schedule the Dice scrape job to run every 10 minutes
  cron.schedule("*/5 * * * *", async () => {
    await scrapeDiceData();

    // Blocked by Cloudflare atm
    // scrapeIndeedData();
  });
  cron.schedule("*/10 * * * *", async () => {
    await scrapeMicrosoftData();
    // scrapeCareerBuilderData();
  });

  // Initial calls to the scrape functions
  await scrapeMicrosoftData();
  await scrapeBuiltInData();
  await scrapeDiceData();
  // await scrapeCareerBuilderData();

  await supabase
    .from("jobs")
    .delete()
    .lt("created_at", new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
};

const scrapeBuiltInData = async () => {
  console.info("Starting BuiltIn Job 🚧");
  try {
    await scrapeBuiltIn();
  } catch (error) {
    console.error("Caught error scraping BuiltIn: ", error);
  }
};

const scrapeDiceData = async () => {
  console.info("Starting Dice Job 🎲");
  try {
    await scrapeDice();
  } catch (error) {
    console.error("Caught error scraping Dice: ", error);
  }
};

const scrapeMicrosoftData = async () => {
  console.info("Starting Microsoft Job 💾");
  try {
    await scrapeMicrosoft();
  } catch (error) {
    console.error("Caught error scraping Dice: ", error);
  }
};

const scrapeCareerBuilderData = async () => {
  console.info("Starting Career Builder Job 🏗");
  try {
    await scrapeCareerBuilder();
  } catch (error) {
    console.error("Caught error scraping Career Builder: ", error);
  }
};

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
