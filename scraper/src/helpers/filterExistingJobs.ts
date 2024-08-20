import { supabase } from "../clients/supabase";
import { handleSupabaseError } from "../util/handle-error";

export const filterExistingJobs = async (
  jobs: { title: string; url: string; description: string }[],
  website: string,
) => {
  const { data: existingJobs, error: existingJobsError } = await supabase
    .from("jobs")
    .select("title, url");

  if (existingJobsError) {
    handleSupabaseError(
      existingJobsError,
      `Error fetching existing jobs for ${website}`,
    );
  }

  const existingJobKeySet = new Set(
    existingJobs.map((job) => `${job.title}-${new URL(job.url).origin}`),
  );

  if (!jobs?.filter) {
    console.error("jobs.filter is not a function", jobs, website);
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

  const newJobs = Array.from(uniqueFilteredSet);

  return newJobs;
};
