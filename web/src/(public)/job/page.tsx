import { useEffect, useState } from "react";
import { supabase } from "../../clients/supabase";
import { Job } from "../../components/Job";
import { Job as JobType } from "../../utils/types";
import { ExperienceStepper } from "../../components/ExperienceStepper";
import { SubmissionContextProvider } from "../../contexts/SubmissionContext";

function JobPage() {
  const jobId = window.location.pathname.split("/")[2];

  const [job, setJob] = useState<JobType | null>(null);

  const [showExperience, setShowExperience] = useState(false);

  useEffect(() => {
    supabase
      .from("jobs")
      .select()
      .eq("id", jobId)
      .then((response) => {
        if (response.error) {
          return null;
        } else {
          setJob(response.data[0]);
        }
      });
  }, [jobId]);

  if (!job) {
    return <div>Loading...</div>;
  }

  return (
    <SubmissionContextProvider>
      <div
        className="flex justify-center gap-12"
        style={{ height: "calc(100vh - 42px)" }}
      >
        <div className="w-1/2 flex flex-col p-4">
          {showExperience ? (
            <ExperienceStepper job={job} />
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
          <Job job={job} />
        </div>
      </div>
    </SubmissionContextProvider>
  );
}
export default JobPage;

// AKfycbwXfEk9WGUbkEmUdII7YuqFRg1h8QYEFP1rzmTVAIVjZmOlYnL2eWQOr-l-xIZgQEja
// https://script.google.com/macros/s/AKfycbwXfEk9WGUbkEmUdII7YuqFRg1h8QYEFP1rzmTVAIVjZmOlYnL2eWQOr-l-xIZgQEja/exec
