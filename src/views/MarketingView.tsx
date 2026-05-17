import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Plus, BarChart3, TrendingUp, Users, ArrowUpRight, X, Mail, Globe, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { supabase } from '../supabase';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  channel: 'Email' | 'SMS' | 'WhatsApp';
  subject: string;
  recipients: number;
  status: 'Draft' | 'Sending' | 'Sent';
  sentAt: number;
}

const DEFAULT_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Summer Hot Deals Discount', channel: 'Email', subject: 'Get 30% Off on CRM Licensing!', recipients: 2500, status: 'Sent', sentAt: Date.now() - 3 * 86400000 },
  { id: '2', name: 'GST Invoice Tool Launch Notice', channel: 'WhatsApp', subject: 'Our invoicing is live!', recipients: 1200, status: 'Sent', sentAt: Date.now() - 1 * 86400000 },
  { id: '3', name: 'End of Year Premium Renewal Alert', channel: 'SMS', subject: 'Renew your plan now', recipients: 450, status: 'Draft', sentAt: Date.now() },
];

const ANALYTICS_DATA = [
  { name: 'May 10', sent: 1200, opened: 800, clicks: 350 },
  { name: 'May 11', sent: 1500, opened: 920, clicks: 410 },
  { name: 'May 12', sent: 1800, opened: 1100, clicks: 520 },
  { name: 'May 13', sent: 2200, opened: 1400, clicks: 680 },
  { name: 'May 14', sent: 2500, opened: 1650, clicks: 800 },
  { name: 'May 15', sent: 3000, opened: 2100, clicks: 990 },
];

interface Props {
  orgId: string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export default function MarketingView({ orgId, showSuccess, showError }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEFAULT_CAMPAIGNS);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'Email' | 'SMS' | 'WhatsApp'>('Email');
  const [subject, setSubject] = useState('');
  const [audienceSize, setAudienceSize] = useState(100);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCampaign: Campaign = {
      id: crypto.randomUUID(),
      name,
      channel,
      subject,
      recipients: audienceSize,
      status: 'Sent',
      sentAt: Date.now(),
    };

    try {
      const { error } = await supabase.from('marketing_campaigns').insert([{
        id: newCampaign.id,
        org_id: orgId || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b',
        name: newCampaign.name,
        channel: newCampaign.channel.toLowerCase(),
        subject: newCampaign.subject,
        recipients_count: newCampaign.recipients,
        status: 'sent',
      }]);

      if (error) throw error;
      setCampaigns(prev => [newCampaign, ...prev]);
      setIsAdding(false);
      setName('');
      setSubject('');
      showSuccess('Marketing campaign launched successfully!');
    } catch (err: any) {
      showError(`Launch failed: ${err.message}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketing</h1>
          <p className="text-slate-500 text-sm">Launch email/SMS blast campaigns, analyze conversion rates</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md">
          <Plus size={18} /> New Campaign
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Megaphone size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Campaigns</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{campaigns.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Reach</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{campaigns.reduce((acc, c) => acc + c.recipients, 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Avg Open Rate</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">67.8%</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Avg CTR</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">32.4%</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-blue-500" /> Multi-Channel Engagement</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ANALYTICS_DATA}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="sent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2.5} name="Messages Sent" />
              <Area type="monotone" dataKey="opened" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorOpened)" strokeWidth={2.5} name="Total Opens" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaigns list */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-700 text-sm">Campaign Pipeline</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {campaigns.map(camp => (
            <div key={camp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  camp.channel === 'Email' ? 'bg-blue-50 text-blue-600' : camp.channel === 'WhatsApp' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {camp.channel === 'Email' ? <Mail size={18} /> : <Megaphone size={18} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-850 text-sm">{camp.name}</h4>
                  <p className="text-xs text-slate-400">{camp.subject || 'No subject'}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Recipients</p>
                  <p className="font-semibold text-slate-700 text-xs mt-0.5">{camp.recipients.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                  <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    camp.status === 'Sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>{camp.status}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Date Launched</p>
                  <p className="text-xs text-slate-500 mt-0.5">{format(camp.sentAt, 'dd MMM yyyy')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add campaign modal */}
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
                <h3 className="text-lg font-bold text-slate-900">Create Marketing Blast</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={18} /></button>
              </div>

              <form onSubmit={handleLaunch} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Name</label>
                  <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Summer Promo Blast"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marketing Channel</label>
                  <select
                    value={channel}
                    onChange={e => setChannel(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="Email">Email Blast</option>
                    <option value="SMS">SMS Message</option>
                    <option value="WhatsApp">WhatsApp Blast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Line / Intro</label>
                  <input
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Check out our fresh discount!"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Audience Target Size</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={audienceSize}
                    onChange={e => setAudienceSize(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-xl">
                  <Sparkles size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-blue-700 leading-relaxed">This blast will automatically compile with recipient list placeholders such as name and GST number tags during delivery.</p>
                </div>

                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-200">
                  Launch Blast Campaign
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
