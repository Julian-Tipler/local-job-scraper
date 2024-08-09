import { useEffect, useState } from "react";
import { supabase } from "../clients/supabase";
import { Bullet, Experience as ExperienceType } from "../utils/types";

const Experience = ({
  experience,
  selected,
}: {
  experience: ExperienceType;
  selected: boolean;
}) => {
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBullets = async () => {
      try {
        const { data: bullets, error } = await supabase
          .from("bullets")
          .select("*")
          .eq("experienceId", experience.id); // Fetch bullets related to the specific experience

        if (error) {
          throw new Error(error.message);
        }

        setBullets(bullets || []);
      } catch (error) {
        console.error("Error fetching bullets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBullets();
  }, [experience.id]);

  if (loading) return <div>Loading bullets...</div>;
  if (!selected) {
    return null;
  }

  return (
    <div>
      <h2 className="pb-4">{experience.title}</h2>
      <ul>
        {bullets.map((bullet) => (
          <li key={bullet.id}>{bullet.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default Experience;
