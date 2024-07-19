import { supabase } from "../clients/supabase";
import { notify } from "./notify";

export const handleData = async (
  jobs: { title: string; url: string }[],
  website: string,
) => {
  console.info(`Handling data for ${website}`);
  const { data: existingJobs } = await supabase
    .from("jobs")
    .select("title, url");

  const existingJobKeySet = new Set(
    existingJobs.map((job) => `${job.title}-${new URL(job.url).origin}`),
  );

  if(!jobs?.filter) {
    console.error("jobs.filter is not a function",jobs,website);
  }

  const uniqueFilteredSet = jobs.filter((job, index, self) =>
    // Doesn't exist in database
    !existingJobKeySet.has(`${job.title}-${new URL(job.url).origin}`) &&
    // Doesn't exist in the current array
    index ===
      self.findIndex((t) =>
        `${t.title}-${new URL(t.url).origin}` ===
          `${job.title}-${new URL(job.url).origin}`
      )
  );

  const newJobTitles = Array.from(uniqueFilteredSet);
  console.info("newJobTitles", newJobTitles);

  if (newJobTitles.length > 0) {
    notify(newJobTitles, website);
    const { error } = await supabase
      .from("jobs")
      .insert(newJobTitles)
      .select("*");
    if (error) {
      console.error("error from new job insert: ", error);
    }
  }

  return newJobTitles;
};
