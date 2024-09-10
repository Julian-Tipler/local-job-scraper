import { GroupsDropDown } from "./GroupsDropDown";
import { useJobContext } from "../contexts/JobContext";
import { KeyWords } from "./KeyWords";

export const Job = () => {
  const { job } = useJobContext();

  // useEffect(() => {
  //   const fetchUserBullets = async () => {
  //     const { data, error } = await supabase
  //       .from("bullets")
  //       .select("*")
  //       .in("experienceId", [3, 4]);

  //     if (error || !data) {
  //       console.error("Error fetching bullets:", error);
  //       setError("Error fetching bullets");
  //       return;
  //     }
  //     const userBullets = data.map((bullet) => bullet.content);

  //     const wordsPresentInJobDescription =
  //       ALL_LANGUAGES_AND_TECHNOLOGIES.filter((bullet) =>
  //         job.description.includes(bullet)
  //       );
  //     const wordsBoldedBasedOnUser = wordsPresentInJobDescription
  //       .map((word) => {
  //         return {
  //           word,
  //           bold: userBullets.some((userBullet) => {
  //             return userBullet === word;
  //           }),
  //         };
  //       })
  //       .sort((a, b) => {
  //         if (a.bold && !b.bold) {
  //           return -1;
  //         } else if (!a.bold && b.bold) {
  //           return 1;
  //         } else {
  //           return 0;
  //         }
  //       });

  //     setKeyWords(wordsBoldedBasedOnUser);
  //   };
  //   fetchUserBullets();
  // }, []);

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
