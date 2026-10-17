import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Copy, 
  Mail, 
  Printer, 
  Check, 
  Calendar, 
  Clock, 
  Award, 
  Flame, 
  X, 
  User, 
  CheckCircle2, 
  BookOpen, 
  Send,
  Sparkles
} from 'lucide-react';
import { AppData, StudyLog, Subject, Task, UserProfile } from '../types';
import { getSubjectColor } from '../utils/colors';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  streak: number;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  appData,
  streak,
}) => {
  if (!isOpen) return null;

  const { profile, subjects, tasks, logs } = appData;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Report Period Selector
  const [period, setPeriod] = useState<'today' | 'yesterday' | 'week' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(todayStr);
  const [studentNote, setStudentNote] = useState('');
  const [copied, setCopied] = useState(false);

  // Compute logs in selected period
  const selectedLogs = useMemo(() => {
    return logs.filter(log => {
      const logDate = new Date(log.startTime || log.createdAt).toISOString().split('T')[0];

      if (period === 'today') return logDate === todayStr;
      if (period === 'yesterday') return logDate === yesterdayStr;
      if (period === 'custom') return logDate === customDate;
      if (period === 'week') {
        const d = new Date(log.startTime || log.createdAt);
        const daysDiff = Math.floor((Date.now() - d.getTime()) / 86400000);
        return daysDiff >= 0 && daysDiff < 7;
      }
      return false;
    });
  }, [logs, period, customDate, todayStr, yesterdayStr]);

  // Aggregate stats
  const totalMinutes = selectedLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const hoursNum = Math.floor(totalMinutes / 60);
  const minsNum = totalMinutes % 60;

  // Expected target
  const targetHours = period === 'week' ? profile.dailyGoalHours * 7 : profile.dailyGoalHours;
  const targetMinutes = targetHours * 60;
  const progressPercent = targetMinutes > 0 ? Math.min(200, Math.round((totalMinutes / targetMinutes) * 100)) : 0;

  // Performance Rating
  const getRating = () => {
    if (progressPercent >= 100) {
      return {
        label: '🌟 Xuất sắc (Vượt mục tiêu đề ra)',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        comment: 'Học sinh duy trì sự tập trung rất cao và hoàn thành vượt mức kế hoạch.',
      };
    }
    if (progressPercent >= 75) {
      return {
        label: '👍 Tốt (Đạt chuẩn chỉ tiêu)',
        color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
        comment: 'Học sinh hoàn thành tốt phần lớn thời lượng học tập theo mục tiêu.',
      };
    }
    return {
      label: '⏳ Cần cố gắng thêm',
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      comment: 'Chưa đạt đủ số giờ kỳ vọng, cần tăng cường thêm các phiên Pomodoro tiếp theo.',
    };
  };

  const rating = getRating();

  // Subject breakdown
  const subjectMinutesMap: Record<string, { minutes: number; count: number }> = {};
  selectedLogs.forEach(l => {
    if (!subjectMinutesMap[l.subjectId]) {
      subjectMinutesMap[l.subjectId] = { minutes: 0, count: 0 };
    }
    subjectMinutesMap[l.subjectId].minutes += l.durationMinutes;
    subjectMinutesMap[l.subjectId].count += 1;
  });

  const subjectBreakdown = Object.entries(subjectMinutesMap).map(([subId, data]) => {
    const sub = subjects.find(s => s.id === subId);
    const pct = totalMinutes > 0 ? Math.round((data.minutes / totalMinutes) * 100) : 0;
    return {
      id: subId,
      name: sub?.name || 'Môn học khác',
      icon: sub?.icon || '📚',
      color: sub?.color || 'indigo',
      minutes: data.minutes,
      count: data.count,
      pct,
    };
  }).sort((a, b) => b.minutes - a.minutes);

  // Completed Tasks in this period
  const completedTasks = tasks.filter(t => {
    if (!t.completed) return false;
    if (!t.completedAt) return period === 'today'; // fallback
    const compDate = new Date(t.completedAt).toISOString().split('T')[0];

    if (period === 'today') return compDate === todayStr;
    if (period === 'yesterday') return compDate === yesterdayStr;
    if (period === 'custom') return compDate === customDate;
    if (period === 'week') {
      const d = new Date(t.completedAt);
      const daysDiff = Math.floor((Date.now() - d.getTime()) / 86400000);
      return daysDiff >= 0 && daysDiff < 7;
    }
    return false;
  });

  // Date label string
  const getPeriodLabel = () => {
    if (period === 'today') return `Hôm nay, ngày ${new Date().toLocaleDateString('vi-VN')}`;
    if (period === 'yesterday') return `Hôm qua, ngày ${new Date(Date.now() - 86400000).toLocaleDateString('vi-VN')}`;
    if (period === 'week') return `Báo cáo 7 ngày gần nhất (${new Date(Date.now() - 6 * 86400000).toLocaleDateString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')})`;
    return `Ngày ${new Date(customDate).toLocaleDateString('vi-VN')}`;
  };

  // Generate plain-text report for Copying or Emailing
  const generateTextReport = () => {
    const studentName = profile.name || 'Học sinh';
    const className = profile.gradeOrClass ? ` (Lớp/Khóa: ${profile.gradeOrClass})` : '';
    const studentCode = profile.studentId ? ` [Mã HS: ${profile.studentId}]` : '';
    const supervisor = profile.supervisorName || 'Thầy/Cô/Phụ huynh';

    let text = `📋 BÁO CÁO KẾT QUẢ HỌC TẬP & HIỆU SUẤT THỜI GIAN\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 Học sinh: ${studentName}${className}${studentCode}\n`;
    text += `👨‍🏫 Kính gửi: ${supervisor}\n`;
    text += `📅 Kỳ báo cáo: ${getPeriodLabel()}\n`;
    text += `🔥 Chuỗi ngày học liên tục (Streak): ${streak} ngày\n\n`;

    text += `⏱️ TỔNG KẾT THỜI LƯỢNG HỌC:\n`;
    text += `• Tổng thời gian thực tế: ${hoursNum} giờ ${minsNum} phút (${totalMinutes} phút)\n`;
    text += `• Chỉ tiêu kỳ vọng: ${targetHours} giờ\n`;
    text += `• Tỷ lệ hoàn thành: ${progressPercent}% mục tiêu\n`;
    text += `• Đánh giá hiệu suất: ${rating.label}\n\n`;

    text += `📚 PHÂN BỔ THỜI GIAN THEO MÔN HỌC:\n`;
    if (subjectBreakdown.length === 0) {
      text += `• Chưa có phiên học ghi nhận trong khoảng thời gian này.\n`;
    } else {
      subjectBreakdown.forEach(s => {
        text += `• ${s.icon} ${s.name}: ${s.minutes} phút (${s.pct}%) - ${s.count} phiên\n`;
      });
    }

    text += `\n✅ NHIỆM VỤ ĐÃ HOÀN THÀNH (${completedTasks.length} nhiệm vụ):\n`;
    if (completedTasks.length === 0) {
      text += `• Không có nhiệm vụ nào hoàn thành trong kỳ này.\n`;
    } else {
      completedTasks.forEach(t => {
        const sub = subjects.find(s => s.id === t.subjectId);
        text += `• [x] ${t.title} (${sub?.name || 'Môn học'})\n`;
      });
    }

    if (studentNote.trim()) {
      text += `\n💬 LỜI NHẮN CỦA HỌC SINH:\n"${studentNote.trim()}"\n`;
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Báo cáo được xuất tự động từ Personal Study Time & Productivity Hub.`;
    return text;
  };

  const handleCopyReport = () => {
    const text = generateTextReport();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    const recipient = profile.supervisorEmail || '';
    const studentName = profile.name || 'Học sinh';
    const subject = encodeURIComponent(`[Báo Cáo Học Tập] - ${studentName} - ${getPeriodLabel()}`);
    const body = encodeURIComponent(generateTextReport());
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-850 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Báo Cáo Kết Quả Học Tập & Thời Gian</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-emerald-500/20 text-emerald-400">
                  CHÍNH THỨC
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tổng hợp kết quả học tập để báo cáo cho Thầy cô / Phụ huynh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-750 text-xs">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                period === 'today' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setPeriod('yesterday')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                period === 'yesterday' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hôm qua
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                period === 'week' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 ngày qua (Tuần)
            </button>
            <button
              onClick={() => setPeriod('custom')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                period === 'custom' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chọn ngày
            </button>
          </div>

          {period === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 outline-none"
            />
          )}

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Sao chép báo cáo để gửi qua Zalo / Messenger / Tin nhắn"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép Zalo/SMS'}</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
              title="Gửi báo cáo qua Email đến Thầy cô / Bố mẹ"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Gửi Email</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition"
              title="In phiếu kết quả hoặc lưu file PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Content Document Body */}
        <div id="printable-report" className="p-6 overflow-y-auto space-y-6 bg-slate-900 text-slate-100 print:bg-white print:text-black">
          {/* Formal Report Header */}
          <div className="border-b-2 border-slate-800 print:border-black pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-700">
                  HỆ THỐNG QUẢN LÝ THỜI GIAN & HIỆU SUẤT HỌC TẬP
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white print:text-black mt-1">
                  PHIẾU BÁO CÁO KẾT QUẢ HỌC TẬP
                </h1>
                <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
                  Thời gian: <strong className="text-slate-200 print:text-black">{getPeriodLabel()}</strong>
                </p>
              </div>

              {/* Student Identification Box */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 print:bg-gray-100 print:border-gray-300 text-xs space-y-1 sm:min-w-[240px]">
                <div className="flex items-center gap-1.5 text-slate-300 print:text-gray-800">
                  <User className="w-3.5 h-3.5 text-indigo-400 print:text-black" />
                  <span>Học sinh: <strong className="text-white print:text-black text-sm">{profile.name || '(Chưa nhập họ tên)'}</strong></span>
                </div>
                {profile.gradeOrClass && (
                  <p className="text-slate-400 print:text-gray-700">Lớp / Khóa: <span className="text-slate-200 print:text-black">{profile.gradeOrClass}</span></p>
                )}
                {profile.studentId && (
                  <p className="text-slate-400 print:text-gray-700">Mã HS: <span className="text-slate-200 print:text-black font-mono">{profile.studentId}</span></p>
                )}
                <p className="text-slate-400 print:text-gray-700 pt-1 border-t border-slate-700/60 print:border-gray-300">
                  Kính gửi: <strong className="text-amber-400 print:text-black">{profile.supervisorName || 'Thầy/Cô/Phụ huynh'}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Key KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-750 print:bg-gray-50 print:border-gray-200">
              <span className="text-[11px] font-semibold text-slate-400 print:text-gray-500">Tổng thời gian học</span>
              <div className="font-mono text-2xl font-bold text-indigo-400 print:text-indigo-700 mt-1">
                {hoursNum}h{minsNum}m
              </div>
              <span className="text-[10px] text-slate-500 print:text-gray-500">~{totalMinutes} phút tập trung</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-750 print:bg-gray-50 print:border-gray-200">
              <span className="text-[11px] font-semibold text-slate-400 print:text-gray-500">Mục tiêu đề ra</span>
              <div className="font-mono text-2xl font-bold text-slate-200 print:text-black mt-1">
                {targetHours}h
              </div>
              <span className="text-[10px] text-slate-500 print:text-gray-500">Đạt {progressPercent}% mục tiêu</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-750 print:bg-gray-50 print:border-gray-200">
              <span className="text-[11px] font-semibold text-slate-400 print:text-gray-500">Chuỗi ngày học liên tục</span>
              <div className="font-mono text-2xl font-bold text-amber-400 print:text-amber-600 mt-1 flex items-center gap-1">
                <Flame className="w-5 h-5 fill-current" />
                <span>{streak} ngày</span>
              </div>
              <span className="text-[10px] text-slate-500 print:text-gray-500">Study Streak 🔥</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-750 print:bg-gray-50 print:border-gray-200">
              <span className="text-[11px] font-semibold text-slate-400 print:text-gray-500">Số phiên tập trung</span>
              <div className="font-mono text-2xl font-bold text-violet-400 print:text-violet-700 mt-1">
                {selectedLogs.length}
              </div>
              <span className="text-[10px] text-slate-500 print:text-gray-500">Pomodoro & Stopwatch</span>
            </div>
          </div>

          {/* Assessment Banner */}
          <div className={`p-3.5 rounded-xl border ${rating.color} flex items-start gap-3 print:bg-gray-100 print:border-gray-300 print:text-black`}>
            <Award className="w-5 h-5 shrink-0 mt-0.5 text-amber-400 print:text-amber-600" />
            <div>
              <div className="font-bold text-sm text-slate-100 print:text-black">{rating.label}</div>
              <p className="text-xs text-slate-300 print:text-gray-700 mt-0.5">{rating.comment}</p>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400 print:text-indigo-600" />
              <span>Phân bổ thời gian theo môn học</span>
            </h3>

            <div className="rounded-xl border border-slate-800 print:border-gray-300 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 print:bg-gray-100 border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Môn học</th>
                    <th className="py-2.5 px-3 text-center">Số phiên</th>
                    <th className="py-2.5 px-3 text-center">Thời lượng</th>
                    <th className="py-2.5 px-3 text-right">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                  {subjectBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500 print:text-gray-500">
                        Chưa có dữ liệu học trong khoảng thời gian này
                      </td>
                    </tr>
                  ) : (
                    subjectBreakdown.map(sub => {
                      const col = getSubjectColor(sub.color);
                      return (
                        <tr key={sub.id} className="hover:bg-slate-850/40 print:hover:bg-transparent">
                          <td className="py-2.5 px-3 flex items-center gap-2 font-medium">
                            <span>{sub.icon}</span>
                            <span className="text-slate-200 print:text-black">{sub.name}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-300 print:text-black">
                            {sub.count}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-400 print:text-black">
                            {sub.minutes} phút ({Math.floor(sub.minutes / 60)}h{sub.minutes % 60}m)
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-300 print:text-black">
                            {sub.pct}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Completed Tasks Checklist */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-600" />
              <span>Nhiệm vụ đã hoàn thành ({completedTasks.length})</span>
            </h3>

            {completedTasks.length === 0 ? (
              <p className="text-xs text-slate-500 print:text-gray-500 italic py-1">
                Không có nhiệm vụ nào hoàn tất trong kỳ báo cáo này.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {completedTasks.map(t => {
                  const sub = subjects.find(s => s.id === t.subjectId);
                  return (
                    <div key={t.id} className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 print:bg-gray-50 print:border-gray-200 flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-slate-200 print:text-black truncate block">{t.title}</span>
                        <span className="text-[10px] text-slate-400 print:text-gray-500">{sub?.name || 'Môn học'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Student's Note / Message to Teacher or Parents */}
          <div className="space-y-2 print:border-t print:pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-700">
              Lời nhắn / Nhận xét của học sinh gửi Thầy cô & Phụ huynh:
            </label>
            <textarea
              rows={2}
              placeholder="Nhập nhận xét hoặc ghi chú cần trao đổi thêm (ví dụ: 'Hôm nay em đã nắm chắc lý thuyết chương 3, ngày mai em sẽ luyện thêm đề')..."
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 print:bg-white print:border-gray-300 text-slate-100 print:text-black outline-none focus:border-indigo-500"
            />
          </div>

          {/* Formal Signatures for Printing */}
          <div className="hidden print:grid grid-cols-2 pt-8 text-center text-xs">
            <div>
              <p className="font-bold text-gray-800">XÁC NHẬN CỦA HỌC SINH</p>
              <p className="text-gray-500 text-[10px] italic">(Ký và ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-semibold">{profile.name || 'Học sinh'}</p>
            </div>
            <div>
              <p className="font-bold text-gray-800">Ý KIẾN THẦY CÔ / PHỤ HUYNH</p>
              <p className="text-gray-500 text-[10px] italic">(Ký và nhận xét)</p>
              <div className="h-16"></div>
              <p className="font-semibold">{profile.supervisorName || 'Thầy/Cô/Phụ huynh'}</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gửi báo cáo qua Zalo, Messenger hoặc Email cho Thầy cô</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-750 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
              <span>{copied ? 'Đã sao chép vào bộ nhớ!' : 'Sao chép văn bản'}</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
            >
              <Mail className="w-4 h-4" />
              <span>Gửi Email báo cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
