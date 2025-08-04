import { db as firestore } from "../../firebase";
import { User } from "../types";

const collection = firestore.collection("users");

export const createUser = async (user: Omit<User, "id">): Promise<string> => {
  const ref = await collection.add(user);
  return ref.id;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<User, "id">) };
};

export const getAllUsers = async (safe: boolean = true): Promise<User[]> => {
  const snap = await collection.get();
  return snap.docs.map((doc) => {
    const data = doc.data() as Omit<User, "id">;
    if (safe) delete data.password;
    return { id: doc.id, ...data };
  });
};

export const getUserByUsername = async (userName: string): Promise<User | null> => {
  const snap = await collection.where("userName", "==", userName).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<User, "id">) };
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const ref = collection.doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.delete();
  return true;
};

export const deleteUserByUsername = async (username: string): Promise<boolean> => {
  try {
    const querySnapshot = await collection.where('userName', '==', username).get();
    if (querySnapshot.empty) return false;
    await querySnapshot.docs[0].ref.delete();
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};