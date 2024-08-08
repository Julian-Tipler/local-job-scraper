import { useEffect, useState } from "react";
import { supabase } from "../clients/supabase";
import { Experience } from "../utils/types";

export const ExperienceStepper = () => {
  const [step, setStep] = useState(0);

  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const { data: experiences, error } = await supabase
          .from("experiences")
          .select("*");

        if (error) {
          throw new Error(error.message);
        }

        setExperiences(experiences);
      } catch (error) {
        console.error("Error fetching experiences:", error);
      }
    };

    fetchExperiences();
  }, []);

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevious = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const { title } = experiences[step];
  if (!experiences.length) return <div>Loading...</div>;
  return (
    <div>
      <h1>{title}</h1>
      <ExperienceComponent title={title} />
      <button onClick={handlePrevious} disabled={step === 0}>
        Previous
      </button>
      <button onClick={handleNext} disabled={step === experiences.length - 1}>
        Next
      </button>
    </div>
  );
};

const ExperienceComponent = ({ title }: { title: string }) => {
  return <div>{title} component</div>;
};
