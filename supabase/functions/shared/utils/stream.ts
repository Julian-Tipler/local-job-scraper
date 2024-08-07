import { OpenAI } from "https://esm.sh/openai@4.0.0";

/**
 * Processes Server-Sent Events (SSE) chunks by parsing and handling each individual chunk.
 *
 * @param {Uint8Array} value - The binary data containing SSE chunks.
 * @returns {OpenAI.Chat.ChatCompletion[] | undefined}
 */
export const processChunks = (value: Uint8Array) => {
  const results: OpenAI.Chat.ChatCompletion[] = [];
  try {
    // Assuming 'value' is a Uint8Array
    const rawData = new TextDecoder().decode(value);

    // Split the data into individual chunks based on the SSE format
    const chunks = rawData.split(/\n\n/);

    // Process each chunk
    chunks.forEach((chunk) => {
      if (chunk.trim() !== "" && !chunk.includes("[DONE]")) {
        // Remove the "data: " prefix
        const jsonData = chunk.replace("data:", "");

        // Now 'jsonData' contains the JSON-encoded string without the prefix
        const jsonObject = JSON.parse(jsonData);
        results.push(jsonObject);
      }
    });
  } catch (error) {
    console.error("Error processing chunks:", error);
    throw error;
  }

  return results;
};
