import { GroupsDropDown } from "./GroupsDropDown";
import { useJobContext } from "../contexts/JobContext";
import { KeyWords } from "./KeyWords";

export const Job = () => {
  const { job } = useJobContext();

  if (!job) return <div>Loading job...</div>;
  const formattedDescription = job.description
    .split("\n")
    .map((line, index) => <p key={`paragraph-${index}`}>{line}</p>);

  return (
    <div className="flex flex-col h-full">
      <div className="flex">
        <h1 className="px-4 ">{job.title}</h1>
        <GroupsDropDown />
      </div>
      <h1>Key words:</h1>
      <div>
        <KeyWords />
      </div>
      <a
        className={"text-blue-500"}
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Job Url
      </a>
      <div className="description-container p-4 flex-1 flex flex-col gap-2 overflow-y-auto">
        {formattedDescription}
      </div>
    </div>
  );
};
