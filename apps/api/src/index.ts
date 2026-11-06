import { Hono } from "hono";
import { startViewRefreshWorker } from "./infrastructure/workers/view-refresh";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

startViewRefreshWorker();

export default {
  port: 3000,
  fetch: app.fetch,
};
