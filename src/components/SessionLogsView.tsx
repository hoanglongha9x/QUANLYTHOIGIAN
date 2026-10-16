import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Plus, 
  Search, 
  Clock, 
  Tag, 
  Calendar, 
  Filter, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { StudyLog, Subject, Task } from '../types';
import { getSubjectColor } from '../utils/colors';

interface SessionLogsViewProps {
  logs: StudyLog[];
  subjects: Subject[];
  tasks: Task[];
  onDeleteLog: (id: string) => void;
  onOpenManualLog: () => void;
}

export const SessionLogsView: React.FC<SessionLogsViewProps> = ({
  logs,
  subjects,
  tasks,
  onDeleteLog,
  onOpenManualLog,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [searchNotes, setSearchNotes] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Sort logs by newest first
  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = new Date(a.startTime || a.createdAt).getTime();
    const timeB = new Date(b.startTime || b.createdAt).getTime();
    return timeB - timeA;
  });

  const filteredLogs = sortedLogs.filter(log => {
    if (selectedSubjectFilter !== 'all' && log.subjectId !== selectedSubjectFilter) {
      return false;
    }
    if (searchNotes.trim()) {
      const q = searchNotes.toLowerCase();
      const task = tasks.find(t => t.id === log.taskId);
      const subject = subjects.find(s => s.id === log.subjectId);
      const matchNotes = log.notes?.toLowerCase().includes(q);
      const matchTask = task?.title.toLowerCase().includes(q);
      const matchSubject = subject?.name.toLowerCase().includes(q);
      if (!matchNotes && !matchTask && !matchSubject) return false;
    }
    return true;
  });

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    const day = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return { day, time };
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'pomodoro':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">🍅 Pomodoro</span>;
      case 'stopwatch':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">⏱️ Stopwatch</span>;
      case 'manual':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">✍️ Thủ công</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Manual Log Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Nhật ký Phiên học (Study Session Logs)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Toàn bộ lịch sử các phiên học đã được ghi nhận vào hệ thống
          </p>
        </div>

        <button
          onClick={onOpenManualLog}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm phiên thủ công</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="all">Tất cả môn học ({logs.length} phiên)</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo ghi chú, nhiệm vụ..."
            value={searchNotes}
            onChange={(e) => setSearchNotes(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Logs Table / Cards */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/70 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Môn học</th>
                <th className="py-3 px-4">Nhiệm vụ / Ghi chú</th>
                <th className="py-3 px-4 text-center">Thời lượng</th>
                <th className="py-3 px-4 text-center">Chế độ</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Chưa có phiên học nào được ghi nhận
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const subject = subjects.find(s => s.id === log.subjectId);
                  const task = tasks.find(t => t.id === log.taskId);
                  const colorObj = getSubjectColor(subject?.color);
                  const startMeta = formatDateTime(log.startTime || log.createdAt);

                  return (
                    <tr key={log.id} className="hover:bg-slate-850/50 transition">
                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        <div className="font-medium text-slate-200">{startMeta.day}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{startMeta.time}</div>
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {subject ? (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                            <span>{subject.icon}</span>
                            <span>{subject.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">Môn học đã xóa</span>
                        )}
                      </td>

                      {/* Task / Notes */}
                      <td className="py-3 px-4 max-w-xs">
                        {task && (
                          <div className="font-semibold text-slate-200 truncate">
                            🎯 {task.title}
                          </div>
                        )}
                        {log.notes && (
                          <div className="text-slate-400 text-[11px] truncate flex items-center gap-1 mt-0.5">
                            <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{log.notes}</span>
                          </div>
                        )}
                        {!task && !log.notes && (
                          <span className="text-slate-500 italic">Phiên học tự do</span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-sm text-indigo-400">
                          {log.durationMinutes}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">phút</span>
                      </td>

                      {/* Mode */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getModeBadge(log.mode)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {confirmDeleteId === log.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                onDeleteLog(log.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-semibold transition"
                            >
                              Xác nhận xóa
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(log.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                            title="Xóa phiên học này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
