import dotenv from "dotenv";
dotenv.config();
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
        const childDiv = jobCard.querySelector("div"); // Select the first child div
        if (!childDiv) throw new Error("No child div found");
        const secondChildDiv = childDiv.children[1]; // Select the second child div
        if (!secondChildDiv) throw new Error("No second child div found");
        return {
          title: secondChildDiv.textContent
            ? secondChildDiv.textContent.trim()
            : "",
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

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    for (const newJob of newJobs) {
      console.info(`Fetching job description for ${newJob.title}`);
      try {
        await page.goto(newJob.url, { waitUntil: "domcontentloaded" });
        console.log("--- NEW JOB URL", newJob.url);
        await page.waitForSelector(".SearchJobDetailsCard", { timeout: 20000 });

        const number = Math.floor(Math.random() * 1000) + 1;
        await page.screenshot({
          path: `${new Date()}.png`,
          fullPage: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 3000 + number));
        const jobDescriptionHtml: any = await page.evaluate(() => {
          const overviewHeader = Array.from(document.querySelectorAll("h3"))
            .find(
              (header) => header?.textContent?.trim() === "Overview",
            );
          console.log("overviewHeader", overviewHeader);
          if (overviewHeader) {
            const nextSibling = overviewHeader.nextElementSibling;
            return nextSibling ? nextSibling.innerHTML : "";
          }
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
