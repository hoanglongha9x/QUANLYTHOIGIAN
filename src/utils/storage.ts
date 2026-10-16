import { AppData, Subject, Task, StudyLog, UserProfile, TimerSettings } from '../types';

const STORAGE_KEY = 'study_hub_data_v1';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Học Viên Tập Trung',
  avatar: '🦉',
  dailyGoalHours: 3.5,
  createdAt: new Date().toISOString(),
};

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  soundVolume: 0.8,
  ambientSound: 'none',
};

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    name: 'Toán cao cấp & Xác suất',
    color: 'sky',
    icon: '📐',
    targetWeeklyHours: 8,
    totalMinutesStudied: 150,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'sub-2',
    name: 'Lập trình Frontend React & TS',
    color: 'violet',
    icon: '💻',
    targetWeeklyHours: 12,
    totalMinutesStudied: 275,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'sub-3',
    name: 'Tiếng Anh IELTS 7.5+',
    color: 'amber',
    icon: '🇬🇧',
    targetWeeklyHours: 6,
    totalMinutesStudied: 120,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'sub-4',
    name: 'Cấu trúc dữ liệu & Thuật toán',
    color: 'emerald',
    icon: '🧠',
    targetWeeklyHours: 7,
    totalMinutesStudied: 90,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Ôn tập Đại số tuyến tính: Ma trận trực giao',
    subjectId: 'sub-1',
    priority: 'high',
    estimatedPomodoros: 4,
    actualMinutes: 50,
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Xây dựng Custom Hook useLocalStorage và Pomodoro logic',
    subjectId: 'sub-2',
    priority: 'high',
    estimatedPomodoros: 3,
    actualMinutes: 75,
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Luyện đề IELTS Reading Passage 3 & học 20 từ vựng Academic',
    subjectId: 'sub-3',
    priority: 'medium',
    estimatedPomodoros: 2,
    actualMinutes: 50,
    dueDate: new Date().toISOString().split('T')[0],
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Giải 3 bài LeetCode Medium: Two Pointers & Sliding Window',
    subjectId: 'sub-4',
    priority: 'medium',
    estimatedPomodoros: 3,
    actualMinutes: 0,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export function getInitialData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.profile && parsed.subjects && parsed.tasks) {
        return {
          profile: { ...DEFAULT_PROFILE, ...parsed.profile },
          subjects: parsed.subjects || DEFAULT_SUBJECTS,
          tasks: parsed.tasks || DEFAULT_TASKS,
          logs: parsed.logs || [],
          timerSettings: { ...DEFAULT_TIMER_SETTINGS, ...(parsed.timerSettings || {}) },
          theme: parsed.theme === 'light' ? 'light' : 'dark',
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse saved study data:', e);
  }

  // First time initial data
  return getDemoData();
}

export function saveAppData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * Generate rich, realistic 7-day demo data
 */
export function getDemoData(): AppData {
  const subjects = [...DEFAULT_SUBJECTS];
  const logs: StudyLog[] = [];
  const now = new Date();

  // Create demo logs for the past 7 days
  const dailyPlans = [
    { daysAgo: 6, sessions: [{ subId: 'sub-1', min: 75 }, { subId: 'sub-2', min: 100 }] },
    { daysAgo: 5, sessions: [{ subId: 'sub-3', min: 60 }, { subId: 'sub-4', min: 90 }] },
    { daysAgo: 4, sessions: [{ subId: 'sub-2', min: 125 }, { subId: 'sub-1', min: 50 }, { subId: 'sub-3', min: 45 }] },
    { daysAgo: 3, sessions: [{ subId: 'sub-2', min: 150 }, { subId: 'sub-4', min: 60 }] },
    { daysAgo: 2, sessions: [{ subId: 'sub-1', min: 80 }, { subId: 'sub-3', min: 70 }] },
    { daysAgo: 1, sessions: [{ subId: 'sub-2', min: 110 }, { subId: 'sub-4', min: 80 }] },
    { daysAgo: 0, sessions: [{ subId: 'sub-1', min: 50 }, { subId: 'sub-2', min: 75 }, { subId: 'sub-3', min: 50 }] },
  ];

  dailyPlans.forEach(plan => {
    const dayDate = new Date(now.getTime() - plan.daysAgo * 86400000);
    plan.sessions.forEach((sess, idx) => {
      const startTime = new Date(dayDate);
      startTime.setHours(9 + idx * 3, 15, 0, 0);
      const endTime = new Date(startTime.getTime() + sess.min * 60000);

      logs.push({
        id: `demo-log-${plan.daysAgo}-${idx}`,
        subjectId: sess.subId,
        taskId: plan.daysAgo === 0 ? (sess.subId === 'sub-1' ? 'task-1' : sess.subId === 'sub-2' ? 'task-2' : 'task-3') : undefined,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMinutes: sess.min,
        mode: sess.min % 25 === 0 ? 'pomodoro' : 'stopwatch',
        notes: plan.daysAgo === 0 ? 'Phiên học rất tập trung và hiệu quả' : undefined,
        createdAt: endTime.toISOString(),
      });
    });
  });

  // Calculate total minutes for subjects
  const subjectTotals: Record<string, number> = {};
  logs.forEach(l => {
    subjectTotals[l.subjectId] = (subjectTotals[l.subjectId] || 0) + l.durationMinutes;
  });

  const updatedSubjects = subjects.map(s => ({
    ...s,
    totalMinutesStudied: subjectTotals[s.id] || 0,
  }));

  return {
    profile: {
      name: 'Nguyễn Văn Minh',
      avatar: '⚡',
      dailyGoalHours: 3.5,
      createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
    },
    subjects: updatedSubjects,
    tasks: DEFAULT_TASKS,
    logs,
    timerSettings: DEFAULT_TIMER_SETTINGS,
    theme: 'dark',
  };
}

/**
 * Calculate streak (consecutive days with at least 1 study session)
 */
export function calculateStreak(logs: StudyLog[]): number {
  if (!logs || logs.length === 0) return 0;

  // Set of dates formatted YYYY-MM-DD
  const studyDates = new Set<string>();
  logs.forEach(log => {
    if (log.durationMinutes > 0) {
      const d = new Date(log.startTime || log.createdAt);
      studyDates.add(d.toISOString().split('T')[0]);
    }
  });

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today.getTime() - 86400000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If didn't study today or yesterday, streak is broken
  let checkDate = today;
  if (!studyDates.has(todayStr)) {
    if (!studyDates.has(yesterdayStr)) {
      return 0;
    }
    checkDate = yesterday;
  }

  let streak = 0;
  while (true) {
    const curStr = checkDate.toISOString().split('T')[0];
    if (studyDates.has(curStr)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate total minutes studied today
 */
export function getTodayStudyMinutes(logs: StudyLog[]): number {
  const todayStr = new Date().toISOString().split('T')[0];
  return logs
    .filter(log => {
      const logDate = new Date(log.startTime || log.createdAt).toISOString().split('T')[0];
      return logDate === todayStr;
    })
    .reduce((sum, log) => sum + log.durationMinutes, 0);
}

/**
 * Download JSON data file
 */
export function exportDataAsJSON(data: AppData) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `StudyHub_Backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
