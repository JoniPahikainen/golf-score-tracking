import { db as firestore } from "../firebase";
import { User, Round, Course } from "./types";



const collectionCourses = firestore.collection("courses");
const collectionRounds = firestore.collection("rounds");
const collectionUsers = firestore.collection("users");


export async function createUser(user: Omit<User, "id">): Promise<string> {
  const ref = await collectionUsers.add(user);
  return ref.id;
}

export async function getUserById(id: string): Promise<User | null> {
  const doc = await collectionUsers.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<User, "id">) };
}

export async function getAllUsers(safe: boolean = true): Promise<User[]> {
  const snap = await collectionUsers.get();
  return snap.docs.map((doc) => {
    const data = doc.data() as Omit<User, "id">;
    if (safe) delete data.password;
    return { id: doc.id, ...data };
  });
}

export async function getUserByUsername(userName: string): Promise<User | null> {
  const snap = await collectionUsers.where("userName", "==", userName).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<User, "id">) };
}

export async function deleteUser(id: string): Promise<boolean> {
  const ref = collectionUsers.doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.delete();
  return true;
}

export async function createRound(round: Omit<Round, "id">): Promise<string> {
  const ref = await collectionRounds.add(round);
  return ref.id;
}

export async function updateRound(id: string, updates: Partial<Round>): Promise<boolean> {
  const ref = collectionRounds.doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.update({ ...updates, updatedAt: new Date() });
  return true;
}

export async function deleteRound(id: string): Promise<boolean> {
  const ref = collectionRounds.doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.delete();
  return true;
}

export async function getRoundsByUserId(userId: string): Promise<Round[]> {
  const snap = await collectionRounds.where("players.userId", "==", userId).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Round, "id">) }));
}

export async function createCourse(course: Omit<Course, "id">): Promise<string> {
  const ref = await collectionCourses.add(course);
  return ref.id;
}

export async function deleteCourse(id: string): Promise<boolean> {
  const ref = collectionCourses.doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.delete();
  return true;
}

export async function getAllCourses(): Promise<Course[]> {
  const snap = await collectionCourses.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Course, "id">) }));
}