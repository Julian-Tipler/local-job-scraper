import cron from "node-cron";
import cheerio from "cheerio";
import { supabase } from "../clients/supabase";
import dotenv from "dotenv";
dotenv.config();

const URL =
  "https://www.builtinaustin.com/jobs/remote/dev-engineering?city=Austin&state=Texas&country=USA";

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
  try {
    const response = await fetch(URL);
    const text = await response.text();

    const $ = cheerio.load(text);
    const jobCards = $('[data-id="job-card"]');

    // Iterate over each job card and extract the text from the <a> tag inside the <h2> tag
    const jobTitles = [];
    jobCards.each((index, element) => {
      const jobTitle = $(element).find("h2 a").text().trim();
      jobTitles.push({ title: jobTitle });
    });

    insertData(jobTitles);

    //delete jobs entries with a created_at date older than 2 days
    const { data: deletedData } = await supabase
      .from("jobs")
      .delete()
      .lt("created_at", new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
    console.log("deletedData", deletedData);
  } catch (error) {
    console.error(`Error scraping the website: ${error.message}`);
  }
};

const insertData = async (jobTitles: any) => {
  const { data: existingTitlesData } = await supabase
    .from("jobs")
    .select("title");

  const existingTitlesSet = new Set(existingTitlesData.map((job) => job.title));

  const newJobTitles = jobTitles.filter((job) =>
    !existingTitlesSet.has(job.title)
  );

  if (newJobTitles.length > 0) {
    await supabase
      .from("jobs")
      .insert(newJobTitles)
      .select("*");

    supabase.functions.invoke("jobs");
  }
};
