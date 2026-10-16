import React, { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Clock, Target } from 'lucide-react';
import { Subject } from '../types';
import { COLOR_PALETTES, SUBJECT_ICONS, getSubjectColor } from '../utils/colors';

interface SubjectManagerProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id' | 'totalMinutesStudied' | 'createdAt'>) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [name, setName] = useState('');
  const [color, setColor] = useState('indigo');
  const [icon, setIcon] = useState('📚');
  const [targetWeeklyHours, setTargetWeeklyHours] = useState(6);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setName('');
    setColor('indigo');
    setIcon('📚');
    setTargetWeeklyHours(6);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setColor(subject.color);
    setIcon(subject.icon);
    setTargetWeeklyHours(subject.targetWeeklyHours || 6);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSubject) {
      onUpdateSubject({
        ...editingSubject,
        name: name.trim(),
        color,
        icon,
        targetWeeklyHours,
      });
    } else {
      onAddSubject({
        name: name.trim(),
        color,
        icon,
        targetWeeklyHours,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Môn học & Kỹ năng theo dõi</span>
          </h2>
          <p className="text-xs text-slate-400">
            Quản lý các môn học, mục tiêu giờ và huy hiệu màu sắc
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm môn học</span>
        </button>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {subjects.map((subject) => {
          const colorObj = getSubjectColor(subject.color);
          const studiedHours = (subject.totalMinutesStudied / 60).toFixed(1);
          const weeklyTarget = subject.targetWeeklyHours || 0;
          const targetPercent = weeklyTarget > 0 ? Math.min(100, Math.round(((subject.totalMinutesStudied / 60) / weeklyTarget) * 100)) : 0;

          return (
            <div
              key={subject.id}
              className={`p-4 rounded-xl bg-slate-900 border ${colorObj.border} hover:border-slate-600 transition flex flex-col justify-between group shadow-sm`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl p-2 rounded-lg bg-slate-800/80 shadow-inner">
                    {subject.icon}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleOpenEdit(subject)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                      title="Chỉnh sửa môn học"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSubject(subject.id)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                      title="Xóa môn học"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-slate-100 truncate mb-1">
                  {subject.name}
                </h3>

                <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${colorObj.badgeBg} ${colorObj.badgeText} mb-3`}>
                  {colorObj.name}
                </span>
              </div>

              {/* Study Stats */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Đã tích lũy:
                  </span>
                  <span className="font-mono font-semibold text-slate-200">
                    {studiedHours} giờ
                  </span>
                </div>

                {weeklyTarget > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Mục tiêu tuần: {weeklyTarget}h</span>
                      <span>{targetPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${targetPercent}%`, backgroundColor: colorObj.chartColor }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingSubject ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên môn học / Kỹ năng <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Toán giải tích, Lập trình React, IELTS..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chọn biểu tượng (Icon)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_ICONS.map((ic) => (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition ${
                        icon === ic
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Màu sắc huy hiệu nhận diện
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(COLOR_PALETTES).map(([key, col]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setColor(key)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition ${
                        color === key
                          ? 'border-indigo-400 ring-2 ring-indigo-500/20 bg-slate-800 text-white'
                          : 'border-slate-800 bg-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: col.chartColor }}
                      />
                      <span className="truncate">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mục tiêu tuần (Số giờ)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={targetWeeklyHours}
                  onChange={(e) => setTargetWeeklyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  {editingSubject ? 'Lưu thay đổi' : 'Tạo môn học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
