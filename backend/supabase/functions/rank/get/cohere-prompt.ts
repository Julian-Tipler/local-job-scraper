export const coherePrompt = `
rerank these bullet points according to relevancy. 
Return just the bullet points separated by a new line followed by an open parenthese, a short justification for why that line is relevant, and a close parenthese, followed by two new lines. 
Do not return any other text. 
Here is an example format which you will fill with the actual bullet point and description:

* Performed a task using example technology alpha, resulting in great success
(this is relevant because the example technology alpha is required in the job description)
`;
