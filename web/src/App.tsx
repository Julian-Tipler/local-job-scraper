import { useEffect, useState } from "react";
import { supabase } from "./clients/supabase";
import { Job } from "./components/Job";
import { Job as JobType } from "./utils/types";
import { ExperienceStepper } from "./components/ExperienceStepper";

function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const jobId = searchParams.get("job");

  const [job, setJob] = useState<JobType | null>(null);

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
    <div className="flex justify-center gap-12">
      <div className="flex flex-col flex-1 h-screen p-4">
        <ExperienceStepper job={job} />
      </div>
      <div className="flex-1 h-screen p-4">
        <Job job={job} />
      </div>
    </div>
  );
}

export default App;

// AKfycbwXfEk9WGUbkEmUdII7YuqFRg1h8QYEFP1rzmTVAIVjZmOlYnL2eWQOr-l-xIZgQEja
// https://script.google.com/macros/s/AKfycbwXfEk9WGUbkEmUdII7YuqFRg1h8QYEFP1rzmTVAIVjZmOlYnL2eWQOr-l-xIZgQEja/exec
