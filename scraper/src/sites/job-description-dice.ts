import { Browser } from "puppeteer";
import { Job } from "../util/types";

export const jobDescriptionDice = async (
  browser: Browser,
  newJobs: Job[],
) => {
  const newJobsCopy = newJobs.slice();
  for (const newJob of newJobsCopy) {
    console.info(`Fetching job description for ${newJob.title}`);
    try {
      const page = await browser.newPage();
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
    } catch (error) {
      throw new Error(`issue fetching job description: ${error}`);
    }
  }
  return newJobsCopy;
};
