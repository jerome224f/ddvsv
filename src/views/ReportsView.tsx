import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight, Calendar, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const PIPELINE_PERFORMANCE = [
  { name: 'New', leads: 45, value: 90000 },
  { name: 'Contacted', leads: 34, value: 75000 },
  { name: 'Qualified', leads: 28, value: 62000 },
  { name: 'Proposal', leads: 18, value: 48000 },
  { name: 'Closed Won', leads: 22, value: 110000 },
];

const MONTHLY_REVENUE_TRENDS = [
  { month: 'Jan', revenue: 45000, target: 40000 },
  { month: 'Feb', revenue: 52000, target: 42000 },
  { month: 'Mar', revenue: 61000, target: 45000 },
  { month: 'Apr', revenue: 58000, target: 48000 },
  { month: 'May', revenue: 72000, target: 50000 },
];

interface Props {
  orgId: string;
}

export default function ReportsView({ orgId }: Props) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '12m'>('30d');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CRM Analytical Reports</h1>
          <p className="text-slate-500 text-sm">Actionable pipeline insights, team metrics, and revenue attribution</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          {(['7d', '30d', '12m'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeframe === tf ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : '12 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Sourced Value</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-800">₹3,85,000</h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight size={14} /> +12.4%
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Acquisition Cost</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-800">₹4,200</h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowDownRight size={14} /> -3.5%
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Win / Conversion Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-800">24.6%</h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight size={14} /> +1.8%
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Team Goal Achievement</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-800">92.4%</h3>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
              <ArrowUpRight size={14} /> +0.5%
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal value pipeline stage chart */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-indigo-600" /> Pipeline Stage Valuation (INR)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PIPELINE_PERFORMANCE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue monthly trends chart */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600" /> Revenue vs. Quota Achievement Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_REVENUE_TRENDS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} name="Actual Revenue" />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} name="Monthly Quota" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lead Conversion Pipeline Stage Detail Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-700 text-sm">Lead Attribution Funnel Details</h3>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
              <th className="p-4">Attributed Pipeline Stage</th>
              <th className="p-4">Active Leads Count</th>
              <th className="p-4">Calculated Total Valuation</th>
              <th className="p-4">Conversion Target Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {PIPELINE_PERFORMANCE.map(stage => (
              <tr key={stage.name} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">{stage.name}</td>
                <td className="p-4 text-slate-650">{stage.leads} active reps</td>
                <td className="p-4 font-bold text-slate-700">₹{stage.value.toLocaleString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.round(stage.leads * 2.2)}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{Math.round(stage.leads * 2.2)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
