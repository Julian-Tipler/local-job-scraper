import { supabase } from "../clients/supabase";

export const handleData = async (
  jobs: { title: string; url: string }[],
  website: string,
) => {
  const { data: existingTitlesData } = await supabase
    .from("jobs")
    .select("title");

  const existingTitlesSet = new Set(existingTitlesData.map((job) => job.title));

  const uniqueFilteredSet = jobs.filter((job, index, self) =>
    !existingTitlesSet.has(job.title) &&
    index === self.findIndex((t) => t.title === job.title)
  );

  const newJobTitles = Array.from(uniqueFilteredSet);
  console.log("NEW JOBS", newJobTitles);

  const { default: PushBullet } = await import("pushbullet");

  const apiKey = process.env.PUSHBULLET_API_KEY;
  const pusher = new PushBullet(apiKey);

  if (newJobTitles.length > 0) {
    pusher.note(
      "ujwk6Gf85i8sjuVmm2Ra9Y",
      `There are new job(s) available on ${website}!`,
      `\n\n
    ${newJobTitles.map((job) => `${job.title}: ${job.url}`).join("\n")}`,
    );
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
