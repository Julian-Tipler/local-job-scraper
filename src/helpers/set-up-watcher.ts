// @ts-ignore
import chokidar from "chokidar";
// @ts-ignore
import PushBullet from "pushbullet";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const apiKey = process.env.PUSHBULLET_API_KEY;
const pusher = new PushBullet(apiKey);
const folderPath =
  "/Users/juliantipler/Julians_Documents/Coding/CODING PROJECTS/Practice/local-job-scraper/data/scrape-built-in";

export const setUpWatcher = () => {
  const watcher = chokidar.watch(folderPath, {
    ignored: /^\./,
    ignoreInitial: true,
    persistent: true,
  });

  watcher
    .on("add", () => {
      console.log("File being added");
      fs.readdir(folderPath, "utf8", async (err, files) => {
        if (err) {
          console.error(`Error reading directory: ${err.message}`);
          return;
        }

        const sortedFiles = files.sort((a, b) => {
          return (
            fs.statSync(`${folderPath}/${a}`).mtime.getTime() -
            fs.statSync(`${folderPath}/${b}`).mtime.getTime()
          );
        });

        // Delete all files but the most recent two
        const recentFiles = sortedFiles.slice(-2);
        sortedFiles.forEach((file) => {
          const filePath = `${folderPath}/${file}`;

          if (!recentFiles.includes(file)) {
            fs.unlink(filePath, (unlinkError) => {
              if (unlinkError) {
                console.error(
                  `Error deleting file ${file}: ${unlinkError.message}`
                );
              }
            });
          }
        });

        // Chat GPT: Read the most recent file as json and compare it to the old file. If there are any new entries in the array (you can compare field "Field2_links" for this), console.log the new entries.
        // Assuming the most recent file is in recentFiles[1]
        const mostRecentFile = recentFiles[1];
        const filePath = `${folderPath}/${mostRecentFile}`;

        // Read the most recent file as JSON
        fs.readFile(filePath, "utf8", (readError, data) => {
          if (readError) {
            console.error(
              `Error reading file ${mostRecentFile}: ${readError.message}`
            );
            return;
          }

          try {
            const recentFileContent = JSON.parse(data);

            const oldFileContent = JSON.parse(
              fs.readFileSync(`${folderPath}/${recentFiles[0]}`, "utf8")
            );

            const newEntries = recentFileContent.filter(
              (recentEntry) =>
                !oldFileContent.some(
                  (oldEntry) =>
                    oldEntry.Field2_links === recentEntry.Field2_links
                )
            );

            const linkStrings = newEntries
              .map((entry) => entry.Field2_links)
              .join("\n");

            if (newEntries.length > 0) {
              pusher.note(
                "ujwk6Gf85i8sjuVmm2Ra9Y",
                "There are new job(s) available!",
                `${newEntries.length} new job(s) available! \n\n${linkStrings}`
              );
            }
          } catch (jsonError) {
            console.error(
              `Error parsing JSON in file ${mostRecentFile}: ${jsonError.message}`
            );
          }
        });
      });
    })
    .on("error", (error) => console.error(`Watcher error: ${error}`));
};