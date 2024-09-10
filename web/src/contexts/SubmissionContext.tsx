import { createContext, useContext, ReactNode, useState } from "react";
import { Bullet, Skill } from "../utils/types";
const VITE_SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL as string;

type SubmissionContextType = {
  submitForm: () => Promise<void>;
  submitted: boolean;
  urls: {
    pdfUrl: string;
    docUrl: string;
  };
  setUrls: React.Dispatch<
    React.SetStateAction<{
      pdfUrl: string;
      docUrl: string;
    }>
  >;
  resume: ResumeEntry[];
  setResume: React.Dispatch<React.SetStateAction<ResumeEntry[]>>;
};

export type ResumeEntry =
  | {
      type: "experience";
      title: string;
      values: Bullet[];
    }
  | {
      type: "languages";
      title: string;
      values: Skill[];
    }
  | {
      type: "technologies";
      title: string;
      values: Skill[];
    };

// This will be a db entry when I switch to firebase
export const MOCK_RESUME: ResumeEntry[] = [
  {
    type: "experience",
    title: "WisePilot",
    values: [],
  },
  {
    type: "experience",
    title: "Worktango",
    values: [],
  },
  {
    type: "languages",
    title: "Languages",
    values: [],
  },
  {
    type: "technologies",
    title: "Technologies",
    values: [],
  },
];

const SubmissionContext = createContext<SubmissionContextType>(
  {} as SubmissionContextType
);

interface SubmissionContextProviderProps {
  children: ReactNode;
}

export function SubmissionContextProvider({
  children,
}: SubmissionContextProviderProps) {
  const [resume, setResume] = useState<ResumeEntry[]>(MOCK_RESUME);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [urls, setUrls] = useState<{
    pdfUrl: string;
    docUrl: string;
  }>({ pdfUrl: "", docUrl: "" });

  const submitForm = async () => {
    const bulletContent = resume.map((resumeEntry: ResumeEntry) => {
      if (resumeEntry.type === "experience") {
        return resumeEntry.values.map((value) => value.content);
      } else {
        return resumeEntry.values.map((value) => value.title);
      }
    });
    const sanitizedData = bulletContent.map((bullet) =>
      bullet.map((text) => text.replace(/%/g, "__PERCENT__"))
    );

    const encodedExperienceInputs = encodeURIComponent(
      JSON.stringify(sanitizedData)
    );

    const res = await fetch(
      VITE_SCRIPT_URL + "?experienceInputs=" + encodedExperienceInputs
    );
    const data = await res.json();
    setSubmitted(true);
    setUrls(data);
    console.log(data);
  };

  const value = {
    resume,
    setResume,
    submitForm,
    submitted,
    urls,
    setUrls,
  };

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
}

export const useSubmissionContext = () => useContext(SubmissionContext);
