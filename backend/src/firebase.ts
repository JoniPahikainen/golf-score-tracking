import admin from "firebase-admin";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const rawPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!rawPath) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH is not defined in .env");
}

const serviceAccountPath = path.resolve(__dirname, "..", rawPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export const db = admin.firestore();
