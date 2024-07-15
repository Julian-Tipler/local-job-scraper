import cron from "node-cron";
import { supabase } from "../clients/supabase";
import dotenv from "dotenv";
import { scrapeBuiltIn } from "./scrape-built-in";
import { scrapeDice } from "./scrape-dice";
import { handleData } from "./handle-data";
dotenv.config();

export const setUpChronScrape = () => {
  // Schedule the scrape job to run every 10 minutes (use appropriate cron schedule)
  // cron.schedule("*/10 * * * *", () => {
  cron.schedule("* * * * *", () => {
    scrapeWebsite();
  });

  // Initial call to the scrape function
  scrapeWebsite();
};

const scrapeWebsite = async () => {
  console.info("scraping");

  const jobs = await Promise.all([scrapeBuiltIn(), scrapeDice()]);

  // Flatten the array of arrays
  const flattenedJobs: { title: string; url: string }[] = jobs.flat();

  handleData(flattenedJobs);
  //delete jobs entries with a created_at date older than 2 days
  const { data: deletedData } = await supabase
    .from("jobs")
    .delete()
    .lt("created_at", new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
  console.log("deletedData", deletedData);
};
