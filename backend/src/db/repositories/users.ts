import { supabase } from "../supabase";
import { User, CreateUserRequest, DatabaseError } from "../types";
import bcrypt from "bcrypt";

// Define database field mappings
const USER_FIELD_MAP: Record<keyof User, string | null> = {
  id: "id",
  userName: "user_name",
  email: "email",
  password: "password_hash",
  firstName: "first_name",
  lastName: "last_name",
  handicapIndex: "handicap_index",
  dateOfBirth: "date_of_birth",
  phone: "phone",
  profilePictureUrl: "profile_picture_url",
  preferredTeeColor: "preferred_tee_color",
  isActive: "is_active",
  emailVerified: "email_verified",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

// Utility functions
const handleDatabaseError = (context: string, error: any): never => {
  const dbError: DatabaseError = new Error(`${context}: ${error.message}`);
  dbError.code = error.code;
  dbError.detail = error.details;
  dbError.hint = error.hint;
  throw dbError;
};

const handleUnknownError = (error: unknown, context: string): never => {
  if (error instanceof Error) throw error;
  throw new Error(`Unknown error occurred while ${context}`);
};

const transformUserData = (data: any, includeSensitive = false): User => ({
  id: data.id,
  userName: data.user_name,
  email: data.email,
  password: includeSensitive ? data.password_hash : undefined,
  firstName: data.first_name,
  lastName: data.last_name,
  handicapIndex: data.handicap_index,
  dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
  phone: data.phone,
  profilePictureUrl: data.profile_picture_url,
  preferredTeeColor: data.preferred_tee_color,
  isActive: data.is_active,
  emailVerified: data.email_verified,
  createdAt: data.created_at ? new Date(data.created_at) : undefined,
  updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
});

// User creation
export const createUser = async (userData: CreateUserRequest): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([{
        user_name: userData.userName,
        email: userData.email,
        password_hash: await bcrypt.hash(userData.password, 12),
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        date_of_birth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
        is_active: true,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      }])
      .select("id")
      .single();

    if (error) handleDatabaseError("Failed to create user", error);
    if (!data) throw new Error("No data returned from user creation");
    
    return data.id;
  } catch (error) {
    handleUnknownError(error, "creating user");
    return "";
  }
};

// User retrieval
export const getUserById = async (
  id: string, 
  includeSensitive = false
): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) handleDatabaseError("Failed to get user", error);
    
    return transformUserData(data, includeSensitive);
  } catch (error) {
    handleUnknownError(error, "getting user");
    return null;
  }
};

export const getUserByField = async (
  field: keyof Pick<User, "userName" | "email">,
  value: string,
  includeSensitive = false
): Promise<User | null> => {
  try {
    const dbField = USER_FIELD_MAP[field === "userName" ? "userName" : "email"];
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq(dbField!, value)
      .eq("is_active", true)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) handleDatabaseError(`Failed to get user by ${field}`, error);
    
    return transformUserData(data, includeSensitive);
  } catch (error) {
    handleUnknownError(error, "getting user by field");
    return null;
  }
};

export const getAllUsers = async (
  safe = true,
  limit?: number,
  offset?: number
): Promise<User[]> => {
  try {
    let query = supabase
      .from("users")
      .select("*")
      .eq("is_active", true);

    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + (limit || 10) - 1);

    const { data, error } = await query;
    if (error) handleDatabaseError("Failed to get users", error);
    
    return (data || []).map(user => transformUserData(user, !safe));
  } catch (error) {
    handleUnknownError(error, "getting users");
    return [];
  }
};

// User updates
export const updateUser = async (
  id: string,
  updates: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = { updated_at: new Date() };

    Object.entries(updates).forEach(([key, value]) => {
      const dbField = USER_FIELD_MAP[key as keyof User];
      if (value !== undefined && dbField) {
        updateData[dbField] = value;
      }
    });

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id);

    if (error) handleDatabaseError("Failed to update user", error);
    return true;
  } catch (error) {
    handleUnknownError(error, "updating user");
    return false;
  }
};

// Password operations
export const verifyPassword = async (
  userId: string,
  password: string
): Promise<boolean> => {
  try {
    const user = await getUserById(userId, true);
    return !!(user?.password && await bcrypt.compare(password, user.password));
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
};

export const updatePassword = async (
  userId: string,
  newPassword: string
): Promise<boolean> => {
  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const { error } = await supabase
      .from("users")
      .update({ 
        password_hash: passwordHash, 
        updated_at: new Date() 
      })
      .eq("id", userId);

    if (error) handleDatabaseError("Failed to update password", error);
    return true;
  } catch (error) {
    handleUnknownError(error, "updating password");
    return false;
  }
};

// User deletion
const softDeleteUser = async (
  field: keyof Pick<User, "id" | "userName" | "email">,
  value: string
): Promise<boolean> => {
  try {
    const dbField = USER_FIELD_MAP[field];
    const { error } = await supabase
      .from("users")
      .update({ 
        is_active: false, 
        updated_at: new Date() 
      })
      .eq(dbField!, value);

    if (error) handleDatabaseError(`Failed to soft delete user by ${field}`, error);
    return true;
  } catch (error) {
    handleUnknownError(error, "soft deleting user");
    return false;
  }
};

const hardDeleteUser = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) handleDatabaseError("Failed to delete user", error);
    return true;
  } catch (error) {
    handleUnknownError(error, "deleting user");
    return false;
  }
};

// Convenience functions
export const deleteUserByEmailSoft = (email: string) => 
  softDeleteUser("email", email);

export const deleteUserByEmailHard = (email: string) => 
  hardDeleteUser(email);

export const getUserByUsername = (username: string, includeSensitive = false) =>
  getUserByField("userName", username, includeSensitive);

export const getUserByEmail = (email: string, includeSensitive = false) =>
  getUserByField("email", email, includeSensitive);