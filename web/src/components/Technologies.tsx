import { useEffect, useState } from "react";
import { supabase } from "../clients/supabase";
import { Skill } from "../utils/types";

export const Technologies = ({ selected }: { selected: boolean }) => {
  const [technologies, setTechnologies] = useState<Skill[]>([]);
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data: skills, error } = await supabase
          .from("users")
          .select("skills(*)")
          .eq("id", 1)
          .eq("type", "technology");

        if (error) {
          throw new Error(error.message);
        }

        setTechnologies(skills);

        if (error) {
          throw new Error(error.message);
        }

        setTechnologies(technologies);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };
    fetchSkills();
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
