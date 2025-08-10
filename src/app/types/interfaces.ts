import { Types } from "mongoose";

export type UserRole = "admin" | "student" | "supervisor";
export type CompetencyLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type AssessmentStep = 1 | 2 | 3;

export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  // Approval flags
  supervisorApproved?: boolean; // true only after admin approval
  studentApproved?: boolean; // students auto-approved at registration
  otpVersion: number;
  tokenVersion: number;
  currentLevel?: CompetencyLevel;
  createdAt: Date;
  updatedAt: Date;
  refreshTokens?: string[];
  profile?: {
    name: string;
    avatarUrl?: string;
    phone?: string;
  };
}

export interface IQuestion {
  _id: string;
  competency: string; // domain / competency name (22 total)
  level: CompetencyLevel;
  text: string;
  options: { key: string; value: string }[];
  correctOptionKey: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssessmentAttempt {
  _id: string;
  user: Types.ObjectId;
  step: AssessmentStep;
  startedAt: Date;
  submittedAt?: Date;
  status: "in_progress" | "submitted" | "invalidated" | "expired";
  questions: {
    questionId: string;
    competency: string;
    level: CompetencyLevel;
    selectedOptionKey?: string;
    correct: boolean;
  }[];
  scorePercent?: number;
  levelAwarded?: CompetencyLevel;
  advancedToNext?: boolean;
  meta?: Record<string, unknown>;
}

export interface ICertificate {
  _id: string;
  user: Types.ObjectId;
  level: CompetencyLevel;
  issuedAt: Date;
  serialNumber: string;
  filePath?: string;
  hash?: string;
}

export interface OTPRecord {
  email: string;
  otp: string;
  purpose: "email_verification" | "password_reset";
  expiresAt: number;
}
