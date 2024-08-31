import { cosineSimilarity, generateEmbeddings } from "../clients/openai";
import { supabase } from "../clients/supabase";
import { Job } from "../util/types";

const apiKey = process.env.PUSHBULLET_API_KEY;

export const notify = async (
  newJobTitles: Job[],
  website: string,
) => {
  const { default: PushBullet } = await import("pushbullet");

  const sortedJobTItles = await sortJobs(newJobTitles);

  const { data, error } = await supabase
    .from("bullets")
    .select("*")
    .in("experienceId", [3, 4]);

  if (error || !data) {
    console.error("Error fetching bullets:", error);
  }

  const userBullets = data ? data.map((bullet) => bullet.content) : [];

  const pusher = new PushBullet(apiKey);
  pusher.note(
    "ujwk6Gf85i8sjuVmm2Ra9Y",
    `There are new job(s) available on ${website}!`,
    `\n\n
    ${
      sortedJobTItles.map((job) =>
        `${job.title}:\n Skills:${
          userBullets.filter((bullet) => job.description.includes(bullet))
        }\nhttp://localhost:5173/job/${job.id}\n`
      ).join("\n")
    }`,
  );
  console.log(`Notification sent for website ${website}`);
};

const sortJobs = async (
  jobTitles: Job[],
) => {
  const myExperienceEmbedding = await generateEmbeddings(MY_EXPERIENCE);

  const relevanceScores = await Promise.all(jobTitles.map(async (jobTitle) => {
    const titleEmbedding = await generateEmbeddings(jobTitle.title);
    const similarity = cosineSimilarity(myExperienceEmbedding, titleEmbedding);
    return { ...jobTitle, similarity };
  }));

  return relevanceScores
    .sort((a, b) => b.similarity - a.similarity); //
};

const MY_EXPERIENCE = `
I am a software engineer with 3 years of experience in full-stack web development. 
Job titles I am interested in include but are not limited to: Software Engineer, Full Stack Developer, Backend Developer, Frontend Developer, Applications developer, Web Developer.
I am open to Senior Engineer roles but prioritize regular or junior roles.
I am not as well equipped for lead and management roles. 
I am not interested in non-software roles such as Mechanical Engineering or non-Engineering roles. 
`;
