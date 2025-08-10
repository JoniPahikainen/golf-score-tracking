import { supabase } from "../supabase";
import { User, CreateUserRequest, DatabaseError } from "../types";
import bcrypt from "bcrypt";

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
  updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
});

const handleDbError = (message: string, error: any): never => {
  const dbError: DatabaseError = new Error(`${message}: ${error.message}`);
  dbError.code = error.code;
  dbError.detail = error.details;
  dbError.hint = error.hint;
  throw dbError;
};

export const createUser = async (user: CreateUserRequest): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([{
        user_name: user.userName,
        email: user.email,
        password_hash: user.password,
        first_name: user.firstName,
        last_name: user.lastName,
        phone: user.phone,
        date_of_birth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
        is_active: true,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select("id")
      .single();

    if (error) handleDbError("Failed to create user", error);
    if (!data) throw new Error("No data returned from user creation");
    return data.id;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error occurred while creating user");
  }
};

export const getUserById = async (id: string, includeSensitive = false): Promise<User | null> => {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      handleDbError("Failed to get user", error);
    }
    return transformUserData(data, includeSensitive);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error occurred while getting user");
  }
};

export const getUserByField = async (
  field: "user_name" | "email",
  value: string,
  includeSensitive = false
): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq(field, value)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      handleDbError(`Failed to get user by ${field}`, error);
    }
    return transformUserData(data, includeSensitive);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Unknown error occurred while getting user by ${field}`);
  }
};

export const getAllUsers = async (safe = true, limit?: number, offset?: number): Promise<User[]> => {
  try {
    let query = supabase.from("users").select("*").eq("is_active", true);
    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + (limit || 100) - 1);

    const { data, error } = await query;
    if (error) handleDbError("Failed to get users", error);
    return (data || []).map((u) => transformUserData(u, !safe));
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error occurred while getting users");
  }
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {};
    if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.handicapIndex !== undefined) updateData.handicap_index = updates.handicapIndex;
    if (updates.dateOfBirth !== undefined) updateData.date_of_birth = updates.dateOfBirth;
    if (updates.profilePictureUrl !== undefined) updateData.profile_picture_url = updates.profilePictureUrl;
    if (updates.preferredTeeColor !== undefined) updateData.preferred_tee_color = updates.preferredTeeColor;
    if (updates.emailVerified !== undefined) updateData.email_verified = updates.emailVerified;
    updateData.updated_at = new Date();

    const { error } = await supabase.from("users").update(updateData).eq("id", id);
    if (error) handleDbError("Failed to update user", error);
    return true;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error occurred while updating user");
  }
};

export const verifyPassword = async (userId: string, password: string): Promise<boolean> => {
  try {
    const user = await getUserById(userId, true);
    return !!(user?.password && await bcrypt.compare(password, user.password));
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
};

export const updatePassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const { error } = await supabase
      .from("users")
      .update({ password_hash: passwordHash, updated_at: new Date() })
      .eq("id", userId);
    if (error) handleDbError("Failed to update password", error);
    return true;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error occurred while updating password");
  }
};

const softDeleteUser = async (field: "id" | "user_name", value: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("users")
      .update({ is_active: false, updated_at: new Date() })
      .eq(field, value);
    if (error) handleDbError(`Failed to delete user by ${field}`, error);
    return true;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Unknown error occurred while deleting user by ${field}`);
  }
};

export const deleteUser = (id: string) => softDeleteUser("id", id);
export const deleteUserByUsername = (username: string) => softDeleteUser("user_name", username);

export const getUserByUsername = (username: string, includeSensitive = false) =>
  getUserByField("user_name", username, includeSensitive);

export const getUserByEmail = (email: string, includeSensitive = false) =>
  getUserByField("email", email, includeSensitive);
