import React, { useState } from 'react';
import { Clock, BookOpen, Check, X, AlertCircle } from 'lucide-react';
import { Subject, Task, StudyLog } from '../types';

interface ManualLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  tasks: Task[];
  onAddManualLog: (log: Omit<StudyLog, 'id' | 'createdAt'>) => void;
}

export const ManualLogModal: React.FC<ManualLogModalProps> = ({
  isOpen,
  onClose,
  subjects,
  tasks,
  onAddManualLog,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [taskId, setTaskId] = useState('');
  const [date, setDate] = useState(todayStr);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch' | 'manual'>('manual');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const availableTasks = tasks.filter(t => (subjectId ? t.subjectId === subjectId : true));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      setError('Vui lòng chọn môn học!');
      return;
    }
    if (durationMinutes <= 0) {
      setError('Thời gian học phải lớn hơn 0 phút!');
      return;
    }

    const logDate = new Date(date);
    // Approximate start and end times based on minutes
    const end = new Date(logDate);
    end.setHours(12, 0, 0, 0);
    const start = new Date(end.getTime() - durationMinutes * 60000);

    onAddManualLog({
      subjectId,
      taskId: taskId || undefined,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes,
      mode,
      notes: notes.trim() || 'Thêm thủ công',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Thêm phiên học thủ công</h3>
              <p className="text-xs text-slate-400">Bù thời gian học khi quên bật đồng hồ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Môn học / Kỹ năng <span className="text-rose-400">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nhiệm vụ liên kết (Tùy chọn)
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
            >
              <option value="">-- Không liên kết nhiệm vụ cụ thể --</option>
              {availableTasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ngày học
              </label>
              <input
                type="date"
                required
                value={date}
                max={todayStr}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Thời lượng (Số phút) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max="720"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Chế độ phiên học
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('pomodoro')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                  mode === 'pomodoro'
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400'
                }`}
              >
                🍅 Pomodoro
              </button>
              <button
                type="button"
                onClick={() => setMode('stopwatch')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                  mode === 'stopwatch'
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400'
                }`}
              >
                ⏱️ Stopwatch
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                  mode === 'manual'
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400'
                }`}
              >
                ✍️ Thủ công
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ghi chú nội dung đã học
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Đọc sách giáo trình, ghi chú chương 2..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Ghi nhận phiên học</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
