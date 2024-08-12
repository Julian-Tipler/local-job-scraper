import { Job as JobType } from "../utils/types";

export const Job = ({ job }: { job: JobType }) => {
  const formattedDescription = job.description
    .split("\n")
    .map((line, index) => <p key={`paragraph-${index}`}>{line}</p>);

  return (
    <div className="flex flex-col h-full">
      <h1 className="px-4 ">{job.title}</h1>
      <a className={"text-blue-500"}href={job.url} target="_blank" rel="noopener noreferrer">
        Job Url
      </a>
      <div className="description-container p-4 flex-1 flex flex-col gap-2 overflow-y-auto">
        {formattedDescription}
      </div>
    </div>
  );
};
