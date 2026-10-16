export type Priority = 'low' | 'medium' | 'high';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch';

export interface UserProfile {
  name: string;
  avatar: string;
  dailyGoalHours: number; // e.g. 4.0
  createdAt: string;
}

export interface SubjectColor {
  name: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  chartColor: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string; // color identifier, e.g. 'indigo', 'emerald', etc.
  icon: string;
  targetWeeklyHours?: number;
  totalMinutesStudied: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  priority: Priority;
  estimatedPomodoros: number;
  actualMinutes: number;
  dueDate?: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface StudyLog {
  id: string;
  subjectId: string;
  taskId?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  durationMinutes: number;
  mode: 'pomodoro' | 'stopwatch' | 'manual';
  notes?: string;
  createdAt: string;
}

export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  soundVolume: number;
  ambientSound: 'none' | 'rain' | 'whitenoise' | 'waves';
}

export interface AppData {
  profile: UserProfile;
  subjects: Subject[];
  tasks: Task[];
  logs: StudyLog[];
  timerSettings: TimerSettings;
  theme: 'dark' | 'light';
}
