export interface RegisterInput {
  email: string;
  password: string;
  role?: "student" | "admin" | "supervisor";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}
