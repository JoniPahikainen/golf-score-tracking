import { Router } from "express";
import { createCourse, deleteCourse, getAllCourses, getCourseById, updateCourse } from "../../db";
import { CreateCourseRequest, ApiResponse, TeeColor } from "../../db/types";

const router = Router();

function validateCourseInput(body: any): { valid: boolean; message?: string } {
  if (!body.name || body.name.trim().length < 2) {
    return { valid: false, message: "Course name must be at least 2 characters" };
  }
  
  if (!Array.isArray(body.holes) || body.holes.length === 0) {
    return { valid: false, message: "Course must have at least one hole" };
  }

  if (body.holes.length !== 9 && body.holes.length !== 18) {
    return { valid: false, message: "Course must have exactly 9 or 18 holes" };
  }

  for (const hole of body.holes) {
    if (typeof hole.holeNumber !== "number" || hole.holeNumber < 1 || hole.holeNumber > 18) {
      return { valid: false, message: "Each hole must have a valid holeNumber (1-18)" };
    }
    
    if (typeof hole.par !== "number" || hole.par < 3 || hole.par > 6) {
      return { valid: false, message: `Hole ${hole.holeNumber} must have par between 3 and 6` };
    }
    
    if (!Array.isArray(hole.tees) || hole.tees.length === 0) {
      return { valid: false, message: `Hole ${hole.holeNumber} must have at least one tee` };
    }
    
    for (const tee of hole.tees) {
      if (!tee.teeName || tee.teeName.trim().length === 0) {
        return { valid: false, message: `Tee in hole ${hole.holeNumber} must have a name` };
      }
      
      if (typeof tee.length !== "number" || tee.length < 50 || tee.length > 700) {
        return { valid: false, message: `Tee length in hole ${hole.holeNumber} must be between 50 and 700 yards` };
      }
    }
  }
  return { valid: true };
}

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
  try {
    const courseId = req.params.courseId;
    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing course ID" 
      } as ApiResponse<never>);
    }

    const course = await getCourseById(courseId, false);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: "Course not found" 
      } as ApiResponse<never>);
    }

    const teeSets = new Map<string, {
      id: string;
      name: string;
      courseId: string;
      color?: TeeColor;
      holes: {
        holeNumber: number;
        length: number;
        par: number;
      }[];
    }>();

    (course.holes || []).forEach(hole => {
      (hole.tees || []).forEach(tee => {
        if (!teeSets.has(tee.teeName)) {
          teeSets.set(tee.teeName, {
            id: `${courseId}-${tee.teeName.toLowerCase()}`,
            name: tee.teeName,
            courseId,
            color: tee.teeColor,
            holes: []
          });
        }
        teeSets.get(tee.teeName)?.holes.push({
          holeNumber: hole.holeNumber,
          length: tee.length,
          par: hole.par
        });
      });
    });

    const result = Array.from(teeSets.values());

    res.json({ 
      success: true,
      data: result 
    } as ApiResponse<typeof result>);
  } catch (e) {
    console.error("Error getting course tees:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
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
      amenities: req.body.amenities || [],
      courseType: req.body.courseType || 'public'
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

// Delete a course (soft delete)
router.delete("/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing course ID" 
      } as ApiResponse<never>);
    }

    const deleted = await deleteCourse(courseId);
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: "Course not found" 
      } as ApiResponse<never>);
    }

    res.json({ 
      success: true,
      message: "Course deleted successfully" 
    } as ApiResponse<never>);
  } catch (e) {
    console.error("Error deleting course:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

export default router;
