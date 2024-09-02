import puppeteer from "puppeteer-extra";
import { filterExistingJobs } from "../helpers/filterExistingJobs";
import { handleNewJobs } from "./handle-new-jobs";
import { Browser } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { exec } from "child_process";

const WEBSITE = "Career Builder";
const URL =
  "https://www.careerbuilder.com/jobs?posted=1&radius=30&cb_apply=false&keywords=Software+Engineer&location=&pay=&emp=&cb_veterans=false&cb_workhome=remote";

export const scrapeCareerBuilder = async () => {
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.use(StealthPlugin()).launch({
      headless: false,
      args: [
        "--disable-gpu",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
        "--window-position=-10000,-10000", // Move window far off-screen
        "--window-size=1,1", // Start with a tiny window size
      ],
    });

    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 30000 });
    // await page.screenshot({
    //   path: `${new Date()}.png`,
    //   fullPage: true,
    // });
    await page.waitForSelector("a.data-results-content", { timeout: 30000 });

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    const jobLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a.data-results-content"))
        .map((a) => (a as HTMLAnchorElement).href);
    });
    console.log("jobLinks", jobLinks);

    // Create an array to store job details with descriptions
    const jobs = [];

    // Iterate over each job element to click and fetch description
    // for (const link of jobLinks) {
    //   // Click on the link
    //   await page.goto(link);

    //   // Wait for the dropdown to appear (you might need to adjust the selector based on your actual dropdown)
    //   await page.waitForSelector("div.job-description");

    //   // Extract the description
    //   const description = await page.evaluate(() => {
    //     const descriptionDiv = document.querySelector("div.job-description");
    //     return descriptionDiv
    //       ? descriptionDiv.textContent.trim()
    //       : "No description found";
    //   });

    //   console.log("Job Description:", description);

    //   // Optional: navigate back to the job listings page
    //   // await page.goBack();
    // }
    const newJobs = await filterExistingJobs(jobs, WEBSITE);
    handleNewJobs(newJobs, WEBSITE);
    return newJobs;
  } catch (error) {
    console.error(`Error scraping the website: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};