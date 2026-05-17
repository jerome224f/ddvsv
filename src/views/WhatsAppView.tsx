import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Plus, Search, User, Clock, Trash2, Globe, Layout, Check, Settings, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../supabase';
import type { Contact } from '../types';

interface WhatsAppMsg {
  id: string;
  phone: string;
  contactName: string;
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: number;
}

interface Template {
  id: string;
  name: string;
  category: string;
  text: string;
}

const DEFAULT_TEMPLATES: Template[] = [
  { id: '1', name: 'Welcome Message', category: 'General', text: 'Hello {{name}}, welcome to Vyes CRM. We look forward to assisting you!' },
  { id: '2', name: 'Proposal Follow-up', category: 'Sales', text: 'Hi {{name}}, just following up on the proposal we sent over. Do you have any questions?' },
  { id: '3', name: 'Invoice Reminder', category: 'Finance', text: 'Hi {{name}}, this is a friendly reminder that invoice {{invoice_id}} for ₹{{amount}} is due on {{due_date}}.' },
];

interface Props {
  contacts: Contact[];
  orgId: string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export default function WhatsAppView({ contacts, orgId, showSuccess, showError }: Props) {
  const [messages, setMessages] = useState<WhatsAppMsg[]>([]);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [chatSearch, setChatSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplCat, setNewTplCat] = useState('General');
  const [newTplText, setNewTplText] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'templates'>('chats');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(chatSearch.toLowerCase()) || 
    c.phone.includes(chatSearch)
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !messageText.trim()) return;

    const finalMessage = messageText.replace('{{name}}', selectedContact.name);

    // Format phone to clean string
    const cleanPhone = selectedContact.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(finalMessage)}`;

    const newMsg: WhatsAppMsg = {
      id: crypto.randomUUID(),
      phone: selectedContact.phone,
      contactName: selectedContact.name,
      direction: 'outbound',
      content: finalMessage,
      timestamp: Date.now(),
    };

    try {
      const { error } = await supabase.from('whatsapp_messages').insert([{
        id: newMsg.id,
        org_id: orgId || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b',
        contact_id: selectedContact.id,
        direction: 'outbound',
        content: finalMessage,
      }]);

      if (error) throw error;
      setMessages(prev => [newMsg, ...prev]);
      setMessageText('');
      showSuccess('WhatsApp message logged.');

      // Open new window to actually trigger WhatsApp API Web/App
      window.open(waUrl, '_blank');
    } catch (err: any) {
      showError(`Failed to log message: ${err.message}`);
    }
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName.trim() || !newTplText.trim()) return;

    const newTpl: Template = {
      id: crypto.randomUUID(),
      name: newTplName,
      category: newTplCat,
      text: newTplText,
    };
    setTemplates([newTpl, ...templates]);
    setIsAddingTemplate(false);
    setNewTplName('');
    setNewTplText('');
    showSuccess('Template created successfully.');
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    showSuccess('Template deleted.');
  };

  const selectTemplate = (tpl: Template) => {
    if (selectedContact) {
      setMessageText(tpl.text.replace('{{name}}', selectedContact.name));
      setActiveTab('chats');
    } else {
      showError('Please select a contact first.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-6 h-[85vh] md:h-[80vh] overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-80 h-[300px] md:h-full bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'chats' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'templates' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Templates
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contact or keyword..."
              value={chatSearch}
              onChange={e => setChatSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {activeTab === 'chats' ? (
            filteredContacts.map(c => {
              const active = selectedContact?.id === c.id;
              const lastMsg = messages.find(m => m.phone === c.phone);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  className={`w-full p-4 text-left flex items-center gap-3 transition-colors ${active ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-850 truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{lastMsg ? lastMsg.content : c.phone}</p>
                  </div>
                  {lastMsg && (
                    <span className="text-[9px] text-slate-400 flex-shrink-0">
                      {format(lastMsg.timestamp, 'HH:mm')}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            templates.map(tpl => (
              <div key={tpl.id} className="p-4 space-y-2 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{tpl.category}</span>
                  <button onClick={() => deleteTemplate(tpl.id)} className="p-1 hover:bg-red-50 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
                <h4 className="font-bold text-xs text-slate-800">{tpl.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{tpl.text}</p>
                <button
                  onClick={() => selectTemplate(tpl)}
                  className="w-full mt-2 py-1.5 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold transition-all"
                >
                  Use Template
                </button>
              </div>
            ))
          )}
        </div>

        {activeTab === 'templates' && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setIsAddingTemplate(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-100"
            >
              <Plus size={16} /> New Template
            </button>
          </div>
        )}
      </div>

      {/* Main Chat/Workspace Area */}
      <div className="flex-1 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[500px] md:h-full">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base">
                  {selectedContact.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-850 text-sm">{selectedContact.name}</h3>
                  <p className="text-xs text-slate-400">{selectedContact.phone} • {selectedContact.company || 'Personal'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Chat</span>
              </div>
            </div>

            {/* Chats messages view */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {messages.filter(m => m.phone === selectedContact.phone).length === 0 && (
                <div className="text-center py-20 text-slate-400">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-30 text-indigo-400" />
                  <p className="text-xs font-medium">No messaging logs for this contact yet.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Send a message below to launch WhatsApp API.</p>
                </div>
              )}

              {messages.filter(m => m.phone === selectedContact.phone).map(msg => (
                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${msg.direction === 'outbound' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                    <p>{msg.content}</p>
                    <span className={`block text-[9px] mt-1.5 text-right ${msg.direction === 'outbound' ? 'text-blue-100' : 'text-slate-400'}`}>
                      {format(msg.timestamp, 'HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex gap-3">
              <input
                required
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Type your message... use {{name}} for dynamic replacement"
                className="flex-1 px-4 py-3 bg-slate-50 border-0 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-100"
              >
                <Send size={14} /> Send via WhatsApp
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/20">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Select a Contact</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">Select a contact from the sidebar list to trigger a quick template or write a customized WhatsApp message.</p>
          </div>
        )}
      </div>

      {/* Template creation Modal */}
      <AnimatePresence>
        {isAddingTemplate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddingTemplate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-905">New Message Template</h3>
                <button onClick={() => setIsAddingTemplate(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={18} /></button>
              </div>

              <form onSubmit={handleAddTemplate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Template Name</label>
                  <input
                    required
                    value={newTplName}
                    onChange={e => setNewTplName(e.target.value)}
                    placeholder="Welcome Message, Offer, etc."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newTplCat}
                    onChange={e => setNewTplCat(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option>General</option>
                    <option>Sales</option>
                    <option>Finance</option>
                    <option>Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message Body</label>
                  <textarea
                    required
                    value={newTplText}
                    onChange={e => setNewTplText(e.target.value)}
                    rows={4}
                    placeholder="Use {{name}} to represent recipient's name."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>

                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-200">
                  Save Template
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
