import { ExperienceStepper } from "./components/ExperienceStepper";
import { useEffect, useState } from "react";
import { supabase } from "./clients/supabase";
import { Job } from "./components/Job";
import { Job as JobType } from "./utils/types";

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
  console.log(job);
  return (
    <div className="flex">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <div>
        <h2>Experiences:</h2>
        {/* <ExperienceStepper /> */}
      </div>
      <div>
        <Job job={job} />
      </div>
    </div>
  );
}

export default App;

// AKfycbwXfEk9WGUbkEmUdII7YuqFRg1h8QYEFP1rzmTVAIVjZmOlYnL2eWQOr-l-xIZgQEja
// https://script.google.com/macros/s/AKfycbwXfEk9WGUbkEmUdII7YuqFRg1h8QYEFP1rzmTVAIVjZmOlYnL2eWQOr-l-xIZgQEja/exec
