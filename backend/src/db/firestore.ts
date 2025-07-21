import { db as firestore } from "../firebase";
import { User } from "./types";

export async function createUser(user: Omit<User, "id">): Promise<string> {
  const ref = await firestore.collection("users").add(user);
  return ref.id;
}

export async function getUserById(id: string): Promise<User | null> {
  const doc = await firestore.collection("users").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<User, "id">) };
}

export async function getAllUsers(safe: boolean = true): Promise<User[]> {
  const snap = await firestore.collection("users").get();
  return snap.docs.map((doc) => {
    const data = doc.data() as Omit<User, "id">;
    if (safe) delete data.password;
    return { id: doc.id, ...data };
  });
}

export async function getUserByUsername(userName: string): Promise<User | null> {
  const snap = await firestore.collection("users").where("userName", "==", userName).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<User, "id">) };
}

export async function deleteUser(id: string): Promise<boolean> {
  const ref = firestore.collection("users").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.delete();
  return true;
}