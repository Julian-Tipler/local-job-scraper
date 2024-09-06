import { Bullet } from "./types";

export const rankBulletsPrompt = (
  bullets: Bullet[],
  jobDescription: string,
) => {
  const returnInstructions = `Return three things. 
    a. discuss each bullet and how relevant it is to the job description.
    b. return "---" to separate the bullets from the ranking. 
    c. return the indexes of the bullets you ranked in the first step. The order should be the same as how you ranked them above. The quantity should be the same as the number of bullets provided, if 4 bullets are provided, return 4, if 5 are provided return 5 etc. Do not return any additional text below this ranking, just return the comma separated indexes.
    Below the comma separated indexes do not return any text, message, or additional information. Your response should end immediately after the comma separated indexes.
    Example 1 (correct):
    "
    3. This bullet was most relevant because it discusses that the person has prior experience dogwalking
    1. This bullet was second most relevant because it mentions catwalking which is relevant but not as relevant
    4. This bullet was third most relevant because it discusses that the person has prior experience with animals but doesn't mention dogwalking
    2. This bullet was least relevant because it discussed tutoring which has nothing to do with dogwalking
    
    ---
    
    3,1,4,2
    "
    This example is correct because it:
    a. ranks the ranked bullets along with an explanation for each ranking
    b. separates the bullets from the ranking with "---"
    c. returns the indexes of the bullets in the order they were ranked, separated by commas. In this case, the indexes are 3,1,4,2. No additional text is returned after the comma separated indexes.
    
    Example 2 (correct):
    "
    1. This bullet was most relevant because it mentions React and Typescript which were directly present in the job description
    2. This bullet was second most relevant because it discusses API development which is relevant to the job description which is fullstack
    4. This bullet was third most relevant because it discussed CI/CD which is somewhat related to the job description
    5. This bullet was fourth most relevant because it doesn't mention any technologies or skills that were in the job description but is still tied to fullstack development
    3. This bullet was least relevant because it discussed a technology that wasn't mentioned in the job description and is not directly related to the job description

    ---

    1,2,4,5,3
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
