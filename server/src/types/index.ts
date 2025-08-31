export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  _id: string;
  googleId?: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessCodeVerification {
  success: boolean;
  role?: UserRole;
  permissions?: string[];
  message: string;
  retryAfter?: number;
}
