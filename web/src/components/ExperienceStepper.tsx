import { useEffect, useState } from "react";
import { supabase } from "../clients/supabase";
import { Experience as ExperienceType } from "../utils/types";
import { Job } from "../utils/types";
import Experience from "./Experience";

export const ExperienceStepper = ({ job }: { job: Job }) => {
  const [step, setStep] = useState(0);

  const [experiences, setExperiences] = useState<ExperienceType[]>([]);

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

  if (!experiences.length) return <div>Loading...</div>;
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="px-4 ">Experience</h1>
      <div className="experience-container flex-1 p-4">
        {experiences.map((experience, i) => {
          return <Experience experience={experience} selected={i === step} />;
        })}
      </div>

      <div className="button-container flex gap-4">
        <button
          onClick={handlePrevious}
          disabled={step === 0}
          className={`px-4 py-2 rounded ${
            step === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={step === experiences.length - 1}
          className={`px-4 py-2 rounded ${
            step === experiences.length - 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};
