import chokidar from "chokidar";
import PushBullet from "pushbullet";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const apiKey = process.env.PUSHBULLET_API_KEY;
const pusher = new PushBullet(apiKey);
const folderPath =
  "/Users/juliantipler/Julians_Documents/Coding/CODING PROJECTS/Practice/local-job-scraper/data/scrape-built-in";
const watcher = chokidar.watch(folderPath, {
  ignored: /^\./,
  persistent: true,
});

watcher
  .on("add", () => {
    fs.readdir(folderPath, "utf8", (err, files) => {
      if (err) {
        console.error(`Error reading directory: ${err.message}`);
        return;
      }

      const sortedFiles = files.sort((a, b) => {
        return (
          fs.statSync(`${folderPath}/${b}`).mtime.getTime() -
          fs.statSync(`${folderPath}/${a}`).mtime.getTime()
        );
      });
      const recentFiles = sortedFiles.slice(-2);

      // Delete all files but the most recent two
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

      let newestFile = recentFiles[0];
      let lastFile = recentFiles[1];

      // If there is a new job posting send a notification
      if (newestFile["Field2_links"] !== lastFile["Field2_links"]) {
        pusher.note(
          "ujwk6Gf85i8sjuVmm2Ra9Y",
          "There is a new job!",
          newestFile["Field2_links"]
        );
      }
    });
  })
  .on("error", (error) => console.error(`Watcher error: ${error}`));
