import { supabase } from "./clients/supabase.ts";

const jigsawApiKey = Deno.env.get("JIGSAW_API_KEY");
const MAX_CONCURRENT_REQUESTS = 5;

const visitedURLs: Set<string> = new Set();
export interface PageData {
  url: string;
  content: string;
}

export async function scrapeWebsite({
  url,
  maxPages = 10,
}: {
  url: string;
  maxPages?: number;
}) {
  try {
    const { scrapedPages } = await jigsawCrawl({
      url,
      maxPages,
    });

    // throw new Error("Issue scraping website");

    return {
      maxPagesReached: scrapedPages.length >= maxPages,
      scrapedPages: scrapedPages,
    };
  } catch (error) {
    console.error("Issue scraping website", error);
    throw error("Issue scraping website");
  }
}

async function jigsawCrawl({
  url,
  maxPages,
}: {
  url: string;
  maxPages: number;
}): Promise<{ scrapedPages: PageData[] }> {
  if (!jigsawApiKey) {
    throw new Error("Missing environment variable JIGSAW_API_KEY");
  }
  const queue: string[] = [url];
  const scrapedPages: PageData[] = [];

  while (queue.length > 0) {
    console.info(scrapedPages.length);
    // Stop crawling if we've reached the maximum number of pages
    if (scrapedPages.length >= maxPages) {
      console.warn(`${url}: Scraped maximum number of pages`);
      break;
    }

    // Grab first 5 urls we haven't visited yet
    const urlsToFetch: string[] = [];
    while (urlsToFetch.length < MAX_CONCURRENT_REQUESTS && queue.length > 0) {
      const shiftedUrl = queue.shift();
      if (
        shiftedUrl &&
        !visitedURLs.has(shiftedUrl) &&
        !urlsToFetch.includes(shiftedUrl)
      ) {
        urlsToFetch.push(shiftedUrl);
      }
    }

    type htmlPacket = {
      html: string;
      currentUrl: string;
    };

    const htmlBatch: htmlPacket[] = [];

    // Hit the jibsaw API up to 5x at the same time
    await Promise.all(
      urlsToFetch.map(async (currentUrl) => {
        visitedURLs.add(currentUrl);
        const { data } = await fetchPage(currentUrl);
        // Extract links from the page
        const html = data[0]?.results
          ?.map((result: any) => result.html)
          .join("");

        if (!html) {
          console.info("No html found for", currentUrl);
          return;
        }
        htmlBatch.push({ html, currentUrl });
        // Adds raw text to the results

        const text = data[0]?.results
          ?.map((result: any) => result.text)
          .join("");

        if (!text) {
          console.info("No text found for", currentUrl);
          return;
        }
        scrapedPages.push({
          url: currentUrl,
          content: text,
        });
      })
    );
    const { data: links, error } = await supabase.functions.invoke(
      "documents/extract-links",
      {
        body: {
          htmlBatch,
          baseUrl: url,
        },
      }
    );
    if (error) {
      console.error("Error extracting links", error);
      throw error("Error extracting links");
    }

    const newLinks = links.filter((link: string) => !visitedURLs.has(link));
    queue.push(...newLinks);
  }

  return { scrapedPages };
}

async function fetchPage(currentUrl: string): Promise<any> {
  if (!jigsawApiKey) {
    throw new Error("Missing environment variable JIGSAW_API_KEY");
  }
  visitedURLs.add(currentUrl);
  const res = await fetch("https://api.jigsawstack.com/v1/web/scrape", {
    body: JSON.stringify({
      url: currentUrl,
      elements: [
        {
          selector: "div, p, h1, h2, h3, h4, h5, h6, li, span, a, td, th",
        },
      ],
      reject_request_pattern: [
        "jpg",
        "png",
        "jpeg",
        "gif",
        "svg",
        "script",
        "style",
        "head",
        "meta",
      ],
    }),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": jigsawApiKey,
    },
    method: "POST",
  });
  return res.json();
}
