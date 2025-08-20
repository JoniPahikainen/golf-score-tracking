import { supabase } from "../supabase";
import { Course, CreateCourseRequest, DatabaseError } from "../types";

// Utility function for consistent error handling
const handleSupabaseError = (error: any, context: string): DatabaseError => {
  const dbError = new Error(`${context}: ${error.message}`) as DatabaseError;
  dbError.code = error.code;
  dbError.detail = error.details;
  return dbError;
};

// Common course fields for selects
const COURSE_SELECT_FIELDS = `
  *,
  course_holes (
    id,
    hole_number,
    par,
    handicap_ranking,
    description,
    course_tees (
      id,
      tee_name,
      tee_color,
      length,
      course_rating,
      slope_rating
    )
  )
`;

// Transform raw course data to consistent format
const transformCourseData = (courseData: any): Course => ({
  id: courseData.id,
  name: courseData.name,
  location: courseData.location,
  description: courseData.description,
  websiteUrl: courseData.website_url,
  phone: courseData.phone,
  email: courseData.email,
  address: courseData.address,
  city: courseData.city,
  state: courseData.state,
  country: courseData.country,
  postalCode: courseData.postal_code,
  latitude: courseData.latitude,
  longitude: courseData.longitude,
  parTotal: courseData.par_total,
  holeCount: courseData.hole_count,
  designer: courseData.designer,
  yearBuilt: courseData.year_built,
  courseType: courseData.course_type,
  amenities: courseData.amenities || [],
  courseRating: courseData.course_rating,
  slopeRating: courseData.slope_rating,
  isActive: courseData.is_active,
  holes: (courseData.course_holes || [])
    .sort((a: any, b: any) => a.hole_number - b.hole_number)
    .map((hole: any) => ({
      id: hole.id,
      courseId: courseData.id,
      holeNumber: hole.hole_number,
      par: hole.par,
      handicapRanking: hole.handicap_ranking,
      description: hole.description,
      tees: (hole.course_tees || []).map((tee: any) => ({
        id: tee.id,
        holeId: hole.id,
        teeName: tee.tee_name,
        teeColor: tee.tee_color,
        length: tee.length,
        courseRating: tee.course_rating,
        slopeRating: tee.slope_rating,
      })),
    })),
  createdAt: new Date(courseData.created_at),
  updatedAt: new Date(courseData.updated_at),
});

export const createCourse = async (
  course: CreateCourseRequest
): Promise<string> => {
  try {
    const totalPar = course.holes.reduce((sum, hole) => sum + hole.par, 0);
    const now = new Date();

    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .insert({
        name: course.name,
        location: course.location,
        description: course.description,
        par_total: totalPar,
        hole_count: course.holes.length,
        course_type: course.courseType || "public",
        amenities: course.amenities || [],
        is_active: true,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single();

    if (courseError)
      throw handleSupabaseError(courseError, "Failed to create course");

    const courseId = courseData.id;

    await Promise.all(
      course.holes.map(async (hole) => {
        const { data: holeData, error: holeError } = await supabase
          .from("course_holes")
          .insert({
            course_id: courseId,
            hole_number: hole.holeNumber,
            par: hole.par,
            handicap_ranking: hole.handicapRanking,
          })
          .select("id")
          .single();

        if (holeError)
          throw handleSupabaseError(
            holeError,
            `Failed to create hole ${hole.holeNumber}`
          );

        if (hole.tees?.length) {
          const { error: teesError } = await supabase
            .from("course_tees")
            .insert(
              hole.tees.map((tee) => ({
                hole_id: holeData.id,
                tee_name: tee.teeName,
                tee_color: tee.teeColor,
                length: tee.length,
              }))
            );

          if (teesError)
            throw handleSupabaseError(
              teesError,
              `Failed to create tees for hole ${hole.holeNumber}`
            );
        }
      })
    );

    return courseId;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error occurred while creating course");
  }
};

export const deleteCourseSoft = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("courses")
      .update({ is_active: false, updated_at: new Date() })
      .eq("id", id);

    if (error) throw handleSupabaseError(error, "Failed to delete course");
    return true;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error occurred while deleting course");
  }
};

export const deleteCourse = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) throw handleSupabaseError(error, "Failed to delete course");
    return true;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error occurred while deleting course");
  }
};

export const getAllCourses = async (
  includeInactive: boolean = false
): Promise<Course[]> => {
  try {
    let query = supabase
      .from("courses")
      .select(COURSE_SELECT_FIELDS)
      .order("name");

    if (!includeInactive) query = query.eq("is_active", true);

    const { data: coursesData, error } = await query;

    if (error) throw handleSupabaseError(error, "Failed to get courses");

    return coursesData?.map(transformCourseData) || [];
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error occurred while getting courses");
  }
};

export const getCourseById = async (
  id: string,
  includeInactive: boolean = false
): Promise<Course | null> => {
  try {
    let query = supabase
      .from("courses")
      .select(COURSE_SELECT_FIELDS)
      .eq("id", id);

    if (!includeInactive) query = query.eq("is_active", true);

    const { data: courseData, error } = await query.single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw handleSupabaseError(error, "Failed to get course");
    }

    return transformCourseData(courseData);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error occurred while getting course");
  }
};

export const updateCourse = async (
  id: string,
  updates: Partial<Course>
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.websiteUrl !== undefined)
      updateData.website_url = updates.websiteUrl;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.state !== undefined) updateData.state = updates.state;
    if (updates.country !== undefined) updateData.country = updates.country;
    if (updates.postalCode !== undefined)
      updateData.postal_code = updates.postalCode;
    if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
    if (updates.longitude !== undefined)
      updateData.longitude = updates.longitude;
    if (updates.designer !== undefined) updateData.designer = updates.designer;
    if (updates.yearBuilt !== undefined)
      updateData.year_built = updates.yearBuilt;
    if (updates.courseType !== undefined)
      updateData.course_type = updates.courseType;
    if (updates.amenities !== undefined)
      updateData.amenities = updates.amenities;
    if (updates.courseRating !== undefined)
      updateData.course_rating = updates.courseRating;
    if (updates.slopeRating !== undefined)
      updateData.slope_rating = updates.slopeRating;

    const { error } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", id);

    if (error) throw handleSupabaseError(error, "Failed to update course");
    return true;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error occurred while updating course");
  }
};
