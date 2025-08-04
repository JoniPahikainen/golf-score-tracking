import { db as firestore } from "../../firebase";
import { Round } from "../types";

const collection = firestore.collection("rounds");

export const createRound = async (round: Omit<Round, "id">): Promise<string> => {
  const ref = await collection.add(round);
  return ref.id;
};

export const updateRound = async (id: string, updates: Partial<Round>): Promise<boolean> => {
  const ref = collection.doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.update({ ...updates, updatedAt: new Date() });
  return true;
};

export const deleteRound = async (id: string): Promise<boolean> => {
  const ref = collection.doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.delete();
  return true;
};

export const getRoundsByUserId = async (userId: string): Promise<Round[]> => {
  const snap = await collection.where("players.userId", "==", userId).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Round, "id">) }));
};

export const getRoundById = async (id: string): Promise<Round | null> => {
  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<Round, "id">) };
};