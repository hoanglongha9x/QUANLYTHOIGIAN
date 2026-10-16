import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  LineController
} from 'chart.js';
import { 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  Award, 
  Calendar, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { Subject, StudyLog, UserProfile } from '../types';
import { getSubjectColor } from '../utils/colors';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  PointElement,
  LineController,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsViewProps {
  logs: StudyLog[];
  subjects: Subject[];
  profile: UserProfile;
  theme: 'dark' | 'light';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  logs,
  subjects,
  profile,
  theme,
}) => {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const doughnutChartRef = useRef<HTMLCanvasElement>(null);
  const barInstance = useRef<ChartJS | null>(null);
  const doughnutInstance = useRef<ChartJS | null>(null);

  // Compute 7-day stats
  const now = new Date();
  const last7Days: { dateStr: string; label: string; minutes: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.toLocaleDateString('vi-VN', { weekday: 'short' });
    const dayMonth = `${d.getDate()}/${d.getMonth() + 1}`;
    const label = i === 0 ? `Hôm nay (${dayMonth})` : `${dayOfWeek} ${dayMonth}`;

    const dayMinutes = logs
      .filter(l => {
        const logDate = new Date(l.startTime || l.createdAt).toISOString().split('T')[0];
        return logDate === dateStr;
      })
      .reduce((sum, l) => sum + l.durationMinutes, 0);

    last7Days.push({ dateStr, label, minutes: dayMinutes });
  }

  // Calculate subject breakdown for Doughnut
  const subjectMinutesMap: Record<string, number> = {};
  subjects.forEach(s => { subjectMinutesMap[s.id] = 0; });
  logs.forEach(l => {
    subjectMinutesMap[l.subjectId] = (subjectMinutesMap[l.subjectId] || 0) + l.durationMinutes;
  });

  const activeSubjects = subjects.filter(s => (subjectMinutesMap[s.id] || 0) > 0);
  const doughnutLabels = activeSubjects.length > 0 
    ? activeSubjects.map(s => `${s.icon} ${s.name}`)
    : ['Chưa có dữ liệu'];
  const doughnutData = activeSubjects.length > 0
    ? activeSubjects.map(s => Number(((subjectMinutesMap[s.id] || 0) / 60).toFixed(1)))
    : [1];
  const doughnutColors = activeSubjects.length > 0
    ? activeSubjects.map(s => getSubjectColor(s.color).chartColor)
    : ['#64748b'];

  const totalWeeklyMinutes = last7Days.reduce((acc, cur) => acc + cur.minutes, 0);
  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);
  const dailyAverageHours = (totalWeeklyMinutes / 7 / 60).toFixed(1);
  const daysGoalAchieved = last7Days.filter(d => d.minutes >= profile.dailyGoalHours * 60).length;

  // Render or Update Bar Chart
  useEffect(() => {
    if (!barChartRef.current) return;

    if (barInstance.current) {
      barInstance.current.destroy();
    }

    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
    const targetHours = profile.dailyGoalHours;

    const ctx = barChartRef.current.getContext('2d');
    if (!ctx) return;

    barInstance.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: last7Days.map(d => d.label),
        datasets: [
          {
            type: 'bar',
            label: 'Thời gian học thực tế (Giờ)',
            data: last7Days.map(d => Number((d.minutes / 60).toFixed(2))),
            backgroundColor: last7Days.map(d => 
              (d.minutes / 60) >= targetHours 
                ? 'rgba(99, 102, 241, 0.85)' 
                : 'rgba(129, 140, 248, 0.55)'
            ),
            borderColor: '#6366f1',
            borderWidth: 1.5,
            borderRadius: 8,
            order: 2,
          },
          {
            type: 'line',
            label: `Mục tiêu ngày (${targetHours}h)`,
            data: last7Days.map(() => targetHours),
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 3,
            pointBackgroundColor: '#f59e0b',
            fill: false,
            order: 1,
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
              },
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            titleColor: isDark ? '#ffffff' : '#0f172a',
            bodyColor: isDark ? '#cbd5e1' : '#334155',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (item) => {
                const val = item.raw as number;
                return ` ${item.dataset.label}: ${val} giờ (${Math.round(val * 60)} phút)`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColor,
              font: { size: 10 },
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor,
              font: { size: 10 },
              callback: (val) => `${val}h`,
            },
            grid: {
              color: gridColor,
            },
          },
        },
      },
    });

    return () => {
      barInstance.current?.destroy();
    };
  }, [logs, profile.dailyGoalHours, theme]);

  // Render or Update Doughnut Chart
  useEffect(() => {
    if (!doughnutChartRef.current) return;

    if (doughnutInstance.current) {
      doughnutInstance.current.destroy();
    }

    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const ctx = doughnutChartRef.current.getContext('2d');
    if (!ctx) return;

    doughnutInstance.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: doughnutLabels,
        datasets: [
          {
            data: doughnutData,
            backgroundColor: doughnutColors,
            borderColor: isDark ? '#0f172a' : '#ffffff',
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
              },
              usePointStyle: true,
              padding: 14,
            },
          },
          tooltip: {
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            titleColor: isDark ? '#ffffff' : '#0f172a',
            bodyColor: isDark ? '#cbd5e1' : '#334155',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            callbacks: {
              label: (item) => {
                const total = doughnutData.reduce((a, b) => a + b, 0);
                const val = item.raw as number;
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return ` ${item.label}: ${val} giờ (${pct}%)`;
              },
            },
          },
        },
        cutout: '68%',
      },
    });

    return () => {
      doughnutInstance.current?.destroy();
    };
  }, [logs, subjects, theme]);

  return (
    <div className="space-y-5">
      {/* KPI Overview Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Tổng học 7 ngày</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white">
            {totalWeeklyHours} <span className="text-xs font-normal text-slate-400 font-sans">giờ</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">~{totalWeeklyMinutes} phút tích lũy</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Trung bình / ngày</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-400">
            {dailyAverageHours} <span className="text-xs font-normal text-slate-400 font-sans">giờ</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Mục tiêu: {profile.dailyGoalHours}h/ngày</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Đạt mục tiêu tuần</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-amber-400">
            {daysGoalAchieved}/7 <span className="text-xs font-normal text-slate-400 font-sans">ngày</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {Math.round((daysGoalAchieved / 7) * 100)}% ngày hoàn thành
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Tổng phiên học</span>
            <CheckCircle2 className="w-4 h-4 text-violet-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-violet-400">
            {logs.length} <span className="text-xs font-normal text-slate-400 font-sans">phiên</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pomodoro & Stopwatch</p>
        </div>
      </div>

      {/* Chart.js Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart (2 columns on desktop) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <span>Thời gian học tập thực tế (7 ngày qua)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                So sánh số giờ học thực tế với đường mục tiêu ngày ({profile.dailyGoalHours}h)
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full relative">
            <canvas ref={barChartRef} />
          </div>
        </div>

        {/* Doughnut Chart (1 column on desktop) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-violet-400" />
              <span>Phân bổ môn học</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tỷ lệ thời gian giữa các môn
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full relative flex items-center justify-center my-auto">
            <canvas ref={doughnutChartRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
