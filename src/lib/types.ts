

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assessmentHistory?: AssessmentResult[];
  interests?: string[]; // For AI recommendation
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string; // Store the correct option string
  type: 'multiple-choice' | 'true-false'; // Example types
}

export type AssessmentCategory = 'AI/ML' | 'Web Development' | 'Data Structures' | 'Cybersecurity' | 'Cloud Computing';

export interface Assessment {
  id: string;
  title: string;
  category: string;
  description: string;
  questions: Question[];
  durationMinutes?: number; // Optional: duration in minutes
  createdAt: string; // ISO date string
  upvotes: number;
  downvotes: number;
  isPredefined?: boolean;
  createdByRole?: UserRole | "ai";
  createdByUserId?: string | null;
  isAIGenerated?: boolean;
}

export interface AssessmentResult {
  assessmentId: string;
  assessmentTitle: string;
  category: string;
  userId: string;
  scorePercentage: number;
  answers: { questionId: string; selectedAnswer: string }[];
  completedAt: string; // ISO date string
}

export interface AvailableAssessmentInfo {
  assessmentCategory: string;
  assessmentTitle:string;
}

export interface UserHistoryEntry {
  assessmentCategory: string;
  score: number;
  interests: string;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface AppTheme {
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export type ThemeMode = 'light' | 'dark' | 'system';

    