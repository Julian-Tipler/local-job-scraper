import { useEffect, useState } from "react";
import { Job as JobType } from "../utils/types";
import { supabase } from "../clients/supabase";
import { ALL_LANGUAGES_AND_TECHNOLOGIES } from "../utils/all-languages-and-technologies";

export const Job = ({ job }: { job: JobType }) => {
  const [keyWords, setKeyWords] = useState<{ word: string; bold: boolean }[]>(
    []
  );

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
      }
      const userBullets = data.map((bullet) => bullet.content);

      const wordsPresentInJobDescription =
        ALL_LANGUAGES_AND_TECHNOLOGIES.filter((bullet) =>
          job.description.includes(bullet)
        );
      const wordsBoldedBasedOnUser = wordsPresentInJobDescription
        .map((word) => {
          return {
            word,
            bold: userBullets.some((userBullet) => {
              return userBullet === word;
            }),
          };
        })
        .sort((a, b) => {
          if (a.bold && !b.bold) {
            return -1;
          } else if (!a.bold && b.bold) {
            return 1;
          } else {
            return 0;
          }
        });

      setKeyWords(wordsBoldedBasedOnUser);
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
      <div>
        {keyWords.map((keyWord, index) => (
          <span key={keyWord.word}>
            <span className={keyWord.bold ? "font-bold" : ""}>
              {keyWord.word}
            </span>
            {index < keyWords.length - 1 && ", "}
          </span>
        ))}
      </div>
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
