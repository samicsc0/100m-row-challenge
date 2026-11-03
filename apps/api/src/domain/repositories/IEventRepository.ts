import type { Event } from "../models/event";
export interface IEventRepository {
  insert(event: Event): Promise<void>;
  countAll(): Promise<number>;
}
