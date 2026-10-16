import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  Headphones, 
  BookOpen, 
  AlertCircle,
  Timer as TimerIcon,
  Flame,
  Award
} from 'lucide-react';
import { Subject, Task, TimerSettings, StudyLog } from '../types';
import { playGentleBell, ambientPlayer } from '../utils/audio';
import { getSubjectColor } from '../utils/colors';

interface FocusTimerProps {
  subjects: Subject[];
  tasks: Task[];
  timerSettings: TimerSettings;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  selectedTaskId: string;
  setSelectedTaskId: (id: string) => void;
  onSessionComplete: (log: Omit<StudyLog, 'id' | 'createdAt'>) => void;
  onOpenManualLog: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  subjects,
  tasks,
  timerSettings,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedTaskId,
  setSelectedTaskId,
  onSessionComplete,
}) => {
  // Main modes: 'pomodoro' | 'stopwatch'
  const [mainMode, setMainMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  // Pomodoro sub-modes: 'focus' | 'shortBreak' | 'longBreak'
  const [pomodoroStage, setPomodoroStage] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSettings.pomodoroMinutes * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeAmbient, setActiveAmbient] = useState<'none' | 'rain' | 'whitenoise' | 'waves'>('none');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Available tasks for the selected subject
  const availableTasks = tasks.filter(t => !t.completed && (selectedSubjectId ? t.subjectId === selectedSubjectId : true));
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Total seconds calculation for progress circle
  const getTotalStageSeconds = () => {
    if (pomodoroStage === 'focus') return timerSettings.pomodoroMinutes * 60;
    if (pomodoroStage === 'shortBreak') return timerSettings.shortBreakMinutes * 60;
    return timerSettings.longBreakMinutes * 60;
  };

  // Sync time if timerSettings change and timer is idle
  useEffect(() => {
    if (!isRunning && mainMode === 'pomodoro') {
      setTimeLeft(getTotalStageSeconds());
    }
  }, [timerSettings.pomodoroMinutes, timerSettings.shortBreakMinutes, timerSettings.longBreakMinutes, pomodoroStage]);

  // Main tick loop
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (isRunning) {
      timerId = setInterval(() => {
        if (mainMode === 'pomodoro') {
          setTimeLeft(prev => {
            if (prev <= 1) {
              handleTimerFinish();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds(prev => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRunning, mainMode, pomodoroStage, selectedSubjectId, selectedTaskId]);

  // Handle successful completion of a Pomodoro cycle
  const handleTimerFinish = () => {
    setIsRunning(false);

    // Play soothing bell chime
    if (timerSettings.soundVolume > 0) {
      playGentleBell(timerSettings.soundVolume);
    }

    // Trigger colorful confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // Ignore confetti issues if browser restricts
    }

    const durationMinutes = Math.round(getTotalStageSeconds() / 60);

    // Only log if it was a FOCUS session and subject was chosen
    if (pomodoroStage === 'focus' && selectedSubjectId) {
      const now = new Date();
      const start = sessionStartTime || new Date(now.getTime() - durationMinutes * 60000);

      onSessionComplete({
        subjectId: selectedSubjectId,
        taskId: selectedTaskId || undefined,
        startTime: start.toISOString(),
        endTime: now.toISOString(),
        durationMinutes: durationMinutes,
        mode: 'pomodoro',
        notes: `Phiên Pomodoro hoàn thành (${durationMinutes}p)`,
      });

      const nextCount = pomodoroCount + 1;
      setPomodoroCount(nextCount);

      // Auto switch to break
      if (nextCount % timerSettings.longBreakInterval === 0) {
        setPomodoroStage('longBreak');
        setTimeLeft(timerSettings.longBreakMinutes * 60);
      } else {
        setPomodoroStage('shortBreak');
        setTimeLeft(timerSettings.shortBreakMinutes * 60);
      }
    } else {
      // Break finished, return to focus
      setPomodoroStage('focus');
      setTimeLeft(timerSettings.pomodoroMinutes * 60);
    }

    setSessionStartTime(null);
  };

  const handleStart = () => {
    // Require subject only for focus work
    if ((mainMode === 'pomodoro' && pomodoroStage === 'focus') || mainMode === 'stopwatch') {
      if (!selectedSubjectId) {
        setValidationError('Vui lòng chọn Môn học trước khi bắt đầu phiên học!');
        return;
      }
    }

    setValidationError(null);
    if (!isRunning) {
      setSessionStartTime(new Date());
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mainMode === 'pomodoro') {
      setTimeLeft(getTotalStageSeconds());
    } else {
      setStopwatchSeconds(0);
    }
    setSessionStartTime(null);
  };

  // Early finish & log whatever time was spent
  const handleFinishEarly = () => {
    if (!selectedSubjectId) {
      setValidationError('Vui lòng chọn Môn học để lưu phiên học!');
      return;
    }

    let studiedMinutes = 0;
    if (mainMode === 'pomodoro') {
      const totalSec = getTotalStageSeconds();
      const elapsedSec = totalSec - timeLeft;
      studiedMinutes = Math.max(1, Math.round(elapsedSec / 60));
    } else {
      studiedMinutes = Math.max(1, Math.round(stopwatchSeconds / 60));
    }

    if (studiedMinutes < 1) {
      setIsRunning(false);
      handleReset();
      return;
    }

    setIsRunning(false);

    if (timerSettings.soundVolume > 0) {
      playGentleBell(timerSettings.soundVolume * 0.7);
    }

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    const now = new Date();
    const start = sessionStartTime || new Date(now.getTime() - studiedMinutes * 60000);

    onSessionComplete({
      subjectId: selectedSubjectId,
      taskId: selectedTaskId || undefined,
      startTime: start.toISOString(),
      endTime: now.toISOString(),
      durationMinutes: studiedMinutes,
      mode: mainMode,
      notes: `Hoàn thành phiên tự nguyện (${studiedMinutes} phút)`,
    });

    handleReset();
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (pomodoroStage === 'focus') {
      setPomodoroStage('shortBreak');
      setTimeLeft(timerSettings.shortBreakMinutes * 60);
    } else {
      setPomodoroStage('focus');
      setTimeLeft(timerSettings.pomodoroMinutes * 60);
    }
    setSessionStartTime(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format time mm:ss or hh:mm:ss
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // SVG circular progress calculation
  const totalSeconds = getTotalStageSeconds();
  const progressPercent = mainMode === 'pomodoro' 
    ? ((totalSeconds - timeLeft) / totalSeconds) * 100 
    : Math.min(100, (stopwatchSeconds % 3600) / 36);

  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const subjectColorObj = getSubjectColor(selectedSubject?.color);

  // Handle ambient noise selection
  const handleAmbientChange = (type: 'none' | 'rain' | 'whitenoise' | 'waves') => {
    setActiveAmbient(type);
    ambientPlayer.start(type, timerSettings.soundVolume || 0.5);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 flex flex-col items-center justify-between shadow-xl transition-all ${
        isFullscreen ? 'h-screen w-screen justify-center bg-slate-950 p-12' : ''
      }`}
    >
      {/* Top Header: Mode Switchers & Fullscreen */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-750">
          <button
            onClick={() => {
              if (isRunning) return;
              setMainMode('pomodoro');
              setPomodoroStage('focus');
              setTimeLeft(timerSettings.pomodoroMinutes * 60);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              mainMode === 'pomodoro'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🍅 Pomodoro
          </button>
          <button
            onClick={() => {
              if (isRunning) return;
              setMainMode('stopwatch');
              setStopwatchSeconds(0);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              mainMode === 'stopwatch'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⏱️ Đếm tiến (Stopwatch)
          </button>
        </div>

        {/* Ambient Sound & Fullscreen controls */}
        <div className="flex items-center gap-2">
          {/* Ambient Noise Selector */}
          <div className="flex items-center gap-1 bg-slate-800/70 border border-slate-750 p-1 rounded-xl text-xs">
            <Headphones className="w-3.5 h-3.5 ml-2 text-indigo-400" />
            <select
              value={activeAmbient}
              onChange={(e) => handleAmbientChange(e.target.value as any)}
              className="bg-transparent text-slate-300 text-xs px-2 py-1 outline-none cursor-pointer"
            >
              <option value="none" className="bg-slate-900 text-slate-300">Không nền</option>
              <option value="rain" className="bg-slate-900 text-slate-300">🌧️ Tiếng mưa rơi</option>
              <option value="whitenoise" className="bg-slate-900 text-slate-300">📻 Tiếng ồn trắng</option>
              <option value="waves" className="bg-slate-900 text-slate-300">🌊 Sóng biển dạt</option>
            </select>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-750 text-slate-400 hover:text-slate-200 transition"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình tập trung'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pomodoro Sub-stages tabs */}
      {mainMode === 'pomodoro' && (
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => {
              if (isRunning) return;
              setPomodoroStage('focus');
              setTimeLeft(timerSettings.pomodoroMinutes * 60);
            }}
            className={`px-3 py-1 text-xs rounded-full font-medium transition ${
              pomodoroStage === 'focus'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Tập trung ({timerSettings.pomodoroMinutes}p)
          </button>
          <button
            onClick={() => {
              if (isRunning) return;
              setPomodoroStage('shortBreak');
              setTimeLeft(timerSettings.shortBreakMinutes * 60);
            }}
            className={`px-3 py-1 text-xs rounded-full font-medium transition ${
              pomodoroStage === 'shortBreak'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Nghỉ ngắn ({timerSettings.shortBreakMinutes}p)
          </button>
          <button
            onClick={() => {
              if (isRunning) return;
              setPomodoroStage('longBreak');
              setTimeLeft(timerSettings.longBreakMinutes * 60);
            }}
            className={`px-3 py-1 text-xs rounded-full font-medium transition ${
              pomodoroStage === 'longBreak'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Nghỉ dài ({timerSettings.longBreakMinutes}p)
          </button>
        </div>
      )}

      {/* Pre-selection Inputs: Subject & Task (Required before study session) */}
      <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-slate-800/40 border border-slate-750/70">
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Môn học / Chủ đề <span className="text-rose-400">*</span></span>
            {selectedSubject && (
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-normal ${subjectColorObj.badgeBg} ${subjectColorObj.badgeText}`}>
                {selectedSubject.icon} {selectedSubject.name}
              </span>
            )}
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setValidationError(null);
            }}
            disabled={isRunning}
            className={`w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border text-slate-200 outline-none transition ${
              validationError && !selectedSubjectId
                ? 'border-rose-500 ring-2 ring-rose-500/20'
                : 'border-slate-700 hover:border-slate-600 focus:border-indigo-500'
            }`}
          >
            <option value="" disabled>-- Chọn môn học --</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
            Nhiệm vụ đang làm (To-do)
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            disabled={isRunning}
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 text-slate-200 outline-none transition"
          >
            <option value="">🎯 Phiên tập trung tự do</option>
            {availableTasks.map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation Message */}
      {validationError && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium animate-bounce">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* SVG Circular Progress & Countdown / Count-up Display */}
      <div className="relative my-4 flex items-center justify-center">
        <svg className="w-72 h-72 md:w-80 md:h-80 -rotate-90 transform">
          {/* Background Track */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            strokeWidth="12"
            className="stroke-slate-800/80 fill-none"
          />
          {/* Active Progress Trail */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`fill-none transition-all duration-700 ${
              pomodoroStage === 'focus' || mainMode === 'stopwatch'
                ? 'stroke-indigo-500 drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                : 'stroke-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]'
            }`}
          />
        </svg>

        {/* Center Clock Numbers */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="font-mono font-bold text-5xl md:text-6xl text-white tracking-wider font-mono-timer drop-shadow">
            {mainMode === 'pomodoro' ? formatTime(timeLeft) : formatTime(stopwatchSeconds)}
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
            {isRunning ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Đang tập trung...
              </span>
            ) : (
              <span className="text-slate-500">Sẵn sàng học tập</span>
            )}
          </div>

          {/* Active Task / Subject Pill */}
          {selectedSubject && (
            <div className="mt-3 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 max-w-[200px] truncate">
              {selectedTask ? selectedTask.title : selectedSubject.name}
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={handleReset}
          className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
          title="Đặt lại phiên học"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {isRunning ? (
          <button
            onClick={handlePause}
            className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base flex items-center gap-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95"
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>Tạm dừng</span>
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Bắt đầu học</span>
          </button>
        )}

        {/* Early finish button */}
        {(isRunning || stopwatchSeconds > 60 || (mainMode === 'pomodoro' && timeLeft < getTotalStageSeconds() - 60)) && (
          <button
            onClick={handleFinishEarly}
            className="p-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 transition"
            title="Kết thúc sớm & Cộng thời gian học"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        )}

        {mainMode === 'pomodoro' && (
          <button
            onClick={handleSkip}
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            title="Bỏ qua / Chuyển sang giai đoạn tiếp theo"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Pomodoro streak count bullets */}
      {mainMode === 'pomodoro' && (
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <span>Chu kỳ Pomodoro hôm nay:</span>
          <div className="flex items-center gap-1">
            {[...Array(4)].map((_, idx) => (
              <span
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx < (pomodoroCount % 4)
                    ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
                title={`Pomodoro ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-500">({pomodoroCount} phiên)</span>
        </div>
      )}
    </div>
  );
};
