import puppeteer from "puppeteer";

const URL =
  "https://www.dice.com/jobs?q=software%20engineering&countryCode=US&radius=30&radiusUnit=mi&page=1&pageSize=20&filters.postedDate=ONE&filters.workplaceTypes=Remote&filters.employmentType=FULLTIME&language=en";

export const scrapeDice = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
      // dumpio: true,
    });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("a.card-title-link", { timeout: 60000 });
    await page.screenshot({ path: "dice_page.png", fullPage: true });

    // for debugging
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    const jobs: { title: string; url: string }[] = await page.evaluate(() => {
      const jobElements = Array.from(
        document.querySelectorAll("a.card-title-link"),
      );

      return jobElements.map((element) => {
        const anchor = element as HTMLAnchorElement;
        return {
          title: element.textContent ? element.textContent.trim() : "",
          url: "https://www.dice.com/job-detail/" + anchor.id,
        };
      });
    });
    return jobs;
  } catch (error) {
    console.error(`Error scraping the website: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
