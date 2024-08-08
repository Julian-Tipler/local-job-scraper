import { ExperienceStepper } from "./components/ExperienceStepper";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "./clients/supabase";
import { JobDescription } from "./components/JobDescription";
import { Job } from "./utils/types";

function App() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const jobId = searchParams.get("job");

  const [job, setJob] = useState<Job | null>(null);

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
    <>
      <div>
        <h2>Experiences:</h2>
        <ExperienceStepper />
      </div>
      <div>
        <h2>Job description:</h2>
        <JobDescription description={job.description} />
      </div>
    </>
  );
}

export default App;

// AKfycbwXfEk9WGUbkEmUdII7YuqFRg1h8QYEFP1rzmTVAIVjZmOlYnL2eWQOr-l-xIZgQEja
// https://script.google.com/macros/s/AKfycbwXfEk9WGUbkEmUdII7YuqFRg1h8QYEFP1rzmTVAIVjZmOlYnL2eWQOr-l-xIZgQEja/exec
