import cron from "node-cron";
import cheerio from "cheerio";
import { supabase } from "../clients/supabase";

const url =
  "https://www.builtinaustin.com/jobs/remote/dev-engineering?city=Austin&state=Texas&country=USA";

export const setUpChronScrape = () => {
  // Schedule the scrape job to run every 10 minutes (use appropriate cron schedule)
  // cron.schedule("*/10 * * * *", () => {
  cron.schedule("* * * * *", () => {
    console.log("Scraping BuiltIn");
    scrapeWebsite();
  });

  // Initial call to the scrape function
  scrapeWebsite();
};

const scrapeWebsite = async () => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log(text);

    const $ = cheerio.load(text);
    const jobCards = $('[data-id="job-card"]');

    // Iterate over each job card and extract the text from the <a> tag inside the <h2> tag
    const jobTitles = [];
    jobCards.each((index, element) => {
      const jobTitle = $(element).find("h2 a").text().trim();
      jobTitles.push({ title: jobTitle });
    });

    const { data, error } = await supabase
      .from("jobs")
      .upsert(jobTitles, { onConflict: "title" });
    console.log("data", data);
    console.log("error", error);

    //delete jobs entries with a created_at date older than 2 days
    const { data: deletedData, error: deletedError } = await supabase
      .from("jobs")
      .delete()
      .lt("created_at", new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
    console.log("deletedData", deletedData);
  } catch (error) {
    console.error(`Error scraping the website: ${error.message}`);
  }
};
