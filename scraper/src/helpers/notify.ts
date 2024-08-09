const apiKey = process.env.PUSHBULLET_API_KEY;

export const notify = async (
  newJobTitles: { id: string; title: string; url: string }[],
  website: string,
) => {
  const { default: PushBullet } = await import("pushbullet");

  const pusher = new PushBullet(apiKey);
  pusher.note(
    "ujwk6Gf85i8sjuVmm2Ra9Y",
    `There are new job(s) available on ${website}!`,
    `\n\n
    ${
      newJobTitles.map((job) =>
        `${job.title}: ${job.url}\nhttp://localhost:5173/?job=${job.id}`
      ).join("\n")
    }`,
  );
};
