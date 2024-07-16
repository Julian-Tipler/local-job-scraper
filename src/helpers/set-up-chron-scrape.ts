import cron from "node-cron";
import { supabase } from "../clients/supabase";
import dotenv from "dotenv";
import { scrapeBuiltIn } from "./scrape-built-in";
import { scrapeDice } from "./scrape-dice";
import { handleData } from "./handle-data";
import { scrapeIndeed } from "./scrape-indeed";
dotenv.config();

export const setUpChronScrape = async () => {
  // Schedule the BuiltIn scrape job to run every minute
  cron.schedule("* * * * *", () => {
    scrapeBuiltInData();
  });

  // Schedule the Dice scrape job to run every 10 minutes
  cron.schedule("*/10 * * * *", () => {
    scrapeDiceData();
  });

  cron.schedule("*/10 * * * *", () => {
    scrapeIndeedData();
  });

  // Initial calls to the scrape functions
  scrapeBuiltInData();
  scrapeDiceData();
  scrapeIndeedData();

  await supabase
    .from("jobs")
    .delete()
    .lt("created_at", new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
};

const scrapeBuiltInData = async () => {
  console.info("Starting BuiltIn Job 🚧");

  const jobs = await scrapeBuiltIn();
  handleData(jobs, "BuiltIn");
};

const scrapeDiceData = async () => {
  console.info("Starting Dice Job 🎲");

  const jobs = await scrapeDice();
  handleData(jobs, "Dice");
};

const scrapeIndeedData = async () => {
  console.info("Starting Indeed Job 🎩");
  const jobs = await scrapeIndeed();
  handleData(jobs, "Indeed");
};
