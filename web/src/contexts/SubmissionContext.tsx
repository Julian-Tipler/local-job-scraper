import { createContext, useContext, ReactNode, useState } from "react";
import { Bullet } from "../utils/types";
const VITE_SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL as string;

type SubmissionContextType = {
  form: Bullet[][];
  setForm: React.Dispatch<React.SetStateAction<Bullet[][]>>;
  submitForm: () => Promise<void>;
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

  const bulletContent = form.map((experience: Bullet[]) => {
    return experience.map((bullet) => {
      return bullet.content;
    });
  });

  const submitForm = async () => {
    const encodedExperienceInputs = encodeURIComponent(
      JSON.stringify(bulletContent)
    );
    console.log("Submitting...", encodedExperienceInputs);

    const res = await fetch(
      VITE_SCRIPT_URL + "?experienceInputs=" + encodedExperienceInputs
    );
    const data = await res.json();
    console.log(data);
  };

  const value = {
    form,
    setForm,
    submitForm,
  };

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
}

export const useSubmissionContext = () => useContext(SubmissionContext);
