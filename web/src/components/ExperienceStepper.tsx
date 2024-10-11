import { useEffect, useState } from "react";
import { supabase } from "../clients/supabase";
import { Experience as ExperienceType } from "../utils/types";
import { Experience } from "./Experience";
import { useSubmissionContext } from "../contexts/SubmissionContext";
import { Skills } from "./Skills";
// import { Technologies } from "./Technologies";
import { useJobContext } from "../contexts/JobContext";

export const ExperienceStepper = () => {
  const { job } = useJobContext();

  const [step, setStep] = useState(0);
  const [experiences, setExperiences] = useState<ExperienceType[]>([]);
  const { submitForm, submitted, urls, resume } = useSubmissionContext();
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const { data: experiences, error } = await supabase
          .from("experiences")
          .select("*")
          .eq("user_id", 1);

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

  if (submitted) {
    return (
      <div className="flex flex-col w-1/2 p-4 h-full">
        <div>
          <a href={urls.docUrl} target="_blank" rel="noopener noreferrer">
            Doc Url
          </a>
        </div>
        <div>
          <a href={urls.pdfUrl} target="_blank" rel="noopener noreferrer">
            PDF Url
          </a>
        </div>
      </div>
    );
  }
  if (!job) return <div>Loading job...</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Left Column Title */}
      <h1 className="px-4 ">Resume Creator</h1>
      {/* Middle Section */}
      {resume.map((resumeEntry, i) => {
        switch (resumeEntry.type) {
          case "experience":
            return (
              <Experience key={i} index={i} selected={i === step} job={job} />
            );
          case "languages":
            return <Skills key={i} selected={i === step} variant={false} />;
          case "technologies":
            return <Skills key={i} selected={i === step} variant={true} />;
          // case "technologies":
          //   return <Technologies key={i} selected={i === step} />;
          default:
            return null;
        }
      })}
      {/* <Technologies selected={3 === step} /> */}
      {/* Navigation Buttons */}
      <div className="button-container flex gap-4 p-4">
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
          disabled={step === experiences.length - 1 + 2}
          className={`px-4 py-2 rounded ${
            step === experiences.length - 1 + 2
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          Next
        </button>
        <button
          onClick={() => submitForm()}
          disabled={step !== experiences.length - 1 + 2 || resume.length !== 4}
          className={`px-4 py-2 rounded ${
            step !== experiences.length - 1 + 2
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-700"
          }`}
        >
          Create
        </button>
      </div>
    </div>
  );
};
