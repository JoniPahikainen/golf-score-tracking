import { z } from 'zod';

export const createRoundSchema = z.object({
  courseId: z.string().uuid(),
  date: z.string().datetime(),
  teeName: z.string().min(1),
  title: z.string().optional(),
  notes: z.string().optional(),
  players: z.array(
    z.object({
      userId: z.string().uuid(),
      handicapAtTime: z.number().optional().default(0),
      scores: z.array(
        z.object({
          holeNumber: z.number().int().min(1).max(18),
          strokes: z.number().int().min(1).max(20),
          putts: z.number().int().min(0).max(10).optional(),
          fairwayHit: z.boolean().default(false).optional(),
          greenInRegulation: z.boolean().default(false).optional(),
          penalties: z.number().int().min(0).max(5).default(0).optional(),
        })
      )
    })
  ).min(1)
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