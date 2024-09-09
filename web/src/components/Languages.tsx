import { useEffect, useState } from "react";
import { Skill } from "../utils/types";
import { fetchUserSkills } from "../api/fetchUserSkills";

export const Languages = ({ selected }: { selected: boolean }) => {
  const [languages, setLanguages] = useState<Skill[]>([]);
  useEffect(() => {
    fetchUserSkills(1)
      .then((skills) => {
        const languages = skills.filter((skill) => skill.type === "language");
        setLanguages(languages);
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
