import { createContext, useContext, ReactNode, useState } from "react";
import { Bullet } from "../utils/types";

type SubmissionContextType = {
  form: Bullet[][];
  setForm: React.Dispatch<React.SetStateAction<Bullet[][]>>;
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
  const value = {
    form,
    setForm,
  };

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
}

export const useSubmissionContext = () => useContext(SubmissionContext);
