import { useEffect, useState } from "react";
import { Bullet, Job, Skill } from "../utils/types";
import { fetchUserSkills } from "../api/fetchUserSkills";
import { openai } from "../utils/clients/openai";
import { rankBulletsPrompt } from "../utils/rank-bullets-prompt";

export const Technologies = ({
  selected,
  job,
}: {
  selected: boolean;
  job: Job;
}) => {
  const { bullets, setBullets } = useSubmissionContext();

  const [technologies, setTechnologies] = useState<Skill[]>([]);
  useEffect(() => {
    fetchUserSkills(1)
      .then((skills) => {
        const languages = skills.filter((skill) => skill.type === "technology");
        openai.chat.completions
          .create({
            messages: [
              {
                role: "system",
                content: rankBulletsPrompt(languages, job.description),
              },
            ],
            model: "gpt-3.5-turbo",
          })
          .then((chatCompletion) => {
            const responseText = chatCompletion?.choices[0]?.message.content;

            if (!responseText) {
              throw new Error("general issue with cohere response");
            }
            console.log("OpenAI Response\n", responseText);

            const split = responseText.split("---");
            if (!(split.length === 2)) {
              throw new Error("Issue with cohere response text");
            }
            const ranking: Skill[] = split[1]
              .trim()
              .split(",")
              .map((rank: string) => {
                return bullets[parseInt(rank) - 1];
              });
            setBullets((prev: Bullet[][]) => {
              const dupeNewForm = [...prev];
              dupeNewForm[3] = ranking;
              return dupeNewForm;
            });
          });
        setTechnologies(languages);
      })
      .catch((error) => {
        console.error("Error fetching skills:", error);
      });
  }, []);
  if (!selected) {
    return null;
  }

  return (
    <div>
      <div>Technologies</div>
      <div>
        {technologies.map((technology) => (
          <div key={technology.title}>{technology.title}</div>
        ))}
      </div>
    </div>
  );
};
