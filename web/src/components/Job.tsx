import { Job as JobType } from "../utils/types";

export const Job = ({ job }: { job: JobType }) => {
  return (
    <>
      <h1 className="px-4">{job.title}</h1>
      <div className="p-4">{job.description}</div>
    </>
  );
};
