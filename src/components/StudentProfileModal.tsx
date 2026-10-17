import React, { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  Mail, 
  Sparkles, 
  Target, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { UserProfile } from '../types';
import { AVATAR_OPTIONS } from '../utils/colors';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  isFirstTime?: boolean;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  isFirstTime = false,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name || '');
  const [gradeOrClass, setGradeOrClass] = useState(profile.gradeOrClass || '');
  const [studentId, setStudentId] = useState(profile.studentId || '');
  const [avatar, setAvatar] = useState(profile.avatar || '🦉');
  const [dailyGoalHours, setDailyGoalHours] = useState(profile.dailyGoalHours || 3.5);
  const [supervisorName, setSupervisorName] = useState(profile.supervisorName || 'Thầy / Cô / Bố Mẹ');
  const [supervisorEmail, setSupervisorEmail] = useState(profile.supervisorEmail || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập Họ và tên của học sinh!');
      return;
    }

    onSaveProfile({
      ...profile,
      name: name.trim(),
      gradeOrClass: gradeOrClass.trim(),
      studentId: studentId.trim(),
      avatar,
      dailyGoalHours: Number(dailyGoalHours),
      supervisorName: supervisorName.trim() || 'Thầy/Cô/Phụ huynh',
      supervisorEmail: supervisorEmail.trim(),
      hasCustomizedName: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isFirstTime ? 'Chào mừng bạn đến với StudyHub!' : 'Thông tin Học sinh & Báo cáo'}</span>
                {isFirstTime && <Sparkles className="w-4 h-4 text-amber-400" />}
              </h2>
              <p className="text-xs text-slate-400">
                {isFirstTime 
                  ? 'Vui lòng nhập tên của bạn để bắt đầu học tập và tổng kết báo cáo'
                  : 'Cập nhật thông tin học sinh và thông tin người nhận báo cáo'}
              </p>
            </div>
          </div>
          {!isFirstTime && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Student Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>1. Thông tin học sinh</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Họ và tên học sinh <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập họ và tên đầy đủ của bạn (ví dụ: Trần Minh Đức)"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lớp / Khóa học
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 12A1, Khóa Toán..."
                  value={gradeOrClass}
                  onChange={(e) => setGradeOrClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mã học sinh (Nếu có)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: HS-2026-08"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Chọn biểu tượng đại diện (Avatar)
              </label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={`h-9 rounded-lg text-lg flex items-center justify-center transition ${
                      avatar === av
                        ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-105 text-white'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Goal */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  Mục tiêu số giờ học mỗi ngày:
                </span>
                <span className="text-indigo-400 font-mono font-bold">{dailyGoalHours} giờ / ngày</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={dailyGoalHours}
                onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1h</span>
                <span>3.5h</span>
                <span>6h</span>
                <span>10h</span>
              </div>
            </div>
          </div>

          {/* Section 2: Supervisor / Teacher / Parent to report to */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>2. Người nhận báo cáo kết quả (Thầy cô / Phụ huynh)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên Thầy cô hoặc Phụ huynh
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thầy Hoàng, Mẹ Lan..."
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email nhận báo cáo (Tùy chọn)
                </label>
                <input
                  type="email"
                  placeholder="thayco@truonghoc.edu.vn"
                  value={supervisorEmail}
                  onChange={(e) => setSupervisorEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 Báo cáo kết quả học tập sẽ tổng hợp số phút học, nhiệm vụ đã xong và tiến độ đạt mục tiêu để gửi cho thầy cô hoặc phụ huynh qua tin nhắn Zalo, Email hoặc in file PDF.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            {!isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <Check className="w-4 h-4" />
              <span>{isFirstTime ? 'Bắt đầu học ngay' : 'Lưu thông tin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
