import { useEffect, useMemo, useState } from "react";
import { useJobContext } from "../contexts/JobContext";
import { supabase } from "../clients/supabase";
import { Skill } from "../utils/types";

export const KeyWords = () => {
  const { keyWords } = useJobContext();
  const [userSkills, setUserSkills] = useState<Skill[]>([]);

  useEffect(() => {
    supabase
      .from("user_skills")
      .select("*")
      .eq("user_id", 1)
      .then(({ data, error }) => {
        if (error || !data) {
          console.error("Error fetching user skills:", error);
          return;
        }
        const skillIds = data.map((userSkill) => userSkill.skill_id);
        supabase
          .from("skills")
          .select("*")
          .in("id", skillIds)
          .then(({ data, error }) => {
            if (error || !data) {
              console.error("Error fetching skills:", error);
              return;
            }
            setUserSkills(data);
          });
      });
  }, []);

  const selectedKeyWords = useMemo(() => {
    if (keyWords.length === 0 || !userSkills.length) return [];
    return keyWords
      .map((word) => {
        return {
          word,
          bold: userSkills.some((userSkill) => {
            return userSkill.aliases.includes(word);
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
  }, [keyWords, userSkills]);

  if (!selectedKeyWords.length) return <div>Loading key words...</div>;
  return (
    <>
      {selectedKeyWords.map((selectedKeyWord, index) => (
        <span key={selectedKeyWord.word}>
          <span className={selectedKeyWord.bold ? "font-bold" : ""}>
            {selectedKeyWord.word}
          </span>
          {index < keyWords.length - 1 && ", "}
        </span>
      ))}
    </>
  );
};
