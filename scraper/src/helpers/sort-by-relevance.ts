import { cosineSimilarity, generateEmbeddings } from "../clients/openai";
import { Job } from "../util/types";

export const sortByRelevance = async (
  newJobs: Job[],
) => {
  const myExperienceEmbedding = await generateEmbeddings(MY_EXPERIENCE);

  const relevanceScores = await Promise.all(newJobs.map(async (jobTitle) => {
    const titleEmbedding = await generateEmbeddings(jobTitle.title);
    const similarity = cosineSimilarity(myExperienceEmbedding, titleEmbedding);
    return { ...jobTitle, similarity };
  }));

  return relevanceScores
    .sort((a, b) => b.similarity - a.similarity).map(({ similarity, ...job }) =>
      job
    );
};
const MY_EXPERIENCE = `
I am a software engineer with 3 years of experience in full-stack web development. 
Job titles I am interested in include but are not limited to: Software Engineer, Software Engineer II, Software Engineer III, Full Stack Developer, Backend Developer, Frontend Developer, Applications developer, Web Developer.
I am open to Senior Engineer roles but prioritize regular or junior roles.
I am not as well equipped for lead and management roles. 
I am NOT interested in non-software roles such as Mechanical Engineering or any non-software roles. 
`;
