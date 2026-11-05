import { sql, eq } from "drizzle-orm";
import { db } from "../src/infrastructure/db/connection";
import { events } from "../src/infrastructure/db/schema";
import * as os from "os";

async function measurep95() {
  await db.execute(sql`SELECT 1`);
  const iterations = 50;
  const times: number[] = [];
  const cpu = os.cpus()[0].model.trim();
  const ramGB = Math.round(os.totalmem() / 1024 ** 3);

  console.log("\n=======================================");
  console.log("       POSTGRESQL BENCHMARK RUN        ");
  console.log("=======================================");
  console.log(`Machine: Lenovo ThinkPad L14 Gen 1`);
  console.log(`OS:      Ubuntu Linux (KDE Plasma)`);
  console.log(`CPU:     ${cpu}`);
  console.log(`RAM:     ${ramGB} GB`);
  console.log("=======================================\n");
  console.log(`Running ${iterations} queries to establish baseline...`);
  console.log(
    "Warning: This will take a while because we have ZERO indexes.\n",
  );
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(eq(events.eventName, "page_view"));

    const end = performance.now();
    times.push(end - start);

    process.stdout.write(
      `\rCompleted ${i + 1}/${iterations} queries (Last took ${(end - start).toFixed(0)}ms)`,
    );
  }
  console.log("\n\n--- Baseline Results (No Indexes) ---");
  times.sort((a, b) => a - b);

  const p95Index = Math.floor(times.length * 0.95) - 1;
  const p95 = times[p95Index];
  const avg = times.reduce((a, b) => a + b, 0) / times.length;

  console.log(`Average Time: ${avg.toFixed(2)} ms`);
  console.log(`p95 Time:     ${p95!.toFixed(2)} ms`);

  process.exit(0);
}
measurep95();
