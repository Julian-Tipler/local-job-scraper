import { useEffect, useState } from "react";
import { Job as JobType } from "../utils/types";
import { openai } from "../utils/clients/openai";

export const Job = ({ job }: { job: JobType }) => {
  const [keyWords, setKeyWords] = useState<string[]>([]);

  useEffect(() => {
    const fetchKeyWords = async () => {
      try {
        const prompt = `Extract any programming languages or technologies mentioned in this job description. Only return the programming languages or technologies and no other words: "${job.description}"`;
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-0125", // Use the appropriate GPT model
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
        });
        const extractedKeyWords = completion?.choices?.[0]?.message?.content;
        if (!extractedKeyWords) {
          console.error("No keywords extracted from OpenAI");
          return;
        }
        const trimmedKeyWords = extractedKeyWords
          .trim()
          .split(",")
          .map((word: string) => word.trim());

        setKeyWords(trimmedKeyWords);
      } catch (error) {
        console.error("Error fetching keywords from OpenAI:", error);
      }
    };

    fetchKeyWords();
  }, [job.description]);

  const formattedDescription = job.description
    .split("\n")
    .map((line, index) => <p key={`paragraph-${index}`}>{line}</p>);

  return (
    <div className="flex flex-col h-full">
      <h1 className="px-4 ">{job.title}</h1>
      <h1>Key words:</h1>
      <div>{keyWords}</div>
      <a
        className={"text-blue-500"}
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Job Url
      </a>
      <div className="description-container p-4 flex-1 flex flex-col gap-2 overflow-y-auto">
        {formattedDescription}
      </div>
    </div>
  );
};
