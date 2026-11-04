import * as fs from "fs";
import * as path from "path";

const TARGET_ROWS = 20_000_000;
const FILE_PATH = path.join(__dirname, "../../data.csv");
const PROJECTS = ["proj_alpha", "proj_beta", "proj_gamma"];
const EVENTS = [
  "page_view",
  "button_click",
  "checkout_started",
  "login_success",
];
const SOURCES = ["organic", "direct", "referral", "social"];
function generateCsv() {
  const stream = fs.createWriteStream(FILE_PATH);
  stream.write("project_id,event_name,user_id,payload,created_at\n");

  let i = 0;
  function writeBatch() {
    let canWrite = true;
    do {
      i++;
      const projectId = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
      const eventName = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      const userId = `user_${Math.floor(Math.random() * 1000000)}`;
      const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
      const payload = `"{""source"":""${source}""}"`;
      const msOffset = Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000);
      const createdAt = new Date(Date.now() - msOffset).toISOString();

      const row = `${projectId},${eventName},${userId},${payload},${createdAt}\n`;
      if (i === TARGET_ROWS) {
        stream.write(row, "utf-8", () => {
          stream.end();
          console.log(
            `\n✅ Successfully generated ${TARGET_ROWS.toLocaleString()} rows at ${FILE_PATH}`,
          );
        });
      } else {
        canWrite = stream.write(row, "utf-8");
      }
      if (i % 1_000_000 === 0) {
        process.stdout.write(
          `\rGenerated ${i.toLocaleString()} / ${TARGET_ROWS.toLocaleString()} rows...`,
        );
      }
    } while (i < TARGET_ROWS && canWrite);

    if (i < TARGET_ROWS) {
      stream.once("drain", writeBatch);
    }
  }
  console.log("Starting CSV generation...");
  writeBatch();
}
generateCsv();
