import { z } from "zod";

export const eventCreationSchema = z.object({
  name: z
    .string()
    .min(3, "Name must have at least 3 characters")
    .max(255, "Name must have under 255 characters")
    .trim(),
});
