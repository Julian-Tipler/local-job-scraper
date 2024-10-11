import dotenv from "dotenv";
dotenv.config();
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";
import { Job } from "../util/types";
import { filterExistingJobs } from "../helpers/filter-existing-jobs";

const WEBSITE = "Microsoft";
const SITE_URL =
  "https://jobs.careers.microsoft.com/global/en/search?q=software%20engineer&lc=United%20States&ws=Up%20to%20100%25%20work%20from%20home&l=en_us&pg=1&pgSz=20&o=Relevance&flt=true";

export const scrapeMicrosoft = async () => {
  console.info("Starting Microsoft Job 💾");

  let browser: Browser | null = null;
  try {
    browser = await puppeteer.use(StealthPlugin()).launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(SITE_URL, { waitUntil: "networkidle2", timeout: 20000 });
    await page.waitForSelector('[aria-label*="Job item"]', { timeout: 20000 });

    const jobs: Job[] = await page.evaluate(() => {
      const jobCards = Array.from(
        document.querySelectorAll('[aria-label*="Job item"]'),
      );

      return jobCards.map((jobCard) => {
        const ariaLabel = jobCard.getAttribute("aria-label");
        if (!ariaLabel) throw new Error("No aria-label found");
        const jobIdMatch = ariaLabel.match(/Job item (\d+)/);
        if (!jobIdMatch) throw new Error("No aria-label found");
        const groupDiv = jobCard.querySelector("div"); // Select the first child div
        if (!groupDiv) throw new Error("No child div found");
        const topHalfCard = groupDiv.children[1]; // Select the second child div
        if (!topHalfCard) throw new Error("No second child div found");
        const title = topHalfCard.querySelector("h2");
        if (!title) throw new Error("No title found");
        return {
          title: title.textContent ? title.textContent.trim() : "",
          url: "https://jobs.careers.microsoft.com/global/en/job/" +
            jobIdMatch[1],
          description: "",
        };
      });
    });
    if (jobs.length > 0) {
      console.info(`Fetched ${WEBSITE} jobs index successfully`);
    } else {
      console.info(`No jobs found on ${WEBSITE}`);
    }

    const newJobs = await filterExistingJobs(jobs, WEBSITE);

    for (const newJob of newJobs) {
      console.info(`Fetching job description for ${newJob.title}`);
      try {
        await page.goto(newJob.url, { waitUntil: "domcontentloaded" });
        await page.waitForSelector(".fcUffXZZoGt8CJQd8GUl", { timeout: 20000 });

        const jobDescriptionHtml: any = await page.evaluate(() => {
          const jobDescription = document.querySelector(
            ".fcUffXZZoGt8CJQd8GUl",
          );

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
  } catch (error) {
    console.error(`Error scraping ${WEBSITE}: ${error.message}`);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
