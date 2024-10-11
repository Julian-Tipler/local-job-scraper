import { Browser } from "puppeteer";
import { Job } from "../util/types";

export const jobDescriptionMicrosoft = async (
  browser: Browser,
  newJobs: Job[],
) => {
  const newJobsCopy = newJobs.slice();
  for (const newJob of newJobsCopy) {
    console.info(`Fetching job description for ${newJob.title}`);
    try {
      const page = await browser.newPage();
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
  return newJobsCopy;
};
