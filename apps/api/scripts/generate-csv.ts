import * as fs from "fs";
import * as path from "path";

const TARGET_ROWS = 100_000_000;
const FILE_PATH = path.join(__dirname, "../../data-100m.csv");

const EVENTS = [
  "page_view",
  "button_click",
  "signup",
  "purchase",
  "logout",
  "error",
];
const PROJECTS = ["proj_alpha", "proj_beta", "proj_gamma"];

const DATES = Array.from({ length: 30 }, (_, i) => {
  return new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString();
});

console.log(
  `Streaming ${TARGET_ROWS.toLocaleString()} high-cardinality rows to disk...`,
);

const stream = fs.createWriteStream(FILE_PATH);
stream.write("project_id,event_name,user_id,payload,created_at\n");

let i = 0;

function writeChunks() {
  let ok = true;
  while (i < TARGET_ROWS && ok) {
    const eventName = EVENTS[i % EVENTS.length];
    const projectId = PROJECTS[i % PROJECTS.length];
    const date = DATES[i % DATES.length];
    const row = `${projectId},${eventName},user_${i},"{""source"":""organic""}",${date}\n`;
    const startTime = performance.now();

    ok = stream.write(row);
    i++;

    if (i % 5_000_000 === 0) {
      process.stdout.write(
        `\rGenerated ${i.toLocaleString()} rows...time(${performance.now() - startTime}) `,
      );
    }
  }

  if (i < TARGET_ROWS) {
    stream.once("drain", writeChunks);
  } else {
    stream.end();
    console.log(`\nFinished! CSV saved to ${FILE_PATH}`);
  }
}

writeChunks();
