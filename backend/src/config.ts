import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; // **CHANGE THIS IN PRODUCTION**
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // e.g., '1h', '30d', '7d'