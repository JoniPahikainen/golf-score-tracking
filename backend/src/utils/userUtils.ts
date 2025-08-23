import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const userIdSchema = z.object({
  userId: z.string().uuid("Invalid user ID format")
});

export const usernameSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters")
});

export const emailSchema = z.object({
  email: z.string().email("Invalid email format")
});

export const paginationSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional()
});

export const updatePasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters")
});

export const validate =
  (schema: z.ZodTypeAny, source: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.issues.map(e => e.message).join(", ")
      });
    }
    req[source] = result.data;
    next();
  };
