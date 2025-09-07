import { Router } from "express";
import { createCourse, deleteCourse, getAllCourses, getCourseById, updateCourse } from "../../db";
import { CreateCourseRequest, ApiResponse } from "../../db/types";
import { transformHolesToTeeSets, validateCourseInput } from "../../utils/courseUtils";

const router = Router();

// Get all courses
router.get("/", async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const courses = await getAllCourses(includeInactive);
    
    res.json({ 
      success: true,
      data: courses 
    } as ApiResponse<typeof courses>);
  } catch (e) {
    console.error("Error getting courses:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Get course by ID
router.get("/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing course ID" 
      } as ApiResponse<never>);
    }

    const includeInactive = req.query.includeInactive === 'true';
    const course = await getCourseById(courseId, includeInactive);

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: "Course not found" 
      } as ApiResponse<never>);
    }

    res.json({ 
      success: true,
      data: course 
    } as ApiResponse<typeof course>);
  } catch (e) {
    console.error("Error getting course by ID:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Get tees for a specific course
router.get("/:courseId/tees", async (req, res) => {
  const { courseId } = req.params;
  
  if (!courseId) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing course ID" 
    } as ApiResponse<never>);
  }

  try {
    const course = await getCourseById(courseId, false);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: "Course not found" 
      } as ApiResponse<never>);
    }

    const teeSets = transformHolesToTeeSets(courseId, course.holes || []);

  res.json({ 
      success: true,
      data: teeSets 
    } as ApiResponse<typeof teeSets>);
  } catch (error) {
    console.error("Error getting course tees:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    } as ApiResponse<never>);
  }
});


// Create a new course
router.post("/", async (req, res) => {
  try {
    const { valid, message } = validateCourseInput(req.body);
    if (!valid) {
      return res.status(400).json({ 
        success: false, 
        error: message 
      } as ApiResponse<never>);
    }

    const courseRequest: CreateCourseRequest = {
      name: req.body.name.trim(),
      location: req.body.location?.trim(),
      description: req.body.description?.trim(),
      holes: req.body.holes.map((hole: any) => ({
        holeNumber: hole.holeNumber,
        par: hole.par,
        handicapRanking: hole.handicapRanking,
        tees: hole.tees.map((tee: any) => ({
          teeName: tee.teeName.trim(),
          teeColor: tee.teeColor,
          length: tee.length
        }))
      })),
    };

    const id = await createCourse(courseRequest);
    
    res.status(201).json({ 
      success: true,
      data: { courseId: id },
      message: "Course created successfully"
    } as ApiResponse<{ courseId: string }>);
  } catch (e) {
    console.error("Error creating course:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Update a course
router.put("/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing course ID" 
      } as ApiResponse<never>);
    }

    const updated = await updateCourse(courseId, req.body);
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: "Course not found" 
      } as ApiResponse<never>);
    }

    res.json({ 
      success: true,
      message: "Course updated successfully" 
    } as ApiResponse<never>);
  } catch (e) {
    console.error("Error updating course:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Delete a course 
router.delete("/:courseId", async (req, res) => {
  const { courseId } = req.params;
  
  if (!courseId) {
    return res.status(400).json({ success: false, error: "Missing course ID" } as ApiResponse<never>);
  }

  try {
    const deleted = await deleteCourse(courseId);
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Course not found" } as ApiResponse<never>);
    }

    res.json({ success: true, message: "Course deleted successfully" } as ApiResponse<never>);
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

export default router;
