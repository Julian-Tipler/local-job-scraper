import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";
import { Job } from "../util/types";
import { handleNewJobs } from "./handle-new-jobs";
import { filterExistingJobs } from "../helpers/filterExistingJobs";

const WEBSITE = "<website name here>";
const SITE_URL = "<insert url here>";

export const scrapeTemplate = async (fetchIndex, fetchJobDescriptions) => {
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.use(StealthPlugin()).launch({
      headless: true,
    });
    // visit job index page

    const jobs = await fetchIndex(browser);
    const newJobs = await filterExistingJobs(jobs, WEBSITE);
    const newJobsWithDescription = await fetchJobDescriptions(browser, newJobs);

    handleNewJobs(newJobs, WEBSITE);
  } catch (error) {
    console.error(`Error scraping the website: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const fetchIndex = async (browser: Browser) => {
  const page = await browser.newPage();
  await page.goto(SITE_URL, { waitUntil: "networkidle2", timeout: 20000 });
  await page.waitForSelector("body", { timeout: 20000 });

  const jobs: Job[] = await page.evaluate(() => {
    const jobCards = Array.from(
      document.querySelectorAll("<query selector here>"),
    );
    return jobCards.map((jobCard) => {
      const title = jobCard.querySelector("<query selector here>");
      if (!title) throw new Error("No title found");
      const url = jobCard.querySelector("a[href]") as HTMLAnchorElement;
      if (!url) throw new Error("No url found");

      return {
        title: title.textContent ? title.textContent.trim() : "",
        url: url.href,
        description: "",
      };
    });
  });

  if (jobs.length > 0) {
    console.info(`Fetched ${WEBSITE} jobs index successfully`);
  } else {
    console.info(`No jobs found on ${WEBSITE}`);
  }
  return jobs;
};

export const fetchJobDescriptions = async (
  browser: Browser,
  newJobs: Job[],
) => {
  const page = await browser.newPage();
  for (const newJob of newJobs) {
    try {
      await page.goto(newJob.url, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("<selector here>", { timeout: 20000 });

      const jobDescriptionHtml: any = await page.evaluate(() => {
        const jobDescription = document.querySelector(
          "<selector here>",
        );
        console.log("overviewHeader", jobDescription);

        return jobDescription ? jobDescription.innerHTML : "";
      });
      if (jobDescriptionHtml) {
        // Replace certain HTML tags with line breaks
        const jobDescription = jobDescriptionHtml
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n\n")
          .replace(/<\/?[^>]+(>|$)/g, "") // Remove remaining HTML tags
          .trim();
        newJob.description = jobDescription;
      } else {
        throw new Error("No job description found");
      }
    } catch (error) {
      throw new Error(`issue fetching job description: ${error}`);
    }
  }
  return newJobs;
};
