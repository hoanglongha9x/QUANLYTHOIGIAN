import React from 'react';
import { 
  Timer, 
  CheckSquare, 
  BarChart3, 
  BookOpen, 
  Settings, 
  Flame, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Clock,
  Sparkles
} from 'lucide-react';
import { UserProfile, TimerSettings } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  profile: UserProfile;
  todayMinutes: number;
  streak: number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  timerSettings: TimerSettings;
  setTimerSettings: React.Dispatch<React.SetStateAction<TimerSettings>>;
  onOpenSettings: () => void;
  onOpenManualLog: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  profile,
  todayMinutes,
  streak,
  theme,
  toggleTheme,
  timerSettings,
  setTimerSettings,
  onOpenSettings,
  onOpenManualLog,
}) => {
  const goalMinutes = Math.max(1, Math.round(profile.dailyGoalHours * 60));
  const progressPercent = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Sparkles },
    { id: 'timer', label: 'Trạm Tập trung', icon: Timer },
    { id: 'tasks', label: 'Nhiệm vụ & Môn học', icon: CheckSquare },
    { id: 'analytics', label: 'Phân tích & Nhật ký', icon: BarChart3 },
  ];

  const toggleSound = () => {
    setTimerSettings(prev => ({
      ...prev,
      soundVolume: prev.soundVolume > 0 ? 0 : 0.8,
    }));
  };

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none transition-colors duration-200">
      {/* Top Branding & Profile Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                StudyHub <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-indigo-500/20 text-indigo-400">PRO</span>
              </h1>
              <p className="text-xs text-slate-400">Hiệu suất học tập</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>

        {/* User Profile Bento Card */}
        <div className="p-4 mx-3 my-4 rounded-xl bg-slate-800/60 border border-slate-750/70 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 rounded-lg bg-slate-700/50 shadow-inner flex items-center justify-center">
                {profile.avatar || '🦉'}
              </span>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{profile.name}</p>
                <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                  <span>{streak} ngày liên tiếp</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Goal Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Mục tiêu hôm nay</span>
              <span className="text-slate-200 font-mono">
                {Math.floor(todayMinutes / 60)}h{todayMinutes % 60}m / {profile.dailyGoalHours}h
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-700/70 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
              <span>{progressPercent}% hoàn thành</span>
              {progressPercent >= 100 && (
                <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                  Đạt mục tiêu 🎉
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions & Settings */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onOpenManualLog}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700/60"
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ghi chép thủ công</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition border border-slate-750"
            title={timerSettings.soundVolume > 0 ? 'Tắt âm thanh chuông' : 'Bật âm thanh chuông'}
          >
            {timerSettings.soundVolume > 0 ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Âm báo: Bật</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span>Âm báo: Tắt</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition border border-slate-750"
            title="Cài đặt & Dữ liệu"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
