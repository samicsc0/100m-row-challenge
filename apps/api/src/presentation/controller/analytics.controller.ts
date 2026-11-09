import { Context } from "hono";
import { AnalyticsRepository } from "../../infrastructure/db/implementations/analytics-repository";
import z from "zod";

const eventSchema = z.object({
  projectId: z.string().min(1),
  eventName: z.string().min(1),
  userId: z.string().min(1),
  payload: z.record(z.string(), z.any()).default({}),
});

const analyticsRepo = new AnalyticsRepository();

export const getProjectAnalytics = async (c: Context) => {
  const projectId = c.req.query("projectId");
  const eventName = c.req.query("eventName");

  if (!projectId || !eventName) {
    return c.json(
      { error: "Missing projectId or eventName in query parameters" },
      400,
    );
  }

  try {
    const start = performance.now();
    const totalCount = await analyticsRepo.getEventCount(projectId, eventName);
    const end = performance.now();

    return c.json({
      success: true,
      data: {
        projectId,
        eventName,
        totalCount,
      },
      meta: {
        dbLatencyMs: parseFloat((end - start).toFixed(2)),
      },
    });
  } catch (error) {
    console.error("[AnalyticsController] Error fetching stats:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export const trackEvent = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = eventSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Invalid payload", details: result.error.format() },
        400,
      );
    }
    analyticsRepo.insertEvent(result.data).catch((err) => {
      console.error("[AnalyticsController] Failed to ingest event:", err);
    });

    return c.json({ success: true }, 202);
  } catch (error) {
    return c.json({ error: "Invalid JSON", stackTrace: error }, 400);
  }
};
