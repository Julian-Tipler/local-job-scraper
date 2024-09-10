import { useEffect, useState } from "react";
import { Skill } from "../utils/types";
import { fetchUserSkills } from "../api/fetchUserSkills";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { openai } from "../utils/clients/openai";
import { rankBulletsPrompt } from "../utils/rank-bullets-prompt";

export const Languages = ({ selected }: { selected: boolean }) => {
  const [languages, setLanguages] = useState<Skill[]>([]);
  useEffect(() => {
    fetchUserSkills(1)
      .then((skills: Skill[]) => {
        const userLanguages = skills.filter(
          (skill) => skill.type === "language"
        );
        const relevantLanguages = filterByJobDescription();
        rankUserLanguages(userLanguages).then((ranking: string[]) => {
          const rankedUserLanguages = ranking.map((rank: string) => {
            return userLanguages.filter((language) => language.id === rank)[0];
          });
          setLanguages(rankedUserLanguages);
        });
      })
      .catch((error) => {
        console.error("Error fetching skills:", error);
      });
  }, []);

  console.log("languages", languages);

  if (!selected) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <section className="flex flex-col flex-1 p-4 border overflow-hidden">
        <div>Languages</div>
        <div>
          {languages.map((language) => (
            <div key={language.title}>{language.title}</div>
          ))}
        </div>
      </section>
    </DndProvider>
  );
};

// put in its own file
const rankUserLanguages = async (userLanguages: Skill[]) => {
  const chatCompletion = openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: rankBulletsPrompt(userLanguages, job.description),
      },
    ],
    model: "gpt-3.5-turbo",
  });
  const responseText = chatCompletion?.choices[0]?.message.content;

  return ["1", "2"];
};
