import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Target, 
  CheckCircle2, 
  Play, 
  ArrowRight, 
  BookOpen,
  Calendar,
  BarChart2
} from 'lucide-react';
import { AppData, Task, Subject } from '../types';
import { getSubjectColor } from '../utils/colors';

interface DashboardViewProps {
  appData: AppData;
  todayMinutes: number;
  streak: number;
  onNavigateTab: (tab: string) => void;
  onSelectForFocus: (task: Task) => void;
  onStartFocus: (subjectId: string) => void;
  onOpenManualLog: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appData,
  todayMinutes,
  streak,
  onNavigateTab,
  onSelectForFocus,
  onStartFocus,
  onOpenManualLog,
}) => {
  const { profile, subjects, tasks, logs } = appData;
  const goalMinutes = Math.max(1, Math.round(profile.dailyGoalHours * 60));
  const progressPercent = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => !t.completed && (!t.dueDate || t.dueDate <= todayStr)).slice(0, 4);
  const recentLogs = [...logs].sort((a, b) => new Date(b.startTime || b.createdAt).getTime() - new Date(a.startTime || a.createdAt).getTime()).slice(0, 4);

  // Motivational quote based on streak and progress
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{profile.avatar || '🦉'}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {getGreeting()}, {profile.name}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Sẵn sàng cho một ngày học tập bứt phá!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Tập trung từng khối 25 phút. Duy trì chuỗi ngày <strong className="text-amber-400">{streak} ngày 🔥</strong> liên tục của bạn.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('timer')}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Vào Trạm Tập trung</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow decoration */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bento 1: Daily Progress & Streak (Col 1) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Tiến độ ngày hôm nay</span>
              </span>
              <span className="text-xs font-bold text-indigo-400">{progressPercent}%</span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-mono text-3xl font-extrabold text-white">
                {Math.floor(todayMinutes / 60)}h{todayMinutes % 60}m
              </span>
              <span className="text-xs text-slate-400">/ {profile.dailyGoalHours} giờ mục tiêu</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Chuỗi {streak} ngày</span>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-slate-400 hover:text-indigo-400 font-medium flex items-center gap-1 transition"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento 2: Quick Tasks for Today (Col 2 & 3) */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Nhiệm vụ trọng tâm hôm nay ({todayTasks.length})</span>
              </h3>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {todayTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Không còn nhiệm vụ tồn đọng hôm nay. Tuyệt vời! 🎉
                </div>
              ) : (
                todayTasks.map((t) => {
                  const sub = subjects.find(s => s.id === t.subjectId);
                  const colorObj = getSubjectColor(sub?.color);
                  return (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm">{sub?.icon || '📚'}</span>
                        <div className="truncate">
                          <p className="text-xs font-medium text-slate-200 truncate">{t.title}</p>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                            {sub?.name}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectForFocus(t);
                          onNavigateTab('timer');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold transition shrink-0 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Học</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs text-indigo-400 hover:underline"
            >
              + Thêm nhiệm vụ mới vào lịch trình
            </button>
          </div>
        </div>
      </div>

      {/* Bento Row 2: Subject Cards & Recent Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Tracked Subjects Grid (Col 1 & 2) */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-violet-400" />
              <span>Môn học & Kỹ năng theo dõi</span>
            </h3>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs text-indigo-400 hover:underline"
            >
              Quản lý môn học
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjects.slice(0, 4).map(sub => {
              const colorObj = getSubjectColor(sub.color);
              const hours = (sub.totalMinutesStudied / 60).toFixed(1);

              return (
                <div
                  key={sub.id}
                  className={`p-3.5 rounded-xl border ${colorObj.border} bg-slate-850/60 flex items-center justify-between gap-3 hover:bg-slate-850 transition`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl p-2 rounded-lg bg-slate-800">{sub.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-100 truncate">{sub.name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                        {hours} giờ tích lũy
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onStartFocus(sub.id);
                      onNavigateTab('timer');
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                    title="Bắt đầu học môn này"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Recent Study Sessions (Col 3) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Phiên học gần đây</span>
              </h3>
              <button
                onClick={() => onNavigateTab('analytics')}
                className="text-xs text-indigo-400 hover:underline"
              >
                Nhật ký
              </button>
            </div>

            <div className="space-y-2.5">
              {recentLogs.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  Chưa có phiên học nào
                </div>
              ) : (
                recentLogs.map(log => {
                  const sub = subjects.find(s => s.id === log.subjectId);
                  const colorObj = getSubjectColor(sub?.color);
                  const d = new Date(log.startTime || log.createdAt);
                  const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={log.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none">
                      <div className="flex items-center gap-2 truncate">
                        <span>{sub?.icon || '📚'}</span>
                        <span className="text-slate-300 truncate">{sub?.name || 'Môn học'}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-semibold text-indigo-400">{log.durationMinutes}m</span>
                        <span className="text-[10px] text-slate-500">{timeStr}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={onOpenManualLog}
              className="w-full py-1.5 text-xs text-center font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 transition"
            >
              + Ghi chép phiên học thủ công
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
