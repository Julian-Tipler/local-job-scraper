import puppeteer from "puppeteer-extra";
import { Browser } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Job } from "../util/types";

const WEBSITE = "Dice";
const SITE_URL =
  "https://www.dice.com/jobs?q=software%20engineering&countryCode=US&radius=30&radiusUnit=mi&page=1&pageSize=20&filters.postedDate=ONE&filters.workplaceTypes=Remote&filters.employmentType=FULLTIME&language=en";

export const scrapeDice = async (browser: Browser) => {
  console.info("Starting Dice Job 🎲");
  try {
    browser = await puppeteer.use(StealthPlugin()).launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(SITE_URL, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("a.card-title-link", { timeout: 60000 });
    // page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    const newJobs: Job[] = await page.evaluate(() => {
      const jobElements = Array.from(
        document.querySelectorAll("a.card-title-link"),
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
    if (newJobs.length > 0) {
      console.info(`Fetched ${WEBSITE} jobs index successfully`);
    } else {
      console.info(`No jobs found on ${WEBSITE}`);
    }
    return newJobs;
  } catch (error) {
    console.error(`Error scraping ${WEBSITE}: ${error.message}`);

    return [];
  }
};
