import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";

// currently blocked by cloudflare
const WEBSITE = "Indeed";
const SITE_URL =
  "https://www.indeed.com/jobs?q=software+engineer&l=austin%2C+tx&fromage=1&sc=0kf%3Aattr%286M28R%7C6XQ9P%7C84K74%7CFGY89%7CJB2WC%7CWD7PP%7CX62BT%7CY7U37%252COR%29%3B&vjk=750a4de96f4a9e32";

export const scrapeIndeed = async () => {
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.use(StealthPlugin()).launch({
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(SITE_URL, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("body", { timeout: 60000 });
    // await page.screenshot({
    //   path: `${new Date()}.png`,
    //   fullPage: true,
    // });

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    const jobs: { title: string; url: string; description: string }[] =
      await page.evaluate(() => {
        console.log("evaluating ");
        const jobElements = Array.from(
          document.querySelectorAll("a.jcs-JobTitle"),
        );

        return jobElements.map((element) => {
          console.log(element);
          const anchor = element as HTMLAnchorElement;
          return {
            title: element.textContent ? element.textContent.trim() : "",
            url: "https://www.indeed.com" + anchor.href,
            description: "",
          };
        });
      });
    console.log("Indeed jobs", jobs);
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
