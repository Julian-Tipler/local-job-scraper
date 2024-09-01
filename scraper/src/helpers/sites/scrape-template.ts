import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";
import { Job } from "../../util/types";

const WEBSITE = "<website name here>";
const SITE_URL = "<insert url here>";

export const scrapeTemplate = async () => {
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.use(StealthPlugin()).launch({
      headless: true,
    });
    // visit job index page
    const page = await browser.newPage();
    await page.goto(SITE_URL, { waitUntil: "networkidle2", timeout: 20000 });
    await page.waitForSelector("body", { timeout: 20000 });

    const jobs: Job[] = await page.evaluate(() => {
      const jobElements = Array.from(
        document.querySelectorAll("<insert selector here>"),
      );

      return jobElements.map((element) => {
        const anchor = element as HTMLAnchorElement;
        return {
          title: element.textContent ? element.textContent.trim() : "",
          url: "https://www.dice.com/job-detail/" + anchor.id,
          description: "",
        };
      });
    });
    if (jobs.length > 0) {
      console.info(`Fetched ${WEBSITE} jobs index successfully`);
    } else {
      console.info(`No jobs found on ${WEBSITE}`);
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
