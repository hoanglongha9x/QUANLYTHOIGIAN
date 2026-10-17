import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Clock, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  Check,
  Sparkles
} from 'lucide-react';
import { UserProfile, TimerSettings, AppData } from '../types';
import { AVATAR_OPTIONS } from '../utils/colors';
import { exportDataAsJSON, getDemoData } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateTimerSettings: (settings: TimerSettings) => void;
  onRestoreData: (data: AppData) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  appData,
  onUpdateProfile,
  onUpdateTimerSettings,
  onRestoreData,
  onResetData,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'timer' | 'data'>('profile');

  // Profile form
  const [name, setName] = useState(appData.profile.name);
  const [gradeOrClass, setGradeOrClass] = useState(appData.profile.gradeOrClass || '');
  const [studentId, setStudentId] = useState(appData.profile.studentId || '');
  const [avatar, setAvatar] = useState(appData.profile.avatar || '🦉');
  const [dailyGoalHours, setDailyGoalHours] = useState(appData.profile.dailyGoalHours);
  const [supervisorName, setSupervisorName] = useState(appData.profile.supervisorName || 'Thầy/Cô/Phụ huynh');
  const [supervisorEmail, setSupervisorEmail] = useState(appData.profile.supervisorEmail || '');

  // Timer form
  const [pomodoroMinutes, setPomodoroMinutes] = useState(appData.timerSettings.pomodoroMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(appData.timerSettings.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(appData.timerSettings.longBreakMinutes);

  // Data import feedback
  const [importMessage, setImportMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...appData.profile,
      name: name.trim(),
      gradeOrClass: gradeOrClass.trim(),
      studentId: studentId.trim(),
      avatar,
      dailyGoalHours: Number(dailyGoalHours),
      supervisorName: supervisorName.trim(),
      supervisorEmail: supervisorEmail.trim(),
      hasCustomizedName: true,
    });
    onClose();
  };

  const handleSaveTimer = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTimerSettings({
      ...appData.timerSettings,
      pomodoroMinutes: Number(pomodoroMinutes),
      shortBreakMinutes: Number(shortBreakMinutes),
      longBreakMinutes: Number(longBreakMinutes),
    });
    onClose();
  };

  // Import JSON File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile && parsed.subjects && Array.isArray(parsed.logs)) {
          onRestoreData(parsed);
          setImportMessage({ text: 'Khôi phục dữ liệu thành công!', type: 'success' });
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setImportMessage({ text: 'Tập tin JSON không đúng cấu trúc StudyHub!', type: 'error' });
        }
      } catch (err) {
        setImportMessage({ text: 'Không thể đọc tập tin JSON (lỗi cú pháp)!', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemo = () => {
    const demo = getDemoData(appData.profile);
    onRestoreData(demo);
    setImportMessage({ text: 'Đã nạp thành công 7 ngày dữ liệu mẫu!', type: 'success' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleConfirmReset = () => {
    onResetData();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Cài đặt & Quản lý Dữ liệu</h2>
            <p className="text-xs text-slate-400">Tùy biến hồ sơ cá nhân, đồng hồ và sao lưu dữ liệu</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-850 px-5 pt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ & Mục tiêu</span>
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'timer'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Tùy chỉnh Pomodoro</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'data'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Sao lưu & Dữ liệu</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ và tên học sinh <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ tên của bạn..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lớp / Khóa học
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 12A1"
                    value={gradeOrClass}
                    onChange={(e) => setGradeOrClass(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mã học sinh
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: HS-102"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-amber-400 mb-2">
                  Thông tin người nhận báo cáo học tập
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Thầy cô / Phụ huynh
                    </label>
                    <input
                      type="text"
                      placeholder="Thầy/Cô/Bố mẹ"
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Email nhận báo cáo
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={supervisorEmail}
                      onChange={(e) => setSupervisorEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Chọn biểu tượng Avatar cá nhân
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setAvatar(av)}
                      className={`h-9 rounded-xl text-lg flex items-center justify-center transition ${
                        avatar === av
                          ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-105 text-white'
                          : 'bg-slate-800 hover:bg-slate-750'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Mục tiêu học tập mỗi ngày (Số giờ)</span>
                  <span className="text-indigo-400 font-mono font-bold">{dailyGoalHours} giờ / ngày</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={dailyGoalHours}
                  onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1 giờ</span>
                  <span>3.5 giờ</span>
                  <span>6 giờ</span>
                  <span>12 giờ</span>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Lưu thay đổi hồ sơ
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: TIMER DURATION SETTINGS */}
          {activeTab === 'timer' && (
            <form onSubmit={handleSaveTimer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Thời lượng Tập trung (Pomodoro - Số phút)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={pomodoroMinutes}
                  onChange={(e) => setPomodoroMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nghỉ ngắn (Short Break - Phút)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={shortBreakMinutes}
                    onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nghỉ dài (Long Break - Phút)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={longBreakMinutes}
                    onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400">
                💡 Sau mỗi 4 chu kỳ Pomodoro hoàn thành, đồng hồ sẽ tự động kích hoạt phiên nghỉ dài để bạn thư giãn trí não.
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Lưu cấu hình đồng hồ
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: DATA MANAGEMENT & PORTABILITY */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              {importMessage && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  importMessage.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                }`}>
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{importMessage.text}</span>
                </div>
              )}

              {/* Export JSON Button */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Xuất dữ liệu (Export JSON)</p>
                  <p className="text-[11px] text-slate-400">Tải file sao lưu (.json) chứa hồ sơ, môn học, nhiệm vụ và nhật ký</p>
                </div>
                <button
                  onClick={() => exportDataAsJSON(appData)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất file</span>
                </button>
              </div>

              {/* Import JSON Button */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Nhập dữ liệu (Import JSON)</p>
                  <p className="text-[11px] text-slate-400">Khôi phục dữ liệu từ file sao lưu của bạn</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shrink-0 transition"
                >
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Chọn file JSON</span>
                </button>
              </div>

              {/* Load Demo Data */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Tạo dữ liệu mẫu (Load Demo Data)</p>
                  <p className="text-[11px] text-slate-400">Nạp dữ liệu 7 ngày qua để kiểm tra biểu đồ và tính năng</p>
                </div>
                <button
                  onClick={handleLoadDemo}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold shrink-0 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Nạp Demo</span>
                </button>
              </div>

              {/* Reset Data */}
              <div className="pt-2 border-t border-slate-800">
                {showResetConfirm ? (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 space-y-2">
                    <p className="text-xs font-medium text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Thao tác này không thể hoàn tác!
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1 rounded text-xs bg-slate-800 text-slate-300"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleConfirmReset}
                        className="px-3 py-1 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                      >
                        Xóa tất cả ngay
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 py-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa trắng toàn bộ dữ liệu (Reset Data)</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
