import { db as firestore } from "../../firebase";
import { Course } from "../types";

const collection = firestore.collection("courses");

export const createCourse = async (course: Omit<Course, "id">): Promise<string> => {
  const ref = await collection.add(course);
  return ref.id;
};

export const deleteCourse = async (id: string): Promise<boolean> => {
  const ref = collection.doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.delete();
  return true;
};

export const getAllCourses = async (): Promise<Course[]> => {
  const snap = await collection.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Course, "id">) }));
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<Course, "id">) };
};