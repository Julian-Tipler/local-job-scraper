import cron from "node-cron";
import cheerio from "cheerio";

const url =
  "https://www.builtinaustin.com/jobs/remote/dev-engineering?city=Austin&state=Texas&country=USA";

export const setUpChronScrape = () => {
  const scrapeWebsite = async () => {
    try {
      const response = await fetch(url);
      const text = await response.text();

      const $ = cheerio.load(text);
      const jobCards = $('[data-id="job-card"]');

      // Iterate over each job card and extract the text from the <a> tag inside the <h2> tag
      jobCards.each((index, element) => {
        const jobTitle = $(element).find("h2 a").text().trim();
        console.log(jobTitle);
      });

      // Example: Extracting the title of the page
      const title = $("title").text();
      console.log(`Title of the page is: ${title}`);

      // Add more scraping logic here as per your requirements
    } catch (error) {
      console.error(`Error scraping the website: ${error.message}`);
    }
  };

  // Schedule the scrape job to run every minute (use appropriate cron schedule)
  cron.schedule("* * * * *", () => {
    console.log("Scraping BuiltIn");
    scrapeWebsite();
  });

  // Initial call to the scrape function
  scrapeWebsite();
};

