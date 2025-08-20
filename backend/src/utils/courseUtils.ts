import { TeeSet } from "../db";
import z from "zod";

const teeSchema = z.object({
  teeName: z.string().min(2).max(100),
  teeColor: z.string().optional(),
  length: z.number().min(40).max(700, "Tee length must be between 40 and 700 meters")
});

const holeSchema = z.object({
  holeNumber: z.number().min(1).max(18),
  par: z.number().min(3).max(6),
  handicapRanking: z.number().min(1).max(18).optional(),
  tees: z.array(teeSchema).min(1, "Each hole must have at least one tee")
});

const courseSchema = z.object({
  name: z.string().min(2, "Course name must be at least 2 characters"),
  location: z.string().optional(),
  description: z.string().optional(),
  holes: z.array(holeSchema).refine(
    holes => holes.length === 9 || holes.length === 18,
    "Course must have exactly 9 or 18 holes"
  )
});

export function transformHolesToTeeSets(courseId: string, holes: any[]) {
  const teeSets = new Map<string, TeeSet>();

  holes.forEach(hole => {
    (hole.tees || []).forEach((tee: { teeName: any; teeColor: any; length: any; }) => {
      const teeName = tee.teeName;
      
      if (!teeSets.has(teeName)) {
        teeSets.set(teeName, {
          id: `${courseId}-${teeName.toLowerCase()}`,
          name: teeName,
          courseId,
          color: tee.teeColor,
          holes: []
        });
      }
      
      teeSets.get(teeName)?.holes.push({
        holeNumber: hole.holeNumber,
        length: tee.length,
        par: hole.par
      });
    });
  });

  return Array.from(teeSets.values());
}

export function validateCourseInput(body: any): { valid: boolean; message?: string } {
  try {
    courseSchema.parse(body);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, message: error.issues[0].message };
    }
    return { valid: false, message: "Invalid course data" };
  }
}

