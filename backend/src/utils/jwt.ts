import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface UserPayload {
  id: string;
  userName: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? (() => { throw new Error("JWT_SECRET not set"); })();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

export function generateToken(payload: UserPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any }; // safely cast
  return jwt.sign(payload, JWT_SECRET, options); // JWT_SECRET is string
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET!); // use non-null assertion
}
