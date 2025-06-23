import { supabase } from "../clients/supabase";

export const observeJobViewLayout = async () => {
  const aliases = await createAliases();

  const jobDescriptionContentText = document.querySelector(
    ".jobs-description-content__text"
  );
  if (!jobDescriptionContentText)
    console.error("jobDescriptionContainer is not element");
  console.log("container", jobDescriptionContentText);

  let oldText = jobDescriptionContentText.innerText.substring(0, 300);

  const observer = new MutationObserver(async () => {
    console.log("triggered");
    const possibleNewText = document.querySelector(
      ".jobs-description-content__text"
    );
    if (possibleNewText !== oldText) {
      console.log("DIFFERENCE");
    }
  }); 

  observer.observe(jobDescriptionContentText, {
    childList: true,
    subtree: true,
  });

  // await boldJobDescription(aliases);
};

const boldJobDescription = async (aliases) => {
  const parentElement = document.querySelector(
    ".jobs-description-content__text"
  );
  const jobDescriptionElement = parentElement?.children[1];

  console.log("element", jobDescriptionElement.innerHTML.substring(0, 500));
  if (!jobDescriptionElement)
    console.error("jobDescriptionElement is not element");

  if (jobDescriptionElement) {
    //   // Get the original text content of the job description
    //   // Escape special characters in the languages/technologies array for use in regex
    const escapedTerms = aliases.map((term) =>
      term.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
    );
    //   // Create a regex pattern from the languages/technologies array
    const regexPattern = new RegExp(`\\b(${escapedTerms.join("|")})\\b`, "gi");
    //   // Replace matched terms with bold <span> elements
    const jobDescription = jobDescriptionElement.innerHTML;
    const boldedJobDescription = jobDescription.replace(
      regexPattern,
      (match) => {
        return `<span style="font-weight: bold;">${match}</span>`;
      }
    );
    //   // Replace the job description with the new bolded version
    console.log("boldedJobDescription", boldedJobDescription.substring(0, 500));
    jobDescriptionElement.innerHTML = boldedJobDescription;
    // console.log("element", jobDescriptionElement.innerHTML.substring(0, 500));
  }
};

export const createAliases = async () => {
  const { data, error } = await supabase
    .from("user_skills")
    .select("*, skills(*)");

  let aliases = [];

  if (error) {
    aliases = [...ALL_LANGUAGES_AND_TECHNOLOGIES];
  } else {
    data.forEach((entry) => {
      aliases.push(...entry.skills.aliases);
    });
  }
  return aliases;
};

export const ALL_LANGUAGES_AND_TECHNOLOGIES = [
  "Javascript",
  "JavaScript",
  "Typescript",
  "TypeScript",
  "Python",
  "Java",
  "Ruby",
  "C++",
  "Go",
  "Swift",
  "Rust",
  "C#",
  "PHP",
  "HTML",
  "CSS",
  "SQL",
  "React",
  "React.js",
  "ReactJS",
  "Angular",
  "Vue",
  "Node.js",
  "NodeJS",
  "Node",
  "Express",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "AWS",
  "GCP",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Bash",
  "Redis",
  "GraphQL",
  "Firebase",
  "Supabase",
  "Elasticsearch",
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
