import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CheckCircle2, Circle, Trash2, Calendar, AlertTriangle, X, Tag, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../supabase';
import type { Task } from '../types';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  orgId: string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export default function TasksView({ tasks, setTasks, orgId, showSuccess, showError }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'Pending') return !t.completed;
    if (filter === 'Completed') return t.completed;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).getTime() : Date.now() + 86400000,
      completed: false,
      relatedToType: 'lead',
      relatedToId: '',
      createdAt: Date.now(),
    };

    try {
      const { error } = await supabase.from('activities').insert([{
        id: newTask.id,
        org_id: orgId || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b',
        type: 'task',
        title: newTask.title,
        description: newTask.description,
        due_at: new Date(newTask.dueDate).toISOString(),
        status: newTask.completed ? 'completed' : 'pending',
      }]);

      if (error) throw error;
      setTasks(prev => [newTask, ...prev]);
      setIsAdding(false);
      setTitle('');
      setDescription('');
      showSuccess('Task added successfully.');
    } catch (err: any) {
      showError(`Failed to save task: ${err.message}`);
    }
  };

  const toggleTask = async (task: Task) => {
    const updatedStatus = !task.completed;
    try {
      const { error } = await supabase.from('activities').update({ 
        status: updatedStatus ? 'completed' : 'pending',
        completed_at: updatedStatus ? new Date().toISOString() : null
      }).eq('id', task.id);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t));
      showSuccess(updatedStatus ? 'Task completed!' : 'Task re-opened.');
    } catch (err: any) {
      showError(`Failed to update task: ${err.message}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
      showSuccess('Task deleted.');
    } catch (err: any) {
      showError(`Failed to delete task: ${err.message}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workspace Tasks</h1>
          <p className="text-slate-500 text-sm">Organize follow-ups, calls, and business delivery milestones</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md">
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filters & Toggles */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {(['All', 'Pending', 'Completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
        {filteredTasks.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            <CheckCircle2 size={48} className="mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="font-semibold text-sm">Clean sheet! No tasks to show.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-start gap-4 flex-1">
                <button onClick={() => toggleTask(task)} className="mt-0.5 flex-shrink-0">
                  {task.completed ? (
                    <CheckCircle2 size={22} className="text-emerald-500" />
                  ) : (
                    <Circle size={22} className="text-slate-300 hover:text-blue-600 transition-colors" />
                  )}
                </button>
                <div>
                  <h4 className={`font-bold text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-850'}`}>{task.title}</h4>
                  <p className={`text-xs mt-1 ${task.completed ? 'text-slate-300' : 'text-slate-500'}`}>{task.description || 'No description provided.'}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> {format(task.dueDate, 'dd MMM yyyy')}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {task.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <button onClick={() => deleteTask(task.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAdding(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-905">Create Workspace Task</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={18} /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                  <input
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. GST Audit submission"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Notes, references, next actions..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-200 animate-none">
                  Create Task
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
