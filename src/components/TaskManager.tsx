import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Plus, 
  Search, 
  Play, 
  Calendar, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Filter,
  CheckSquare,
  Clock,
  Sparkles
} from 'lucide-react';
import { Task, Subject, Priority } from '../types';
import { getSubjectColor } from '../utils/colors';

interface TaskManagerProps {
  tasks: Task[];
  subjects: Subject[];
  onAddTask: (task: Omit<Task, 'id' | 'actualMinutes' | 'completed' | 'createdAt'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onSelectForFocus: (task: Task) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  subjects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onSelectForFocus,
}) => {
  const [filterTab, setFilterTab] = useState<'today' | 'upcoming' | 'completed' | 'all'>('today');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(2);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setPriority('medium');
    setEstimatedPomodoros(2);
    setDueDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setSubjectId(task.subjectId);
    setPriority(task.priority);
    setEstimatedPomodoros(task.estimatedPomodoros);
    setDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: title.trim(),
        subjectId,
        priority,
        estimatedPomodoros,
        dueDate,
      });
    } else {
      onAddTask({
        title: title.trim(),
        subjectId,
        priority,
        estimatedPomodoros,
        dueDate,
      });
    }
    setIsModalOpen(false);
  };

  const toggleTaskCompletion = (task: Task) => {
    onUpdateTask({
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    });
  };

  // Filter logic
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter(task => {
    // Subject filter
    if (selectedSubjectFilter !== 'all' && task.subjectId !== selectedSubjectFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim() && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Tab filter
    if (filterTab === 'today') {
      return !task.completed && (!task.dueDate || task.dueDate <= todayStr);
    }
    if (filterTab === 'upcoming') {
      return !task.completed && task.dueDate && task.dueDate > todayStr;
    }
    if (filterTab === 'completed') {
      return task.completed;
    }
    return true; // 'all'
  });

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">Cao</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Trung bình</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">Thấp</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span>Danh sách Nhiệm vụ Học tập (To-do List)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Theo dõi tiến độ, số Pomodoro dự kiến và thời gian học thực tế
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhiệm vụ mới</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterTab('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterTab === 'today'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setFilterTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterTab === 'upcoming'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Sắp tới
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterTab === 'completed'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Đã hoàn thành
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Tất cả ({tasks.length})
          </button>
        </div>

        {/* Search & Subject filter */}
        <div className="flex items-center gap-2">
          {/* Subject Filter Dropdown */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="all">Mọi môn học</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 text-slate-500">
            <Sparkles className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-400">Không có nhiệm vụ nào trong mục này</p>
            <p className="text-xs text-slate-500 mt-1">Bấm "Thêm nhiệm vụ mới" để lên kế hoạch học tập</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const subject = subjects.find(s => s.id === task.subjectId);
            const colorObj = getSubjectColor(subject?.color);
            const actualPomodoros = (task.actualMinutes / 25).toFixed(1);

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 group ${
                  task.completed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Left: Checkbox + Title + Metadata */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleTaskCompletion(task)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-400 transition shrink-0"
                    title={task.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold truncate ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}>
                        {task.title}
                      </p>

                      {/* Subject Badge */}
                      {subject && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                          {subject.icon} {subject.name}
                        </span>
                      )}

                      {/* Priority Badge */}
                      {getPriorityBadge(task.priority)}
                    </div>

                    {/* Sub-meta: Pomodoro Progress & Due Date */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5 flex-wrap">
                      {/* Pomodoros: Estimated vs Actual */}
                      <span className="flex items-center gap-1 text-[11px]">
                        <span>🍅 Dự kiến: <strong className="text-slate-200">{task.estimatedPomodoros}</strong> ({task.estimatedPomodoros * 25}p)</span>
                        <span className="text-slate-600">|</span>
                        <span>Đã học: <strong className="text-indigo-400">{task.actualMinutes}m</strong> (~{actualPomodoros} 🍅)</span>
                      </span>

                      {/* Due Date */}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Hạn: {task.dueDate}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions: Focus Now, Edit, Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  {!task.completed && (
                    <button
                      onClick={() => onSelectForFocus(task)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold transition border border-indigo-500/30"
                      title="Nạp vào Trạm Tập trung & Học ngay"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Học ngay</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                    title="Chỉnh sửa nhiệm vụ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                    title="Xóa nhiệm vụ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingTask ? 'Chỉnh sửa nhiệm vụ' : 'Thêm nhiệm vụ học tập'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên nhiệm vụ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đọc chương 4 Giải tích, Làm bài tập LeetCode..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Môn học liên kết <span className="text-rose-400">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Độ ưu tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                  >
                    <option value="high">🔴 Cao</option>
                    <option value="medium">🟡 Trung bình</option>
                    <option value="low">🔵 Thấp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dự kiến (Số Pomodoro)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={estimatedPomodoros}
                    onChange={(e) => setEstimatedPomodoros(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hạn chót hoàn thành (Due date)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                  {editingTask ? 'Lưu thay đổi' : 'Thêm nhiệm vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
