import { createContext, useContext, ReactNode, useState } from "react";
import { Bullet } from "../utils/types";
const VITE_SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL as string;

type SubmissionContextType = {
  form: Bullet[][];
  setForm: React.Dispatch<React.SetStateAction<Bullet[][]>>;
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
};

const SubmissionContext = createContext<SubmissionContextType>(
  {} as SubmissionContextType
);

interface SubmissionContextProviderProps {
  children: ReactNode;
}

export function SubmissionContextProvider({
  children,
}: SubmissionContextProviderProps) {
  const [form, setForm] = useState<Bullet[][]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [urls, setUrls] = useState<{
    pdfUrl: string;
    docUrl: string;
  }>({ pdfUrl: "", docUrl: "" });

  const submitForm = async () => {
    const bulletContent = form.map((experience: Bullet[]) => {
      return experience.map((bullet) => {
        return bullet.content;
      });
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
    form,
    setForm,
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
