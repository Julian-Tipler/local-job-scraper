import { cosineSimilarity, generateEmbeddings } from "../clients/openai";
import { supabase } from "../clients/supabase";
import { Job } from "../util/types";

const apiKey = process.env.PUSHBULLET_API_KEY;
type JobEntries = {
  [key: string]: Job[];
};

export const notify = async (
  newJobsObject: JobEntries,
) => {
  const { default: PushBullet } = await import("pushbullet");

  let notificationString = ``;

  for (const [key, value] of Object.entries(newJobsObject)) {
    const sortedJobTitles = await sortJobs(value);
    notificationString += `\n\n
  ${key}:
  \n\n
    ${
      sortedJobTitles.map((job) =>
        `${job.title}:\n Skills:${
          ALL_LANGUAGES_AND_TECHNOLOGIES.filter((bullet) =>
            job.description.includes(bullet)
          )
        }\nhttp://localhost:5173/job/${job.id}\n`
      ).join("\n")
    }`;
  }

  const pusher = new PushBullet(apiKey);
  pusher.note(
    "ujwk6Gf85i8sjuVmm2Ra9Y",
    `There are new job(s) available!`,
    notificationString,
  );
  console.log(`Notification sent`);
};

const sortJobs = async (
  newJobs: Job[],
) => {
  const myExperienceEmbedding = await generateEmbeddings(MY_EXPERIENCE);

  const relevanceScores = await Promise.all(newJobs.map(async (jobTitle) => {
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

export const ALL_LANGUAGES_AND_TECHNOLOGIES = [
  "Javascript",
  "JavaScript",
  "Typescript",
  "TypeScript",
  "C++",
  "Python",
  "Java",
  "Ruby",
  "Go",
  "Swift",
  "PHP",
  "HTML",
  "CSS",
  "React",
  "React.js",
  "ReactJS",
  "Angular",
  "Vue",
  "Node.js",
  "NodeJS",
  "Express",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "AWS",
  "GCP",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Rust",
  "C#",
  "Bash",
  "Redis",
  "GraphQL",
  "Firebase",
  "Supabase",
  "Elasticsearch",
];
