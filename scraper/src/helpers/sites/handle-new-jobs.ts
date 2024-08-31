import { supabase } from "../../clients/supabase";
import { Job } from "../../util/types";
import { notify } from "../notify";

export const handleNewJobs = async (
  newJobs: Job[],
  website: string,
) => {
  if (newJobs.length) {
    const { data, error } = await supabase
      .from("jobs")
      .insert(newJobs)
      .select("*");

    if (error || !data) {
      console.error("error from new job insert: ", error);
      throw error;
    }
    notify(data, website);
    if (error) {
      console.error("error from new job insert: ", error);
    }
  }
};
