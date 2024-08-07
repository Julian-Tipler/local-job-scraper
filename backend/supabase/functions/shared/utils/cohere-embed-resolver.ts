
type Res = {
  responseType: string;
  id: string;
  texts: string[];
  embeddings: number[][];
};

const COHERE_API_KEY = Deno.env.get("COHERE_API_KEY");

export const cohereEmbedResolver = async ({ texts }: { texts: string[] }) => {
  try {
    const response = await fetch("https://api.cohere.com/v1/embed", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `bearer ${COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        texts,
        model: "embed-english-v3.0",
        input_type: "classification",
      }),
    });

    const data = await response.json();
    console.log("COHERE EMBEDDING RESPONSE", data);

    if (!data.embeddings || !data.texts) {
      throw "error fetching embeddings from cohere";
    }

    return data.texts.map((text: string, i: number) => ({
      text,
      embedding: data.embeddings[i],
    }));
    // TODO Stripe charge for embeddings
  } catch (error) {
    console.error(error);
    throw error;
  }
};
