import { Bullet } from "./types";

export const rankBulletsPrompt = (
  bullets: Bullet[],
  jobDescription: string,
) => {
  const returnInstructions = `Return three things. 
    a. discuss each bullet and how relevant it is to the job description.
    b. return "---" to separate the bullets from the ranking. 
    c. return the indexes of the bullets you ranked in the first step. The order should be the same as how you ranked them above. The quantity should be the same as the number of bullets provided, no more no less. Do not return any additional text below this ranking, just return the comma separated indexes.
    Below the comma separated indexes do not return any text, message, or additional information. Your response should end immediately after the comma separated indexes.
    Example 1 (correct):
    "
    3. This bullet was most relevant because it discusses that the person has prior experience dogwalking
    1. This bullet was second most relevant because it mentions catwalking which is relevant but not as relevant
    2. This bullet was least relevant because it discussed tutoring which has nothing to do with dogwalking
    
    ---
    
    3,1,2
    "
    This example is correct because it:
    a. ranks the ranked bullets along with an explanation for each ranking
    b. separates the bullets from the ranking with "---"
    c. returns the indexes of the bullets in the order they were ranked, separated by commas. In this case, the indexes are 3,1,2. No additional text is returned after the comma separated indexes.
    
    Example 2 (correct):
    "
    1. This bullet was most relevant because it discusses that the person has prior experience with Spanish
    2.  This bullet was second most relevant because it mentions French which is relevant but not as relevant
    3. This bullet was least relevant because it discussed Math which has nothing to do with teaching Spanish

    ---

    1,2,3
    "
    This example is correct because it:
    a. ranks the ranked bullets along with an explanation for each ranking
    b. separates the bullets from the ranking with "---"
    c. returns the indexes of the bullets in the order they were ranked, separated by commas. In this case, the indexes are 1,2,3. No additional text is returned after the comma separated indexes.
    
    Example 3 (incorrect):
    "
    ---

    1,2,3
    "
    This example is incorrect because it:
    a. does not include the bullets ranked by relevancy to the job description, along with a description for why you ranked each bullet in that order.
    `;
  return `
You are a skilled software engineer career advisor with expertise in matching job experience to job descriptions. Below is a list of bullets from a user's previous job. 
Your task is to rank these bullets in order of their relevance to the provided job description.

${returnInstructions}

bullets:
${
    bullets.map((bullet, i) => {
      return `${i + 1}. ${bullet.content}`;
    }).join("\n")
  }

Job Description:
${jobDescription}

`;
};

// Do not include any text, spaces or brackets. Only return the numbers separated by commas.
// You should only return the numbers separated by commas
