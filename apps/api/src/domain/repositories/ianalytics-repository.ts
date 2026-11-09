import type { Event } from "../models/event";
export interface IAnalyticsRepository {
  getEventCount(projectName: string, eventName: string): Promise<number>;
  insertEvent(event: Event): Promise<void>;
}
