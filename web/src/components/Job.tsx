import { Job as JobType } from "../utils/types";

export const Job = ({ job }: { job: JobType }) => {
  return (
    <>
      <h2>Job </h2>
      <h3>{job.title}</h3>
      <div>{job.description}</div>
    </>
  );
};
