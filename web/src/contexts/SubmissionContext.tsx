import { createContext, useContext, ReactNode, useState } from "react";
import { Bullet } from "../utils/types";
const VITE_SCRAPER_URL = import.meta.env.VITE_SCRAPER_URL as string;

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

  const submitForm = async () => {
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(form),
    };
    const response = await fetch(VITE_SCRAPER_URL, options);
    console.log(response);
    const data = response.json();
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
