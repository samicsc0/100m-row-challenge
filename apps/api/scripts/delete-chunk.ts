import { db } from "../src/infrastructure/db/connection";
import { sql } from "drizzle-orm";
import { performance } from "perf_hooks";

const BATCH_SIZE = 10000;
const SLEEP_MS = 50;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDataRetention() {
  console.log(`Starting chunked deletion (Batch Size: ${BATCH_SIZE})...`);
  let totalDeleted = 0;
  let hasMore = true;

  const startTime = performance.now();

  while (hasMore) {
    const result = await db.execute(sql`
      DELETE FROM events 
      WHERE ctid IN (
        SELECT ctid FROM events 
        WHERE event_name = 'error' 
        LIMIT ${BATCH_SIZE}
      )
      RETURNING 1;
    `);

    const deletedThisBatch = result.length;
    totalDeleted += deletedThisBatch;

    if (deletedThisBatch < BATCH_SIZE) {
      hasMore = false;
    } else {
      process.stdout.write(
        `\rDeleted ${totalDeleted.toLocaleString()} rows so far...`,
      );
      await sleep(SLEEP_MS);
    }
  }

  const endTime = performance.now();
  console.log(
    `\n Retention complete. Deleted ${totalDeleted.toLocaleString()} rows in ${((endTime - startTime) / 1000).toFixed(2)}s`,
  );

  console.log("Running background VACUUM to prevent table bloat...");
  await db.execute(sql`VACUUM events;`);
  console.log("Vacuum complete.");

  process.exit(0);
}

runDataRetention().catch(console.error);
