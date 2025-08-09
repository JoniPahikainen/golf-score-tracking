import { supabase } from "../supabase";
import { User } from "../types";

export const createUser = async (user: Omit<User, "id">): Promise<string> => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      user_name: user.userName,
      password: user.password,
      created_at: user.createdAt || new Date(),
      updated_at: user.updatedAt || new Date()
    }])
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data.id;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return {
    id: data.id,
    userName: data.user_name,
    password: data.password,
    createdAt: data.created_at ? new Date(data.created_at) : undefined,
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
  };
};

export const getAllUsers = async (safe: boolean = true): Promise<User[]> => {
  const query = supabase.from('users').select('*');
  
  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }

  return data.map((user) => ({
    id: user.id,
    userName: user.user_name,
    password: safe ? undefined : user.password,
    createdAt: user.created_at ? new Date(user.created_at) : undefined,
    updatedAt: user.updated_at ? new Date(user.updated_at) : undefined
  }));
};

export const getUserByUsername = async (userName: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_name', userName)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error(`Failed to get user by username: ${error.message}`);
  }

  return {
    id: data.id,
    userName: data.user_name,
    password: data.password,
    createdAt: data.created_at ? new Date(data.created_at) : undefined,
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
  };
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }

  return true;
};

export const deleteUserByUsername = async (username: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_name', username);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};