import { useEffect, useState } from "react";
import { supabase } from "../../clients/supabase";
import { Job } from "../../components/Job";
import { Job as JobType } from "../../utils/types";
import { ExperienceStepper } from "../../components/ExperienceStepper";
import { SubmissionContextProvider } from "../../contexts/SubmissionContext";
import { JobContextProvider } from "../../contexts/JobContext";

function JobPage() {
  const [showExperience, setShowExperience] = useState(false);

  return (
    <SubmissionContextProvider>
      <JobContextProvider>
        <div
          className="flex justify-center gap-12"
          style={{ height: "calc(100vh - 42px)" }}
        >
          <div className="w-1/2 flex flex-col p-4">
            {showExperience ? (
              <ExperienceStepper />
            ) : (
              <button
                className="bg-slate-500 p-4 "
                onClick={() => setShowExperience(true)}
              >
                Show Experience
              </button>
            )}
          </div>
          <div className="w-1/2 flex flex-col p-4">
            <Job />
          </div>
        </div>
      </JobContextProvider>
    </SubmissionContextProvider>
  );
}
export default JobPage;

// AKfycbwXfEk9WGUbkEmUdII7YuqFRg1h8QYEFP1rzmTVAIVjZmOlYnL2eWQOr-l-xIZgQEja
// https://script.google.com/macros/s/AKfycbwXfEk9WGUbkEmUdII7YuqFRg1h8QYEFP1rzmTVAIVjZmOlYnL2eWQOr-l-xIZgQEja/exec
