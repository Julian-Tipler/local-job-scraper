import { supabase } from "../../clients/supabase";
import { notify } from "../notify";

export const handleNewJobs = async (
  newJobs: { title: string; url: string; description: string }[],
  website: string,
) => {
  if (newJobs.length) {

    






    notify(newJobs, website);
    const { error } = await supabase
      .from("jobs")
      .insert(newJobs)
      .select("*");
    if (error) {
      console.error("error from new job insert: ", error);
    }
  }
};
