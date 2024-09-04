import puppeteer from "puppeteer-extra";
import { filterExistingJobs } from "../helpers/filter-existing-jobs";
import { Browser } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Job } from "../util/types";
import { saveNewJobsToSupabase } from "../helpers/save-new-jobs-to-supabase";

const WEBSITE = "Dice";
const SITE_URL =
  "https://www.dice.com/jobs?q=software%20engineering&countryCode=US&radius=30&radiusUnit=mi&page=1&pageSize=20&filters.postedDate=ONE&filters.workplaceTypes=Remote&filters.employmentType=FULLTIME&language=en";

export const scrapeDice = async () => {
  console.info("Starting Dice Job 🎲");
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.use(StealthPlugin()).launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(SITE_URL, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("a.card-title-link", { timeout: 60000 });
    // page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    const jobs: Job[] = await page.evaluate(() => {
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
          newJob.description = jobDescription;
        }
        // Add job description to the job object
      } catch (jobError) {
        console.error(
          `Error fetching job description for ${newJob.title}: ${jobError.message}`,
        );
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
