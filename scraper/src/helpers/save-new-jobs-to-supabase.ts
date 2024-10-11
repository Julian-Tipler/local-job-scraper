import { supabase } from "../clients/supabase";
import { Job } from "../util/types";
import { notify } from "./notify";

export const saveNewJobsToSupabase = async (
  newJobs: Job[],
) => {
  const { data, error } = await supabase
    .from("jobs")
    .insert(newJobs)
    .select("*");

  if (error || !data) {
    console.error("error from new job insert: ", error);
    throw error;
  }

  if (data.length > 0) {
    console.log("savedJobs", data.length);
  }

  let jobsData: Job[] = data as Job[]; // Type assertion
  if (!jobsData) {
    jobsData = [];
  }

  return jobsData;
};
