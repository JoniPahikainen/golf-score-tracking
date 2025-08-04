import { Router } from "express";
import { createCourse, deleteCourse, getAllCourses, getCourseById } from "../../db";
import { Course } from "../../db/types";

const router = Router();

// Validate course input
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

// Get a course by ID
router.get("/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    if (!courseId) return res.status(400).json({ error: "Missing course ID" });
    const course = await getAllCourses().then(courses => courses.find(c => c.id === courseId));
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  }
  catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Get all unique tees for a course
router.get("/:courseId/tees", async (req, res) => {
  try {
    const course = await getCourseById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const teesMap = new Map();
    course.holes.forEach(hole => {
      hole.tees.forEach(tee => {
        if (!teesMap.has(tee.teeId)) {
          teesMap.set(tee.teeId, {
            id: tee.teeId,
            name: tee.teeName,
            courseId: course.id,
            courseName: course.name
          });
        }
      });
    });

    res.json(Array.from(teesMap.values()));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get details for a specific tee on a course
router.get("/:courseId/tees/:teeId", async (req, res) => {
  try {
    const course = await getCourseById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const teeData = {
      id: req.params.teeId,
      name: "",
      courseId: course.id,
      courseName: course.name,
      holes: [] as Array<{
        holeNumber: number;
        par: number;
        length: number;
        strokeIndex?: number;
      }>
    };

    for (const hole of course.holes) {
      const tee = hole.tees.find(t => t.teeId === req.params.teeId);
      if (tee) {
        if (!teeData.name) {
          teeData.name = tee.teeName;
        }
        teeData.holes.push({
          holeNumber: hole.holeNumber,
          par: hole.par,
          length: tee.length,
          strokeIndex: tee.strokeIndex
        });
      }
    }

    if (teeData.holes.length === 0) {
      return res.status(404).json({ error: "Tee not found on this course" });
    }

    res.json(teeData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new course
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

// Delete a course
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

// Get all courses
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