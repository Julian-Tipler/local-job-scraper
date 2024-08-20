import puppeteer from "puppeteer-extra";
import { filterExistingJobs } from "../filterExistingJobs";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { handleNewJobs } from "./handle-new-jobs";
import { Browser } from "puppeteer";

const WEBSITE = "Dice";
const URL =
  "https://www.dice.com/jobs?q=software%20engineering&countryCode=US&radius=30&radiusUnit=mi&page=1&pageSize=20&filters.postedDate=ONE&filters.workplaceTypes=Remote&filters.employmentType=FULLTIME&language=en";

export const scrapeDice = async () => {
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.use(StealthPlugin()).launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("a.card-title-link", { timeout: 60000 });
    // page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    const jobs: { title: string; url: string; description: string }[] =
      await page.evaluate(() => {
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

    const newJobs = await filterExistingJobs(jobs, WEBSITE);
    for (const job of newJobs) {
      console.info(`Fetching job description for ${job.title}`);
      try {
        await page.goto(job.url, { waitUntil: "domcontentloaded" });

        const number = Math.floor(Math.random() * 1000) + 1;
        await new Promise((resolve) => setTimeout(resolve, 1000 + number));
        // await page.screenshot({
        //   path: `${new Date()}.png`,
        //   fullPage: true,
        // });

        const jobDescriptionHtml: any = await page.evaluate(() => {
          const jobDescElement = document.querySelector(
            "#jobDescription",
          );
          return jobDescElement ? jobDescElement.innerHTML : "";
        });
        if (jobDescriptionHtml) {
          // Replace certain HTML tags with line breaks
          const jobDescription = jobDescriptionHtml
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<\/?[^>]+(>|$)/g, "") // Remove remaining HTML tags
            .trim();
          job.description = jobDescription;
        }
        // Add job description to the job object
      } catch (jobError) {
        console.error(
          `Error fetching job description for ${job.title}: ${jobError.message}`,
        );
      }
    }
    console.log("New Jobs:", newJobs);
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
