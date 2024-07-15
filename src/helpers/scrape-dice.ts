import puppeteer from "puppeteer";

const URL =
  "https://www.dice.com/jobs?countryCode=US&radius=30&radiusUnit=mi&page=1&pageSize=20&filters.postedDate=ONE&filters.workplaceTypes=Remote&filters.employmentType=FULLTIME&language=en";

export const scrapeDice = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
      // dumpio: true,
    });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("body", { timeout: 30000 });
    const jobText = await page.evaluate(() => {
      const body = document.querySelector("body");
      if (!body) return [];

      const titles = Array.from(
        body.querySelectorAll("a.card-title-link"),
      ).map((element) => element.textContent.trim());

      return titles;
    });
    const jobs = jobText.map((title) => ({ title, url: URL }));
    return jobs;
  } catch (error) {
    console.error(`Error scraping the website: ${error.message}`);
  }
};
