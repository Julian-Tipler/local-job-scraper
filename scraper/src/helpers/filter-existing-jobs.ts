import { supabase } from "../clients/supabase";
import { handleSupabaseError } from "../util/handle-error";
import { Job } from "../util/types";

export const filterExistingJobs = async (
  jobs: Job[],
  website: string,
) => {
  const { data: existingJobs, error: existingJobsError } = await supabase
    .from("jobs")
    .select("title, url, description");

  if (existingJobsError) {
    handleSupabaseError(
      existingJobsError,
      `Error fetching existing jobs for ${website}`,
    );
  }

  const existingJobKeySet = new Set(
    existingJobs.map((job) => craftKey(job)),
  );

  if (!jobs?.filter) {
    console.error("jobs.filter is not a function", jobs, website);
  }

  const uniqueFilteredSet = jobs.filter((job, index, self) =>
    // Doesn't exist in database
    !existingJobKeySet.has(craftKey(job)) &&
    // Doesn't exist in the current array
    index ===
      self.findIndex((t) =>
        craftKey(t) ===
          craftKey(job)
      )
  );

  const newJobs = Array.from(uniqueFilteredSet);
  console.log(website, "old jobs", jobs.length, "new jobs", newJobs.length);

  return newJobs;
};

const craftKey = (job: Job) => `${job.title}-${new URL(job.url)}`;
