import { useEffect, useState } from "react";
import { Job as JobType } from "../utils/types";
import { supabase } from "../clients/supabase";

export const Job = ({ job }: { job: JobType }) => {
  const [keyWords, setKeyWords] = useState<string[]>([]);

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
      const userBullets = data.map((bullet) => bullet.content);
      const parsedKeyWords = userBullets.filter((bullet) =>
        job.description.includes(bullet)
      );
      setKeyWords(parsedKeyWords);
    };
    fetchUserBullets();
  }, []);

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
