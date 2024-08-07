import { supabase } from "./clients/supabase.ts";
import { PageData } from "../types/types.ts";
const BATCH_SIZE = 10;

export const sendScrapedPageBatches = async ({
  scrapedPages,
  copilotId,
}: {
  copilotId: string;
  scrapedPages: PageData[];
}) => {
  for (let i = 0; i < scrapedPages.length; i += BATCH_SIZE) {
    const batch = scrapedPages.slice(i, i + BATCH_SIZE);
    await sendBatch({ batch, copilotId });
  }
};

export const sendBatch = async ({
  batch,
  copilotId,
}: {
  batch: PageData[];
  copilotId: string;
}): Promise<void> => {
  console.info(
    "Sending batch of documents:",
    batch.map((doc) => doc.url)
  );

  const response = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/documents`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("KEY")}`, // if required
      },
      body: JSON.stringify({
        documents: batch,
        copilotId,
      }),
      
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Error:", error);
  } else {
    const data = await response.json();
    console.log("Success:", data);
  }
};
