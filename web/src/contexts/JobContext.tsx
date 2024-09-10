import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Job } from "../utils/types";
import { supabase } from "../clients/supabase";
import { ALL_LANGUAGES_AND_TECHNOLOGIES } from "../utils/all-languages-and-technologies";

type JobContextType = {
  job: Job | null;
  setJob: (job: Job | null) => void;
  keyWords: string[];
  setKeyWords: (keyWords: string[]) => void;
};

const JobContext = createContext<JobContextType>({} as JobContextType);

interface JobContextProviderProps {
  children: ReactNode;
}

export function JobContextProvider({ children }: JobContextProviderProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [keyWords, setKeyWords] = useState<string[]>([]);

  const jobId = window.location.pathname.split("/")[2];

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

  useEffect(() => {
    if (job?.description) {
      const keyWordsInDescription = ALL_LANGUAGES_AND_TECHNOLOGIES.filter(
        (word) => job.description.split("").includes(word)
      );
      setKeyWords(keyWordsInDescription);
    }
  }, [job]);

  console.log("job", job);

  const value = {
    job,
    setJob,
    keyWords,
    setKeyWords,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
}

export const useJobContext = () => useContext(JobContext);
