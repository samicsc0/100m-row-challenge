import cron from "node-cron";
import { db } from "../db/connection";
import { sql } from "drizzle-orm";

export function startViewRefreshWorker() {
  console.log(
    "Background worker: Materialized View Refresh scheduled (every 5m).",
  );
  cron.schedule("*/5 * * * *", async () => {
    console.log(
      "[Worker] Starting concurrent refresh of daily_events_rollup...",
    );
    const start = performance.now();

    try {
      await db.execute(
        sql`REFRESH MATERIALIZED VIEW CONCURRENTLY daily_events_rollup;`,
      );

      const end = performance.now();
      console.log(
        `[Worker] Refresh completed seamlessly in ${((end - start) / 1000).toFixed(2)}s`,
      );
    } catch (error) {
      console.error("[Worker] Refresh failed:", error);
    }
  });
}
