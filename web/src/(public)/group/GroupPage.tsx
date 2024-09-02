import { useEffect, useState } from "react";
import { supabase } from "../../clients/supabase";
import { Group, Job } from "../../utils/types";

export const GroupPage = () => {
  const groupId = window.location.pathname.split("/")[2];
  const baseUrl = window.location.origin;

  const [group, setGroup] = useState<(Group & { jobs: Job[] }) | null>(null);
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data, error } = await supabase
          .from("groups")
          .select("*,jobs(*)")
          .eq("id", groupId)
          .single();

        if (error) {
          throw new Error(error.message);
        }
        setGroup(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, []);

  const removeJob = async (groupId: string, jobId: string) => {
    try {
      await supabase.from("jobs").update({ group_id: null }).eq("id", jobId);
      setGroup((prevGroup) => {
        if (prevGroup) {
          const updatedJobs = prevGroup.jobs.filter((job) => job.id !== jobId);
          return { ...prevGroup, jobs: updatedJobs };
        }
        return prevGroup;
      });
    } catch (error) {
      console.error("Error removing job:", error);
    }
  };
  if (!group) return <div>Loading...</div>;

  return (
    <div>
      <h1>GroupPage</h1>
      <h2>{group.name}</h2>
      <ul>
        {group.jobs.map((job) => (
          <li key={job.id} className="flex gap-2">
            <div className="flex gap-4">
              <a className="text-blue-400" href={job.url}>
                URL
              </a>
              <a href={`${baseUrl}/job/${job.id}`}>{job.title}</a>
            </div>
            <button
              className={"text-red-700"}
              onClick={() => removeJob(group.id, job.id)}
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
