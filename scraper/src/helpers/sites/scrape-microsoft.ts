import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";
import { Job } from "../../util/types";
import { filterExistingJobs } from "../filterExistingJobs";

const WEBSITE = "Microsoft";
const SITE_URL =
  "https://jobs.careers.microsoft.com/global/en/search?q=software%20engineer&lc=United%20States&l=en_us&pg=1&pgSz=20&o=Relevance&flt=true";

export const scrapeMicrosoft = async () => {
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.use(StealthPlugin()).launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(SITE_URL, { waitUntil: "networkidle2", timeout: 20000 });
    await page.waitForSelector('[aria-label="job list"]', { timeout: 20000 });
    await page.screenshot({
      path: `${new Date()}.png`,
      fullPage: true,
    });

    const jobs: Job[] = await page.evaluate(() => {
      const jobCards = Array.from(
        document.querySelectorAll('[aria-label*="Job item"]'),
      );

      return jobCards.map((jobCard) => {
        const ariaLabel = jobCard.getAttribute("aria-label");
        if (!ariaLabel) throw new Error("No aria-label found");
        const jobIdMatch = ariaLabel.match(/Job item (\d+)/);
        if (!jobIdMatch) throw new Error("No aria-label found");

        const childDiv = jobCard.querySelector("div"); // Select the first child div
        if (childDiv) {
          const secondChildDiv = childDiv.children[1]; // Select the second child div
          if (secondChildDiv) {
            return {
              title: secondChildDiv.textContent
                ? secondChildDiv.textContent.trim()
                : "",
              url: "https://jobs.careers.microsoft.com/global/en/job/" +
                jobIdMatch[1],
              description: "",
            };
          }
        } else {
          throw new Error("Issue scraping microsoft");
        }
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

        const number = Math.floor(Math.random() * 1000) + 1;
        await new Promise((resolve) => setTimeout(resolve, 1000 + number));

        const overviewHeader = Array.from(document.querySelectorAll("h3")).find(
          (header) => header?.textContent?.trim() === "Overview",
        );

        if (overviewHeader) {
          const nextSibling = overviewHeader.nextElementSibling;
          if (nextSibling) {
            const jobDescription = nextSibling.textContent
              ? nextSibling.textContent.trim()
              : "";
            newJob.description = jobDescription;
            return;
          }
        }
        throw new Error();
      } catch {
        throw new Error("issue fetching job description");
      }
    }
  } catch (error) {
    console.error(`Error scraping the website: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
scrapeMicrosoft();
