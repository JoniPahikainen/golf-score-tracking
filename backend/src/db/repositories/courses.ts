import { supabase } from "../supabase";
import { Course } from "../types";

export const createCourse = async (course: Omit<Course, "id">): Promise<string> => {
  // Start a transaction to create course and related data
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .insert([{
      name: course.name,
      location: course.location,
      description: course.description,
      amenities: course.amenities || [],
      created_at: course.createdAt || new Date(),
      updated_at: course.updatedAt || new Date()
    }])
    .select('id')
    .single();

  if (courseError) {
    throw new Error(`Failed to create course: ${courseError.message}`);
  }

  const courseId = courseData.id;

  // Create holes and tees
  for (const hole of course.holes) {
    const { data: holeData, error: holeError } = await supabase
      .from('course_holes')
      .insert([{
        course_id: courseId,
        hole_number: hole.holeNumber,
        par: hole.par
      }])
      .select('id')
      .single();

    if (holeError) {
      throw new Error(`Failed to create hole ${hole.holeNumber}: ${holeError.message}`);
    }

    const holeId = holeData.id;

    // Create tees for this hole
    if (hole.tees && hole.tees.length > 0) {
      const teesData = hole.tees.map(tee => ({
        hole_id: holeId,
        tee_id: tee.teeId,
        tee_name: tee.teeName,
        length: tee.length,
        stroke_index: tee.strokeIndex
      }));

      const { error: teesError } = await supabase
        .from('course_tees')
        .insert(teesData);

      if (teesError) {
        throw new Error(`Failed to create tees for hole ${hole.holeNumber}: ${teesError.message}`);
      }
    }
  }

  return courseId;
};

export const deleteCourse = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete course: ${error.message}`);
  }

  return true;
};

export const getAllCourses = async (): Promise<Course[]> => {
  // Get courses with their holes and tees
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select(`
      *,
      course_holes (
        id,
        hole_number,
        par,
        course_tees (
          tee_id,
          tee_name,
          length,
          stroke_index
        )
      )
    `)
    .order('name');

  if (coursesError) {
    throw new Error(`Failed to get courses: ${coursesError.message}`);
  }

  return coursesData.map(course => ({
    id: course.id,
    name: course.name,
    location: course.location,
    description: course.description,
    holes: course.course_holes
      .sort((a: any, b: any) => a.hole_number - b.hole_number)
      .map((hole: any) => ({
        holeNumber: hole.hole_number,
        par: hole.par,
        tees: hole.course_tees.map((tee: any) => ({
          teeId: tee.tee_id,
          teeName: tee.tee_name,
          length: tee.length,
          strokeIndex: tee.stroke_index
        }))
      })),
    amenities: course.amenities || [],
    createdAt: course.created_at ? new Date(course.created_at) : new Date(),
    updatedAt: course.updated_at ? new Date(course.updated_at) : new Date()
  }));
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select(`
      *,
      course_holes (
        id,
        hole_number,
        par,
        course_tees (
          tee_id,
          tee_name,
          length,
          stroke_index
        )
      )
    `)
    .eq('id', id)
    .single();

  if (courseError) {
    if (courseError.code === 'PGRST116') return null; // No rows found
    throw new Error(`Failed to get course: ${courseError.message}`);
  }

  return {
    id: courseData.id,
    name: courseData.name,
    location: courseData.location,
    description: courseData.description,
    holes: courseData.course_holes
      .sort((a: any, b: any) => a.hole_number - b.hole_number)
      .map((hole: any) => ({
        holeNumber: hole.hole_number,
        par: hole.par,
        tees: hole.course_tees.map((tee: any) => ({
          teeId: tee.tee_id,
          teeName: tee.tee_name,
          length: tee.length,
          strokeIndex: tee.stroke_index
        }))
      })),
    amenities: courseData.amenities || [],
    createdAt: courseData.created_at ? new Date(courseData.created_at) : new Date(),
    updatedAt: courseData.updated_at ? new Date(courseData.updated_at) : new Date()
  };
};