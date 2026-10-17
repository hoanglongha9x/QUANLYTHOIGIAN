import React, { useState, useEffect } from 'react';
import { 
  getInitialData, 
  saveAppData, 
  calculateStreak, 
  getTodayStudyMinutes 
} from './utils/storage';
import { 
  AppData, 
  Subject, 
  Task, 
  StudyLog, 
  UserProfile, 
  TimerSettings 
} from './types';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { FocusTimer } from './components/FocusTimer';
import { TaskManager } from './components/TaskManager';
import { SubjectManager } from './components/SubjectManager';
import { AnalyticsView } from './components/AnalyticsView';
import { SessionLogsView } from './components/SessionLogsView';
import { SettingsModal } from './components/SettingsModal';
import { ManualLogModal } from './components/ManualLogModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { ReportModal } from './components/ReportModal';
import { 
  Timer, 
  Sparkles, 
  CheckSquare, 
  BarChart3, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Flame,
  Clock,
  FileText,
  User,
  UserPlus
} from 'lucide-react';

export default function App() {
  const [appData, setAppData] = useState<AppData>(() => getInitialData());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManualLogOpen, setIsManualLogOpen] = useState(false);
  const [isStudentProfileOpen, setIsStudentProfileOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto prompt student to enter their name if not set yet
  useEffect(() => {
    if (!appData.profile.name || appData.profile.hasCustomizedName === false) {
      setIsStudentProfileOpen(true);
    }
  }, []);

  // Sync theme with DOM
  useEffect(() => {
    if (appData.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-100 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white';
    }
  }, [appData.theme]);

  // Save changes to localStorage
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Set default subject if none selected
  useEffect(() => {
    if (!selectedSubjectId && appData.subjects.length > 0) {
      setSelectedSubjectId(appData.subjects[0].id);
    }
  }, [appData.subjects, selectedSubjectId]);

  const toggleTheme = () => {
    setAppData(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const todayMinutes = getTodayStudyMinutes(appData.logs);
  const streak = calculateStreak(appData.logs);

  // Core handler: Session Completion (Pomodoro, Stopwatch, or Manual)
  const handleSessionComplete = (newLogData: Omit<StudyLog, 'id' | 'createdAt'>) => {
    const newLog: StudyLog = {
      ...newLogData,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    setAppData(prev => {
      // 1. Add log
      const updatedLogs = [newLog, ...prev.logs];

      // 2. Accumulate minutes to subject
      const updatedSubjects = prev.subjects.map(s => {
        if (s.id === newLog.subjectId) {
          return {
            ...s,
            totalMinutesStudied: s.totalMinutesStudied + newLog.durationMinutes,
          };
        }
        return s;
      });

      // 3. Accumulate minutes to task if linked
      const updatedTasks = prev.tasks.map(t => {
        if (newLog.taskId && t.id === newLog.taskId) {
          return {
            ...t,
            actualMinutes: t.actualMinutes + newLog.durationMinutes,
          };
        }
        return t;
      });

      return {
        ...prev,
        logs: updatedLogs,
        subjects: updatedSubjects,
        tasks: updatedTasks,
      };
    });
  };

  // Subject Management
  const handleAddSubject = (subjectData: Omit<Subject, 'id' | 'totalMinutesStudied' | 'createdAt'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
      totalMinutesStudied: 0,
      createdAt: new Date().toISOString(),
    };
    setAppData(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
    if (!selectedSubjectId) {
      setSelectedSubjectId(newSubject.id);
    }
  };

  const handleUpdateSubject = (updated: Subject) => {
    setAppData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => (s.id === updated.id ? updated : s)),
    }));
  };

  const handleDeleteSubject = (id: string) => {
    setAppData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      tasks: prev.tasks.filter(t => t.subjectId !== id),
    }));
    if (selectedSubjectId === id) {
      const remaining = appData.subjects.filter(s => s.id !== id);
      setSelectedSubjectId(remaining[0]?.id || '');
    }
  };

  // Task Management
  const handleAddTask = (taskData: Omit<Task, 'id' | 'actualMinutes' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      actualMinutes: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setAppData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const handleUpdateTask = (updated: Task) => {
    setAppData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === updated.id ? updated : t)),
    }));
  };

  const handleDeleteTask = (id: string) => {
    setAppData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
    if (selectedTaskId === id) {
      setSelectedTaskId('');
    }
  };

  const handleSelectForFocus = (task: Task) => {
    setSelectedSubjectId(task.subjectId);
    setSelectedTaskId(task.id);
    setCurrentTab('timer');
  };

  const handleDeleteLog = (id: string) => {
    const logToDelete = appData.logs.find(l => l.id === id);
    if (!logToDelete) return;

    setAppData(prev => {
      const updatedLogs = prev.logs.filter(l => l.id !== id);
      // Decrement duration from subject
      const updatedSubjects = prev.subjects.map(s => {
        if (s.id === logToDelete.subjectId) {
          return {
            ...s,
            totalMinutesStudied: Math.max(0, s.totalMinutesStudied - logToDelete.durationMinutes),
          };
        }
        return s;
      });

      // Decrement duration from task if linked
      const updatedTasks = prev.tasks.map(t => {
        if (logToDelete.taskId && t.id === logToDelete.taskId) {
          return {
            ...t,
            actualMinutes: Math.max(0, t.actualMinutes - logToDelete.durationMinutes),
          };
        }
        return t;
      });

      return {
        ...prev,
        logs: updatedLogs,
        subjects: updatedSubjects,
        tasks: updatedTasks,
      };
    });
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setAppData(prev => ({ ...prev, profile }));
  };

  const handleUpdateTimerSettings = (timerSettings: TimerSettings) => {
    setAppData(prev => ({ ...prev, timerSettings }));
  };

  const handleRestoreData = (restored: AppData) => {
    setAppData(restored);
  };

  const handleResetData = () => {
    localStorage.removeItem('study_hub_data_v1');
    const fresh = getInitialData();
    fresh.logs = [];
    fresh.subjects.forEach(s => { s.totalMinutesStudied = 0; });
    fresh.tasks.forEach(t => { t.actualMinutes = 0; t.completed = false; });
    setAppData(fresh);
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${
      appData.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Timer className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-sm">StudyHub</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold px-2 py-1 rounded bg-slate-800">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{streak}d</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile drawer */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block z-40 md:z-0`}>
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            setIsMobileMenuOpen(false);
          }}
          profile={appData.profile}
          todayMinutes={todayMinutes}
          streak={streak}
          theme={appData.theme}
          toggleTheme={toggleTheme}
          timerSettings={appData.timerSettings}
          setTimerSettings={(fn) => {
            setAppData(prev => ({
              ...prev,
              timerSettings: typeof fn === 'function' ? fn(prev.timerSettings) : fn,
            }));
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenManualLog={() => setIsManualLogOpen(true)}
          onOpenStudentProfile={() => setIsStudentProfileOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
              {currentTab === 'dashboard' && 'Dashboard Bento Grid'}
              {currentTab === 'timer' && 'Trạm Tập trung (Focus Station)'}
              {currentTab === 'tasks' && 'Quản lý Môn học & Nhiệm vụ'}
              {currentTab === 'analytics' && 'Phân tích Biểu đồ & Nhật ký'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Name Button / Trigger */}
            <button
              onClick={() => setIsStudentProfileOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-200 text-xs font-semibold transition"
              title="Đổi tên / Thông tin học sinh"
            >
              <span>{appData.profile.avatar || '🦉'}</span>
              <span className="max-w-[100px] sm:max-w-[140px] truncate text-slate-100 font-bold">
                {appData.profile.name || 'Nhập tên học sinh ✍️'}
              </span>
            </button>

            {/* Today Goal pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Hôm nay:</span>
              <strong className="text-slate-200 font-mono">
                {Math.floor(todayMinutes / 60)}h{todayMinutes % 60}m
              </strong>
              <span className="text-slate-500">/ {appData.profile.dailyGoalHours}h</span>
            </div>

            {/* Report Button */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
              title="Tổng kết kết quả học tập & Báo cáo cho Thầy cô / Bố mẹ"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Báo cáo học tập</span>
            </button>

            {/* Quick manual log button */}
            <button
              onClick={() => setIsManualLogOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-750 text-xs font-semibold transition"
              title="Ghi chép phiên học thủ công"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ghi phiên</span>
            </button>
          </div>
        </header>

        {/* Tab View Router */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              appData={appData}
              todayMinutes={todayMinutes}
              streak={streak}
              onNavigateTab={setCurrentTab}
              onSelectForFocus={handleSelectForFocus}
              onStartFocus={(subId) => {
                setSelectedSubjectId(subId);
                setSelectedTaskId('');
              }}
              onOpenManualLog={() => setIsManualLogOpen(true)}
              onOpenStudentProfile={() => setIsStudentProfileOpen(true)}
              onOpenReport={() => setIsReportOpen(true)}
            />
          )}

          {currentTab === 'timer' && (
            <div className="space-y-6">
              <FocusTimer
                subjects={appData.subjects}
                tasks={appData.tasks}
                timerSettings={appData.timerSettings}
                selectedSubjectId={selectedSubjectId}
                setSelectedSubjectId={setSelectedSubjectId}
                selectedTaskId={selectedTaskId}
                setSelectedTaskId={setSelectedTaskId}
                onSessionComplete={handleSessionComplete}
                onOpenManualLog={() => setIsManualLogOpen(true)}
              />
            </div>
          )}

          {currentTab === 'tasks' && (
            <div className="space-y-8">
              <TaskManager
                tasks={appData.tasks}
                subjects={appData.subjects}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onSelectForFocus={handleSelectForFocus}
              />

              <div className="pt-6 border-t border-slate-800">
                <SubjectManager
                  subjects={appData.subjects}
                  onAddSubject={handleAddSubject}
                  onUpdateSubject={handleUpdateSubject}
                  onDeleteSubject={handleDeleteSubject}
                />
              </div>
            </div>
          )}

          {currentTab === 'analytics' && (
            <div className="space-y-8">
              <AnalyticsView
                logs={appData.logs}
                subjects={appData.subjects}
                profile={appData.profile}
                theme={appData.theme}
              />

              <div className="pt-6 border-t border-slate-800">
                <SessionLogsView
                  logs={appData.logs}
                  subjects={appData.subjects}
                  tasks={appData.tasks}
                  onDeleteLog={handleDeleteLog}
                  onOpenManualLog={() => setIsManualLogOpen(true)}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Student Profile & Self-Naming Modal */}
      <StudentProfileModal
        isOpen={isStudentProfileOpen}
        onClose={() => setIsStudentProfileOpen(false)}
        profile={appData.profile}
        onSaveProfile={handleUpdateProfile}
        isFirstTime={!appData.profile.name}
      />

      {/* Official Study Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        appData={appData}
        streak={streak}
      />

      {/* Settings & Data Portability Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        appData={appData}
        onUpdateProfile={handleUpdateProfile}
        onUpdateTimerSettings={handleUpdateTimerSettings}
        onRestoreData={handleRestoreData}
        onResetData={handleResetData}
      />

      {/* Manual Study Log Modal */}
      <ManualLogModal
        isOpen={isManualLogOpen}
        onClose={() => setIsManualLogOpen(false)}
        subjects={appData.subjects}
        tasks={appData.tasks}
        onAddManualLog={handleSessionComplete}
      />
    </div>
  );
}
