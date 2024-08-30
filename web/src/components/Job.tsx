import { useEffect, useState } from "react";
import { Job as JobType } from "../utils/types";
import { openai } from "../utils/clients/openai";
import { supabase } from "../clients/supabase";

export const Job = ({ job }: { job: JobType }) => {
  const [keyWords, setKeyWords] = useState<string[]>([]);
  const [userBullets, setUserBullets] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserBullets = async () => {
      const { data, error } = await supabase
        .from("bullets")
        .select("*")
        .in("experienceId", [3, 4]);

      if (error || !data) {
        console.error("Error fetching bullets:", error);
        setError("Error fetching bullets");
        return;
      } else {
        console.log("Fetched bullets:", data);
      }
      setUserBullets(data.map((bullet) => bullet.content));
    };
    fetchUserBullets();
  }, []);

  useEffect(() => {
    if (!userBullets.length) return;
    const fetchKeyWords = async () => {
      try {
        const prompt = `Extract any programming languages, technologies, or other skills (such as CI/CD) mentioned in this job description. 
        In addition to general programming languages and technologies, look for the following key words: ${userBullets.join(", ")} 
        Only return the programming languages or technologies separated by a comma and space and no other words
        Here is the job description: "${job.description}"`;
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
        console.log("Extracted keywords:", extractedKeyWords);
        const trimmedKeyWords = extractedKeyWords
          .split(", ")
          .map((word: string) => word.trim());
        console.log("Trimmed keywords:", trimmedKeyWords);

        setKeyWords(trimmedKeyWords);
      } catch (error) {
        console.error("Error fetching keywords from OpenAI:", error);
      }
    };

    fetchKeyWords();
  }, [job.description, userBullets]);

  const formattedDescription = job.description
    .split("\n")
    .map((line, index) => <p key={`paragraph-${index}`}>{line}</p>);

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="flex flex-col h-full">
      <h1 className="px-4 ">{job.title}</h1>
      <h1>Key words:</h1>
      <div>{keyWords.join(", ")}</div>
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
