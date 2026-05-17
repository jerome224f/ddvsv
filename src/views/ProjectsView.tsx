import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Briefcase, CheckCircle2, Circle, Trash2, Edit2, X, ChevronRight, Calendar, Target, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../supabase';
import type { Project, Milestone } from '../types';

const STATUS_COLORS: Record<string, string> = {
  'Planning': 'bg-slate-100 text-slate-600',
  'Active': 'bg-blue-100 text-blue-700',
  'On Hold': 'bg-amber-100 text-amber-700',
  'Completed': 'bg-emerald-100 text-emerald-700',
};

interface Props {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  orgId: string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export default function ProjectsView({ projects, setProjects, orgId, showSuccess, showError }: Props) {
  const [selected, setSelected] = useState<Project | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDue, setMilestoneDue] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [editProject, setEditProject] = useState<Project | null>(null);

  const statuses = ['All', 'Planning', 'Active', 'On Hold', 'Completed'];

  const filtered = filterStatus === 'All' ? projects : projects.filter(p => p.status === filterStatus);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      status: fd.get('status') as any,
      milestones: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    try {
      const { error } = await supabase.from('projects').insert([{
        id: newProject.id,
        org_id: orgId || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b',
        name: newProject.name,
        description: newProject.description,
        status: newProject.status.toLowerCase().replace(' ', '_'),
      }]);
      if (error) throw error;
      setProjects(prev => [newProject, ...prev]);
      setIsAdding(false);
      showSuccess('Project created successfully!');
    } catch (err: any) {
      showError(`Failed to create project: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      if (selected?.id === id) setSelected(null);
      showSuccess('Project deleted.');
    } catch (err: any) {
      showError(`Delete failed: ${err.message}`);
    }
  };

  const handleStatusChange = async (project: Project, newStatus: string) => {
    try {
      await supabase.from('projects').update({ status: newStatus.toLowerCase().replace(' ', '_'), updated_at: new Date().toISOString() }).eq('id', project.id);
      const updated = { ...project, status: newStatus as any, updatedAt: Date.now() };
      setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
      if (selected?.id === project.id) setSelected(updated);
      showSuccess('Status updated.');
    } catch (err: any) {
      showError(`Update failed: ${err.message}`);
    }
  };

  const addMilestone = (project: Project) => {
    if (!milestoneTitle.trim()) return;
    const milestone: Milestone = {
      id: crypto.randomUUID(),
      projectId: project.id,
      title: milestoneTitle,
      description: '',
      dueDate: milestoneDue ? new Date(milestoneDue).getTime() : Date.now() + 7 * 86400000,
      completed: false,
      createdAt: Date.now(),
    };
    const updated = { ...project, milestones: [...project.milestones, milestone], updatedAt: Date.now() };
    setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
    setSelected(updated);
    setMilestoneTitle('');
    setMilestoneDue('');
  };

  const toggleMilestone = (project: Project, msId: string) => {
    const updated = {
      ...project,
      milestones: project.milestones.map(m => m.id === msId ? { ...m, completed: !m.completed } : m),
      updatedAt: Date.now(),
    };
    setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
    setSelected(updated);
  };

  const deleteMilestone = (project: Project, msId: string) => {
    const updated = { ...project, milestones: project.milestones.filter(m => m.id !== msId) };
    setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
    setSelected(updated);
  };

  // Detail view
  if (selected) {
    const done = selected.milestones.filter(m => m.completed).length;
    const total = selected.milestones.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{selected.name}</h1>
            <p className="text-slate-500 text-sm">{selected.description}</p>
          </div>
          <select
            value={selected.status}
            onChange={e => handleStatusChange(selected, e.target.value)}
            className={`px-3 py-2 rounded-xl text-sm font-bold border-0 outline-none cursor-pointer ${STATUS_COLORS[selected.status] || 'bg-slate-100'}`}
          >
            {['Planning','Active','On Hold','Completed'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => handleDelete(selected.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
            <Trash2 size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-700">Progress</span>
            <span className="text-2xl font-bold text-blue-600">{pct}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">{done} of {total} milestones completed</p>
        </div>

        {/* Add Milestone */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Target size={16} className="text-indigo-500" /> Add Milestone</h3>
          <div className="flex gap-3">
            <input
              value={milestoneTitle}
              onChange={e => setMilestoneTitle(e.target.value)}
              placeholder="Milestone title..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={e => e.key === 'Enter' && addMilestone(selected)}
            />
            <input
              type="date"
              value={milestoneDue}
              onChange={e => setMilestoneDue(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button onClick={() => addMilestone(selected)} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
              Add
            </button>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Milestones</h3>
          </div>
          {selected.milestones.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <Target size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No milestones yet. Add one above.</p>
            </div>
          )}
          <div className="divide-y divide-slate-50">
            {selected.milestones.map(ms => (
              <div key={ms.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 group transition-colors">
                <button onClick={() => toggleMilestone(selected, ms.id)} className="flex-shrink-0">
                  {ms.completed
                    ? <CheckCircle2 size={22} className="text-emerald-500" />
                    : <Circle size={22} className="text-slate-300 hover:text-blue-400 transition-colors" />}
                </button>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${ms.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{ms.title}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar size={10} /> Due {format(ms.dueDate, 'MMM d, yyyy')}
                  </p>
                </div>
                <button onClick={() => deleteMilestone(selected, ms.id)} className="p-1.5 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm">Track your project milestones and delivery</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md">
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${filterStatus === s ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Planning','Active','On Hold','Completed'].map((s, i) => {
          const colors = ['bg-slate-50 text-slate-600','bg-blue-50 text-blue-700','bg-amber-50 text-amber-700','bg-emerald-50 text-emerald-700'];
          return (
            <div key={s} className={`p-4 rounded-2xl border border-slate-100 ${colors[i]}`}>
              <p className="text-2xl font-bold">{projects.filter(p => p.status === s).length}</p>
              <p className="text-sm font-medium mt-1">{s}</p>
            </div>
          );
        })}
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(project => {
          const done = project.milestones.filter(m => m.completed).length;
          const total = project.milestones.length;
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);
          return (
            <motion.div
              key={project.id}
              onClick={() => setSelected(project)}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase size={18} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_COLORS[project.status] || 'bg-slate-100'}`}>
                  {project.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{project.name}</h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{done}/{total} milestones</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <span className="text-xs text-slate-400">{format(project.createdAt, 'MMM d, yyyy')}</span>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Briefcase size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-400 font-medium">No projects found. Create your first one!</p>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAdding(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">New Project</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
                  <input name="name" required placeholder="e.g. Website Redesign" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea name="description" rows={3} placeholder="What's this project about?" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select name="status" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm">
                    <option>Planning</option><option>Active</option><option>On Hold</option><option>Completed</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  Create Project
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
