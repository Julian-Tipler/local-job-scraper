import { supabase } from "../clients/supabase";

export const observeJobViewLayout = () => {
  const jobContainer = document.querySelector(".job-view-layout");
  console.log("jobContainer", jobContainer);

  if (jobContainer) {
    const observer = new MutationObserver(async () => {
      observer.disconnect();
      await boldJobDescription();
      observer.observe(jobContainer, {
        childList: true,
        subtree: true,
      });
    });
    observer.observe(jobContainer, {
      childList: true,
      subtree: true,
    });
  }
};

const boldJobDescription = async () => {
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

  const jobDescriptionElement = document.querySelector(
    ".jobs-description__container"
  );
  console.log("jobDescription", jobDescriptionElement);

  if (jobDescriptionElement) {
    // Get the original text content of the job description
    let jobDescription = jobDescriptionElement.innerHTML;

    // Escape special characters in the languages/technologies array for use in regex
    const escapedTerms = aliases.map((term) =>
      term.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
    );

    // Create a regex pattern from the languages/technologies array
    const regexPattern = new RegExp(`\\b(${escapedTerms.join("|")})\\b`, "gi");

    // Replace matched terms with bold <span> elements
    jobDescription = jobDescription.replace(regexPattern, (match) => {
      return `<span style="font-weight: bold;">${match}</span>`;
    });

    // Replace the job description with the new bolded version
    jobDescriptionElement.innerHTML = jobDescription;
  }
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
