import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 300,
  chunkOverlap: 1,
});

export const createChunks = async (
  content: string
): Promise<{ pageContent: string }[]> => {
  // Replace newline characters with spaces
  const stripped = content.replace(/\n/g, " ");
  const chunks = await splitter.createDocuments([stripped]);

  return chunks;
};
