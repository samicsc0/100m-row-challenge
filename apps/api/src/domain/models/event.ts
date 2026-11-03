import z from "zod";

export const EventSchema = z.object({
  id: z.number().optional(),
  projectId: z.string().max(50),
  eventName: z.string().max(50),
  userId: z.string().max(100),
  payload: z.json(),
  createdAt: z.date().optional(),
});

export type Event = z.infer<typeof EventSchema>;
