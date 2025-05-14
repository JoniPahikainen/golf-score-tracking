import { Router } from "express";

const router = Router();

// simple GET route
router.get("/score", (req, res) => {
  res.json({ score: 72 });
});

export default router;
