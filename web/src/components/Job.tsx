import { Job as JobType } from "../utils/types";

export const Job = ({ job }: { job: JobType }) => {
  const formattedDescription = job.description
    .split("\n")
    .map((line, index) => <p key={index}>{line}</p>);
  console.log(job.description);
  return (
    <>
      <h1 className="px-4">{job.title}</h1>
      <div className="p-4 flex flex-col gap-2">{formattedDescription}</div>
    </>
  );
};
