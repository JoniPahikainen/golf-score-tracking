// Interface for profile data
export interface User {
  userName: string;
  email: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
