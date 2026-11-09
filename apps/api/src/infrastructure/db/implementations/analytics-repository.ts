import { sql } from "drizzle-orm";
import type { IAnalyticsRepository } from "../../../domain/repositories/ianalytics-repository";
import { db } from "../connection";
import type { Event } from "../../../domain/models/event";

export class AnalyticsRepository implements IAnalyticsRepository {
  async insertEvent(event: Event): Promise<void> {
    await db.execute(sql`
      INSERT INTO events (project_id, event_name, user_id, payload)
      VALUES (${event.projectId}, ${event.eventName}, ${event.userId}, ${JSON.stringify(event.payload)})
    `);
  }
  async getEventCount(projectName: string, eventName: string): Promise<number> {
    const result = await db.execute(sql`
      SELECT sum(total_events) as count 
      FROM daily_events_rollup 
      WHERE project_id = ${projectName} 
      AND event_name = ${eventName}
    `);

    const count = result[0]?.count;
    return count ? parseInt(count as string, 10) : 0;
  }
}
