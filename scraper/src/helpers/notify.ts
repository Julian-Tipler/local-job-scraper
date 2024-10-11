import { ALL_LANGUAGES_AND_TECHNOLOGIES } from "../util/consts";
import { Job } from "../util/types";

const apiKey = process.env.PUSHBULLET_API_KEY;
type JobEntries = {
  [key: string]: Job[];
};

export const notify = async (
  newJobsObject: JobEntries,
) => {
  if (
    Object.keys(newJobsObject).length === 0 ||
    Object.entries(newJobsObject).length === 0
  ) {
    console.log(`No new jobs to notify`);
    return;
  }

  const { default: PushBullet } = await import("pushbullet");

  let notificationString = ``;

  for (const [key, value] of Object.entries(newJobsObject)) {
    notificationString += `\n\n
  ${key}:
  \n\n
    ${
      value.map((job: Job) =>
        `${job.title}:\n Key Words:${
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
