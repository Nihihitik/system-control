export type UserRole = 'engineer' | 'manager' | 'observer';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}
