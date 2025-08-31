export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
}

export enum UserRole {
  GUEST = 'guest',
  USER = 'user', 
  ADMIN = 'admin'
}

export interface BookingSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  userId: string;
  userName: string;
  title?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole;
  loading: boolean;
}

export interface PasswordConfig {
  guest: string;
  user: string;
  admin: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  userId: string;
  userName: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
