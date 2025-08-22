import { z } from 'zod';

export const createRoundSchema = z.object({
  courseId: z.string().min(1, "Missing required field: courseId"),
  date: z.string().min(1, "Missing required field: date"),
  teeName: z.string().min(1, "Missing required field: teeName"),
  title: z.string().optional(),
  notes: z.string().optional(),
  players: z.array(z.object({
    userId: z.string().min(1, "Each player must have a userId"),
    handicapAtTime: z.number().min(0).optional()
  })).min(1, "Missing or invalid field: players")
});

export type CreateRoundRequest = z.infer<typeof createRoundSchema>;

export function validateRoundInput(body: any): { valid: boolean; message?: string } {
  try {
    createRoundSchema.parse(body);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, message: error.issues[0].message };
    }
    return { valid: false, message: "Invalid round data" };
  }
}