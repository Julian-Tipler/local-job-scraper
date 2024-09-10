import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
} from "react";
import { Job } from "../utils/types";
import { supabase } from "../clients/supabase";

type JobContextType = {
  job: Job | null;
  setJob: (job: Job | null) => void;
  keyWords: string[];
};

const JobContext = createContext<JobContextType>({} as JobContextType);

interface JobContextProviderProps {
  children: ReactNode;
}

export function JobContextProvider({ children }: JobContextProviderProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [allSkillAliases, setAllSkillAliases] = useState<string[]>([]);

  const jobId = window.location.pathname.split("/")[2];

  useEffect(() => {
    supabase
      .from("jobs")
      .select("*")
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
    supabase
      .from("skills")
      .select("*")
      .then(({ data, error }) => {
        if (error || !data) {
          console.error("Error fetching skills:", error);
          return;
        }
        const allSkillAliases: string[] = [];
        data.forEach((skill) => {
          allSkillAliases.push(...skill.aliases);
        });
        setAllSkillAliases(allSkillAliases);
      });
  }, []);

  console.log("allSkillAliases", allSkillAliases);

  const keyWords = useMemo(() => {
    if (!job?.description || !allSkillAliases.length) return [];
    const splitJobDescription = job?.description.split(/\W+/);
    const keyWordsInDescription = allSkillAliases.filter((word) =>
      splitJobDescription.includes(word)
    );
    return keyWordsInDescription;
  }, [job?.description, allSkillAliases]);

  console.log("keyWords", keyWords);

  const value = {
    job,
    setJob,
    keyWords,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
}

export const useJobContext = () => useContext(JobContext);
