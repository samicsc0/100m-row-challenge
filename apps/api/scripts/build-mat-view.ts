import { db } from "../src/infrastructure/db/connection";
import { sql } from "drizzle-orm";

async function buildMatView() {
  console.log("Building Materialized View...");

  const start = performance.now();
  await db.execute(sql`
    CREATE MATERIALIZED VIEW daily_events_rollup AS
    SELECT 
      project_id, 
      event_name, 
      date_trunc('day', created_at) as day, 
      count(*) as total_events
    FROM events
    GROUP BY 1, 2, 3;
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX daily_events_idx ON daily_events_rollup(project_id, event_name, day);
  `);

  const end = performance.now();
  console.log(
    `Materialized View built in ${((end - start) / 1000).toFixed(2)} seconds!`,
  );
  process.exit(0);
}

buildMatView().catch(console.error);
