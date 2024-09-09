import { useEffect, useState } from "react";
import { supabase } from "../clients/supabase";
import { Skill } from "../utils/types";

export const Languages = ({ selected }: { selected: boolean }) => {
  const [languages, setLanguages] = useState<Skill[]>([]);
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data: userSkills, error: userSkillsError } = await supabase
          .from("user_skills")
          .select("skill_id")
          .eq("user_id", 1);

        if (userSkillsError) {
          console.error("Error fetching user skills:", userSkillsError);
          return;
        }

        // Extract skill IDs
        const skillIds = userSkills.map((us) => Number(us.skill_id));

        if (skillIds.length === 0) {
          return []; // No skills found for this user
        }
        console.log(skillIds);
        // Step 2: Fetch skills based on skill IDs
        const { data: skills, error: skillsError } = await supabase
          .from("skills")
          .select("*")
          .in("id", skillIds);
        console.log("skills", skills);
        if (skillsError) {
          console.error("Error fetching skills:", skillsError);
          return;
        }
        setLanguages(skills);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };
    fetchSkills();
  }, []);

  console.log("languages", languages);

  if (!selected) {
    return null;
  }

  return (
    <div>
      <div>Languages</div>
      <div>
        {languages.map((language) => (
          <div key={language.title}>{language.title}</div>
        ))}
      </div>
    </div>
  );
};
