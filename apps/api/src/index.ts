import { Hono } from "hono";
import { startViewRefreshWorker } from "./infrastructure/workers/view-refresh";
import {
  getProjectAnalytics,
  trackEvent,
} from "./presentation/controller/analytics.controller";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/api/v1/analytics/events", getProjectAnalytics);
app.post("/api/v1/analytics/events", trackEvent);

startViewRefreshWorker();

export default {
  port: 3000,
  fetch: app.fetch,
};
