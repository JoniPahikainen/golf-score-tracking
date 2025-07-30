import { Router } from "express";
import { createCourse, deleteCourse, getAllCourses } from "../db/firestore";
import { Course } from "../db/types";

const router = Router();

function validateCourseInput(body: any): { valid: boolean; message?: string } {
  if (!body.name) return { valid: false, message: "Missing required field: name" };
  if (!body.holes || !Array.isArray(body.holes) || body.holes.length === 0) {
    return { valid: false, message: "Missing or invalid field: holes" };
  }

  for (const hole of body.holes) {
    if (typeof hole.holeNumber !== "number") return { valid: false, message: "Each hole must have a valid holeNumber" };
    if (typeof hole.par !== "number") return { valid: false, message: `Hole ${hole.holeNumber} missing par` };
    if (!Array.isArray(hole.tees) || hole.tees.length === 0) {
      return { valid: false, message: `Hole ${hole.holeNumber} missing tees` };
    }
    for (const tee of hole.tees) {
      if (!tee.teeId || !tee.teeName || typeof tee.length !== "number") {
        return { valid: false, message: `Tee in hole ${hole.holeNumber} missing required fields` };
      }
    }
  }

  return { valid: true };
}


router.post("/", async (req, res) => {
  try {
    const { valid, message } = validateCourseInput(req.body);
    if (!valid) return res.status(400).json({ error: message });

    const course: Omit<Course, "id"> = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const id = await createCourse(course);
    res.status(201).json({ message: "Course created", courseId: id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    if (!courseId) return res.status(400).json({ error: "Missing course ID" });
    
    const deleted = await deleteCourse(req.params.courseId);
    if (!deleted) return res.status(404).json({ error: "Course not found" });
    res.json({ message: "Course deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;