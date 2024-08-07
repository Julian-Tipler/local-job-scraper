import cheerio from "cheerio";
import { supabase } from "../../clients/supabase";
import { filterExistingJobs } from "../filterExistingJobs";
import { notify } from "../notify";
import { handleNewJobs } from "./handle-new-jobs";

const WEBSITE = "BuiltIn";
const URL =
  "https://www.builtinaustin.com/jobs/remote/dev-engineering?city=Austin&state=Texas&country=USA";

export const scrapeBuiltIn = async () => {
  try {
    const response = await fetch(URL);
    const text = await response.text();

    const $ = cheerio.load(text);
    const jobCards = $('[data-id="job-card"]');

    // Iterate over each job card and extract the text from the <a> tag inside the <h2> tag
    const jobs: { title: string; url: string; description: string }[] = [];
    jobCards.each((index, element) => {
      const job = $(element).find("h2 a");
      const jobTitle = job.text().trim();
      jobs.push({
        title: jobTitle,
        url: `https://www.builtinaustin.com${job.attr("href")}`,
        description: "",
      });
    });

    const newJobs = await filterExistingJobs(jobs, WEBSITE);

    // Fetch the descriptions for each page
    if (newJobs.length > 0) {
      for (const job of newJobs) {
        try {
          const jobResponse = await fetch(job.url);
          const jobText = await jobResponse.text();
          const $$ = cheerio.load(jobText);
          const jobDescription = $$(".job-description").text().trim();

          // Add job description to the job object
          job.description = jobDescription;
        } catch (jobError) {
          console.error(
            `Error fetching job description for ${job.title}: ${jobError.message}`,
          );
        }
      }
    }

    handleNewJobs(newJobs, WEBSITE);
  } catch (error) {
    console.error(`Error scraping the website: ${error.message}`);
  }
};
