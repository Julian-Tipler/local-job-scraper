import { Browser } from "puppeteer";
import { Job } from "../util/types";

export const jobDescriptionBuiltIn = async (
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

      await page.waitForSelector(".job-post-item", { timeout: 5000 });
      const jobDescriptionHtml = await page.evaluate(() => {
        const jobPostItem = document.querySelector(".job-post-item");
        if (jobPostItem) {
          const roleElement = Array.from(jobPostItem.querySelectorAll("*"))
            .find((el) => el.textContent?.trim() === "The Role");
          if (roleElement) {
            const nextSiblingDiv = roleElement.nextElementSibling;
            if (
              nextSiblingDiv &&
              nextSiblingDiv.tagName.toLowerCase() === "div"
            ) {
              return nextSiblingDiv.innerHTML;
            }
          }
        }
        return "";
      });
      if (!jobDescriptionHtml) {
        throw new Error("Job description not found");
      }
      // Replace certain HTML tags with line breaks
      const jobDescription = jobDescriptionHtml
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<\/?[^>]+(>|$)/g, "") // Remove remaining HTML tags
        .trim();
      newJob.description = jobDescription;

      // Add job description to the job object
    } catch (jobError) {
      console.error(
        `Error fetching job description for ${newJob.title}: ${jobError.message}`,
      );
      throw new Error(`issue fetching job description: ${jobError}`);
    }
  }
  return newJobsCopy;
};
