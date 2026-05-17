import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';
import { 
  Users, Building2, Ticket, Target, CheckSquare, Folder, 
  TrendingUp, FileSignature, LayoutTemplate, FileText, 
  Link as LinkIcon, Settings as SystemSettings, Search, ArrowRight,
  ChevronDown, ChevronRight, Shield, Globe, Bell, Key, 
  Zap, GitBranch, MapPin, Languages, Calendar, CreditCard,
  BarChart3, Clock, UserCog, Tag, Mail, MessageSquare, Smartphone,
  Receipt, Filter, RefreshCw, Database, X, Check, Plus, Trash, Copy
} from 'lucide-react';

const SETUP_MODULES = [
  {
    category: 'General',
    icon: SystemSettings,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    hoverBg: 'group-hover:bg-blue-600',
    description: 'Core company & localization settings',
    items: [
      { name: 'Company Profile', icon: Building2, id: 'company-profile', description: 'Logo, name, address, GST details' },
      { name: 'Localization', icon: Globe, id: 'localization', description: 'Date format, number format, currency' },
      { name: 'Timezone', icon: Clock, id: 'timezone', description: 'Default timezone for the org' },
      { name: 'E-Sign', icon: FileSignature, id: 'e-sign', description: 'Digital signature configuration' },
    ]
  },
  {
    category: 'Attendance',
    icon: Clock,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    hoverBg: 'group-hover:bg-violet-600',
    description: 'Staff attendance & time tracking',
    items: [
      { name: 'Punch In/Out', icon: CheckSquare, id: 'punch-in-out', description: 'Attendance tracking rules' },
      { name: 'Employee Portal', icon: UserCog, id: 'employee-portal', description: 'Self-service employee portal config' },
      { name: 'Settings', icon: SystemSettings, id: 'attendance-settings', description: 'Attendance module preferences' },
    ]
  },
  {
    category: 'Staff',
    icon: Users,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    hoverBg: 'group-hover:bg-emerald-600',
    description: 'Team members, roles & designations',
    items: [
      { name: 'List', icon: Users, id: 'staff-list', description: 'Manage all team members' },
      { name: 'Roles', icon: Shield, id: 'roles', description: 'Define permission roles' },
      { name: 'Staff License History', icon: FileText, id: 'license-history', description: 'Track software licenses per staff' },
      { name: 'Designations', icon: Tag, id: 'designations', description: 'Job titles & designations' },
      { name: 'Settings', icon: SystemSettings, id: 'staff-settings', description: 'Staff module preferences' },
    ]
  },
  {
    category: 'Customer',
    icon: Building2,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    hoverBg: 'group-hover:bg-amber-600',
    description: 'Customer groups & preferences',
    items: [
      { name: 'Groups', icon: Users, id: 'cust-groups', description: 'Customer segmentation groups' },
      { name: 'Settings', icon: SystemSettings, id: 'cust-settings', description: 'Customer module preferences' },
    ]
  },
  {
    category: 'Tickets',
    icon: Ticket,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    hoverBg: 'group-hover:bg-rose-600',
    description: 'Support ticket configuration',
    items: [
      { name: 'Departments', icon: GitBranch, id: 'ticket-depts', description: 'Support departments' },
      { name: 'Predefined Replies', icon: MessageSquare, id: 'ticket-replies', description: 'Quick reply templates' },
      { name: 'Ticket Priority', icon: Target, id: 'ticket-priority', description: 'Priority levels (Low, Medium, High)' },
      { name: 'Ticket Statuses', icon: Tag, id: 'ticket-statuses', description: 'Custom ticket status flow' },
      { name: 'Services', icon: Zap, id: 'ticket-services', description: 'Services your team provides' },
      { name: 'Spam Filters', icon: Filter, id: 'ticket-spam', description: 'Filter unwanted ticket submissions' },
      { name: 'Settings', icon: SystemSettings, id: 'ticket-settings', description: 'Ticket module preferences' },
    ]
  },
  {
    category: 'Leads',
    icon: Target,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    hoverBg: 'group-hover:bg-blue-600',
    description: 'Lead pipeline configuration',
    items: [
      { name: 'Statuses', icon: Tag, id: 'lead-statuses', description: 'Lead status pipeline stages' },
      { name: 'Sources', icon: Globe, id: 'lead-sources', description: 'Lead source tracking' },
      { name: 'Round Robin', icon: RefreshCw, id: 'lead-round-robin', description: 'Auto-assign leads dynamically' },
      { name: 'Groups', icon: Users, id: 'lead-groups', description: 'Lead categorization groups' },
      { name: 'Settings', icon: SystemSettings, id: 'lead-settings', description: 'Lead module preferences' },
    ]
  },
  {
    category: 'Tasks',
    icon: CheckSquare,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    hoverBg: 'group-hover:bg-cyan-600',
    description: 'Task management configuration',
    items: [
      { name: 'Custom Status', icon: Tag, id: 'task-status', description: 'Define custom task statuses' },
      { name: 'Settings', icon: SystemSettings, id: 'task-settings', description: 'Task module preferences' },
    ]
  },
  {
    category: 'Sales',
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-50',
    hoverBg: 'group-hover:bg-green-600',
    description: 'Sales, invoicing & finance settings',
    items: [
      { name: 'Tax Rates', icon: Receipt, id: 'tax-rates', description: 'GST / tax rate configuration' },
      { name: 'Currencies', icon: Globe, id: 'currencies', description: 'Multi-currency support' },
      { name: 'Payment Modes', icon: CreditCard, id: 'payment-modes', description: 'Bank Transfer, UPI, Cash etc.' },
      { name: 'Expenses Categories', icon: Tag, id: 'expense-cats', description: 'Categorize business expenses' },
      { name: 'Settings', icon: SystemSettings, id: 'sales-settings', description: 'Sales module preferences' },
    ]
  },
  {
    category: 'System',
    icon: Database,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    hoverBg: 'group-hover:bg-gray-700',
    description: 'Advanced system configuration',
    items: [
      { name: 'API key', icon: Key, id: 'api-keys', description: 'Generate & manage API keys' },
      { name: 'Branch', icon: GitBranch, id: 'branch-offices', description: 'Multi-branch organization setup' },
      { name: 'Security', icon: Shield, id: 'security-policies', description: 'Password, 2FA, session policies' },
    ]
  }
];

interface Props {
  orgId: string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export default function SettingsView({ orgId, showSuccess, showError }: Props) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>('General');
  const [activePrefModal, setActivePrefModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Feature-complete state representations with defensive fallbacks
  const [settings, setSettings] = useState({
    companyProfile: {
      name: 'Vyes CRM Enterprise',
      address: '404 Innovation Suite, BKC, Mumbai',
      gstin: '27AAAAA1111A1Z1',
      email: 'finance@vyes.com',
      phone: '+91 98765 43210',
      website: 'https://vyes.com'
    },
    localization: {
      currency: 'INR (₹)',
      dateFormat: 'DD-MM-YYYY',
      numberFormat: '12,34,567.89'
    },
    timezone: {
      zone: 'Asia/Kolkata',
      enableDst: false
    },
    esign: {
      terms: 'I hereby accept the electronic signing terms of Vyes CRM SaaS agreement.',
      methods: ['draw', 'type'],
      fallbackText: 'Vyes Representative Signature'
    },
    punchInOut: {
      shiftStart: '09:30',
      shiftEnd: '18:30',
      graceMins: 15,
      geofenceRadius: 150
    },
    employeePortal: {
      allowMobile: true,
      allowProfileEdit: true,
      enableLeaves: true
    },
    attendanceSettings: {
      overtimeMultiplier: 1.5,
      halfDayHours: 4
    },
    staffList: [
      { id: '1', name: 'Aravind Swamy', email: 'aravind@vyes.com', designation: 'Senior Account Manager', status: 'Active' },
      { id: '2', name: 'Neha Sharma', email: 'neha@vyes.com', designation: 'Technical Support Specialist', status: 'Active' },
      { id: '3', name: 'Vikram Mehta', email: 'vikram@vyes.com', designation: 'VP Sales', status: 'Active' }
    ],
    roles: [
      { name: 'Super Admin', permissions: { contacts: true, tickets: true, deals: true, tasks: true, invoices: true } },
      { name: 'Agent', permissions: { contacts: true, tickets: true, deals: false, tasks: true, invoices: false } },
      { name: 'Viewer', permissions: { contacts: true, tickets: false, deals: false, tasks: false, invoices: false } }
    ],
    licenseHistory: [
      { id: '1', product: 'Office 365 Pro', key: 'XXXXX-XXXXX-XXXXX-K124A', assignedTo: 'aravind@vyes.com', cost: 1200 },
      { id: '2', product: 'Zoom Enterprise', key: 'ZOOM-PRO-998822', assignedTo: 'neha@vyes.com', cost: 950 }
    ],
    designations: ['VP Sales', 'Senior Account Manager', 'Technical Support Specialist', 'Marketing Executive'],
    staffSettings: {
      maxDailyHours: 9,
      resetPeriodDays: 90,
      enableStaffNotifs: true
    },
    custGroups: [
      { name: 'VIP Platinum', discount: 15 },
      { name: 'Corporate Enterprise', discount: 10 },
      { name: 'Standard Retail', discount: 0 }
    ],
    custSettings: {
      autoWelcome: true,
      requireVerify: false
    },
    ticketDepts: ['Tech Support', 'Billing', 'Enterprise Support', 'General Inquiries'],
    ticketReplies: [
      { title: 'Greeting Reply', reply: 'Hello, thank you for reaching out to support. We have received your query.' },
      { title: 'Information Request', reply: 'Please provide your account ID and workspace URL to help us debug.' }
    ],
    ticketPriority: [
      { name: 'Urgent', slaHours: 2 },
      { name: 'High', slaHours: 8 },
      { name: 'Medium', slaHours: 24 },
      { name: 'Low', slaHours: 48 }
    ],
    ticketStatuses: ['New', 'In-Progress', 'Awaiting Customer', 'Resolved', 'Closed'],
    ticketServices: ['CRM API integration', 'Dedicated Cloud Setup', 'Custom WhatsApp Gateway'],
    ticketSpam: ['@spambot.org', 'lottery-win.com', 'crypto-rich-claims.net'],
    ticketSettings: {
      autoCloseDays: 5,
      enableRatings: true
    },
    leadStatuses: ['New Lead', 'Contacted', 'Nurturing', 'SLA Target', 'Qualified', 'Lost'],
    leadSources: ['Website Form', 'WhatsApp API', 'Google Search', 'Reference Partner', 'Cold Email'],
    leadRoundRobin: {
      active: true,
      maxDailyLeads: 25
    },
    leadGroups: ['Enterprise SaaS', 'Mid-Market Hub', 'Individual Pro'],
    leadSettings: {
      decayAlertDays: 7,
      autoMergeDuplicates: true
    },
    taskStatus: ['Todo', 'Working', 'Under Review', 'Blocked', 'Finished'],
    taskSettings: {
      sendDailyDigest: true,
      autoEscalateOverdue: true
    },
    taxRates: [
      { name: 'Standard GST 18%', rate: 18 },
      { name: 'Reduced GST 12%', rate: 12 },
      { name: 'Exempt Tax 0%', rate: 0 }
    ],
    currencies: [
      { code: 'INR', symbol: '₹', rate: 1.0 },
      { code: 'USD', symbol: '$', rate: 83.4 },
      { code: 'EUR', symbol: '€', rate: 90.1 }
    ],
    paymentModes: ['UPI (Google Pay/PhonePe)', 'Bank Wire Transfer', 'Credit/Debit Card', 'Razorpay Checkout', 'Cash on Account'],
    expenseCats: ['Cloud Servers', 'Marketing Ads', 'Office Rent', 'Salaries', 'Travel & Meals'],
    salesSettings: {
      invoicePrefix: 'INV-2026-',
      invoiceStartNum: 1001,
      lateFeePercent: 1.5
    },
    apiKeys: [
      { id: '1', name: 'Zapier Production Hook', key: 'sk_live_vyes_5502aa89b9c9f7', created: '2026-05-10' },
      { id: '2', name: 'Mobile App Gateway', key: 'sk_live_vyes_1122cd33dd4455', created: '2026-05-15' }
    ],
    branchOffices: [
      { name: 'Mumbai BKC HQ', city: 'Mumbai', address: '404 Innovation Suite, BKC, Mumbai' },
      { name: 'Delhi Tech Center', city: 'Delhi', address: 'Plot 12, Sector 5, Gurugram' }
    ],
    securityPolicies: {
      minPasswordLen: 8,
      force2fa: true,
      sessionTimeoutMins: 30
    }
  });

  // Pull settings state from backend database table
  useEffect(() => {
    if (!orgId) return;
    async function loadAllSettings() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .eq('org_id', orgId);

        if (error) throw error;

        if (data && data.length > 0) {
          const loaded: any = { ...settings };
          data.forEach(row => {
            if (loaded[row.item_key] !== undefined) {
              loaded[row.item_key] = row.settings_value;
            }
          });
          setSettings(loaded);
        }
      } catch (err: any) {
        console.error('Error fetching settings:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAllSettings();
  }, [orgId]);

  // General state helper updates
  const updateSettingState = (key: keyof typeof settings, val: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSavePref = async (e: React.FormEvent, key: string, val: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Derive category dynamically based on SETUP_MODULES
      const moduleMeta = SETUP_MODULES.find(cat => cat.items.some(i => i.id === key));
      const category = moduleMeta ? moduleMeta.category : 'General';

      const { error } = await supabase
        .from('system_settings')
        .upsert({
          org_id: orgId,
          category,
          item_key: key,
          settings_value: val,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'org_id,category,item_key'
        });

      if (error) throw error;

      showSuccess(`Preference settings for '${key}' synced successfully.`);
      setActivePrefModal(null);
    } catch (err: any) {
      showError(`Error persisting parameter configuration: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return SETUP_MODULES;
    const q = search.toLowerCase();
    return SETUP_MODULES
      .map(m => ({
        ...m,
        items: m.items.filter(i =>
          i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
        )
      }))
      .filter(m => m.items.length > 0 || m.category.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            CRM Setup
            {loading && <RefreshCw size={16} className="animate-spin text-blue-600" />}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Configure parameters, designations, SLA response flows, tax metrics, and core multi-tenant options.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search all 36 setup nodes..."
            className="w-full sm:w-80 pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filtered.map((module) => {
          const isOpen = expanded === module.category;
          return (
            <div key={module.category}
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden group transition-all duration-300 hover:shadow-md shadow-sm">
              {/* Card Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : module.category)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${module.bg} ${module.color} flex items-center justify-center transition-all duration-300 ${module.hoverBg} group-hover:text-white flex-shrink-0`}>
                    <module.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight text-base">{module.category}</h3>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{module.items.length} Items Configured</span>
                  </div>
                </div>
                {isOpen
                  ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                }
              </button>

              {/* Description */}
              <div className="px-6 pb-3">
                <p className="text-xs text-slate-400">{module.description}</p>
              </div>

              {/* Items List */}
              <div className={`px-6 pb-6 space-y-1 transition-all duration-300 ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                {module.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActivePrefModal(item.id)}
                    className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 text-left group/item transition-colors border border-transparent hover:border-slate-150"
                  >
                    <item.icon className="w-4 h-4 text-slate-400 group-hover/item:text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-700 group-hover/item:text-blue-600 font-semibold">{item.name}</span>
                      <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Settings Action Modals */}
      <AnimatePresence>
        {activePrefModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setActivePrefModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase text-blue-600 text-xs">Module Setup Node</h3>
                  <h2 className="text-xl font-bold text-slate-800">
                    {SETUP_MODULES.flatMap(m => m.items).find(i => i.id === activePrefModal)?.name || 'Configuration Setting'}
                  </h2>
                </div>
                <button onClick={() => setActivePrefModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={18} /></button>
              </div>

              {/* -------------------- GENERAL -------------------- */}
              {activePrefModal === 'company-profile' && (
                <form onSubmit={e => handleSavePref(e, 'companyProfile', settings.companyProfile)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company Trade Name</label>
                      <input value={settings.companyProfile.name} onChange={e => updateSettingState('companyProfile', { ...settings.companyProfile, name: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN (India)</label>
                      <input value={settings.companyProfile.gstin} onChange={e => updateSettingState('companyProfile', { ...settings.companyProfile, gstin: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Finance Email</label>
                      <input type="email" value={settings.companyProfile.email} onChange={e => updateSettingState('companyProfile', { ...settings.companyProfile, email: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Support Hotline</label>
                      <input value={settings.companyProfile.phone} onChange={e => updateSettingState('companyProfile', { ...settings.companyProfile, phone: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Website</label>
                    <input type="url" value={settings.companyProfile.website} onChange={e => updateSettingState('companyProfile', { ...settings.companyProfile, website: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Headquarters Address</label>
                    <textarea value={settings.companyProfile.address} onChange={e => updateSettingState('companyProfile', { ...settings.companyProfile, address: e.target.value })} required rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-200">Save Company Profile</button>
                </form>
              )}

              {activePrefModal === 'localization' && (
                <form onSubmit={e => handleSavePref(e, 'localization', settings.localization)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Base Billing Currency</label>
                    <select value={settings.localization.currency} onChange={e => updateSettingState('localization', { ...settings.localization, currency: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400">
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">System-wide Date Format</label>
                    <select value={settings.localization.dateFormat} onChange={e => updateSettingState('localization', { ...settings.localization, dateFormat: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400">
                      <option>DD-MM-YYYY</option>
                      <option>MM-DD-YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Number Style</label>
                    <select value={settings.localization.numberFormat} onChange={e => updateSettingState('localization', { ...settings.localization, numberFormat: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400">
                      <option>12,34,567.89 (Indian Lacs/Crores)</option>
                      <option>1,234,567.89 (US Millions)</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-200">Save Localization Preferences</button>
                </form>
              )}

              {activePrefModal === 'timezone' && (
                <form onSubmit={e => handleSavePref(e, 'timezone', settings.timezone)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">System Default Timezone</label>
                    <select value={settings.timezone.zone} onChange={e => updateSettingState('timezone', { ...settings.timezone, zone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400">
                      <option>Asia/Kolkata (GMT+05:30)</option>
                      <option>UTC (GMT+00:00)</option>
                      <option>America/New_York (GMT-05:00)</option>
                      <option>Europe/London (GMT+01:00)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <input type="checkbox" checked={settings.timezone.enableDst} onChange={e => updateSettingState('timezone', { ...settings.timezone, enableDst: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-xs text-slate-600">Auto-adjust Daylight Saving Time (DST) changes</span>
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all">Save Timezone Configuration</button>
                </form>
              )}

              {activePrefModal === 'e-sign' && (
                <form onSubmit={e => handleSavePref(e, 'esign', settings.esign)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Electronic Signing Terms & Agreement Text</label>
                    <textarea value={settings.esign.terms} onChange={e => updateSettingState('esign', { ...settings.esign, terms: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Allowed E-Signing Input Methods</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {['draw', 'type', 'upload'].map(m => (
                        <label key={m} className="flex items-center gap-2 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                          <input type="checkbox" checked={settings.esign.methods.includes(m)} onChange={e => {
                            const newMethods = e.target.checked 
                              ? [...settings.esign.methods, m]
                              : settings.esign.methods.filter(x => x !== m);
                            updateSettingState('esign', { ...settings.esign, methods: newMethods });
                          }} className="w-4 h-4 text-blue-600" />
                          <span className="text-xs capitalize font-bold">{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Default Fallback Placeholder text</label>
                    <input value={settings.esign.fallbackText} onChange={e => updateSettingState('esign', { ...settings.esign, fallbackText: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all">Save E-Sign Rules</button>
                </form>
              )}

              {/* -------------------- ATTENDANCE -------------------- */}
              {activePrefModal === 'punch-in-out' && (
                <form onSubmit={e => handleSavePref(e, 'punchInOut', settings.punchInOut)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Start Time</label>
                      <input type="time" value={settings.punchInOut.shiftStart} onChange={e => updateSettingState('punchInOut', { ...settings.punchInOut, shiftStart: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Shift End Time</label>
                      <input type="time" value={settings.punchInOut.shiftEnd} onChange={e => updateSettingState('punchInOut', { ...settings.punchInOut, shiftEnd: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Late Grace Window (mins)</label>
                      <input type="number" value={settings.punchInOut.graceMins} onChange={e => updateSettingState('punchInOut', { ...settings.punchInOut, graceMins: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Geofencing Radius Target (meters)</label>
                      <input type="number" value={settings.punchInOut.geofenceRadius} onChange={e => updateSettingState('punchInOut', { ...settings.punchInOut, geofenceRadius: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-violet-200">Save Attendance Shift Rules</button>
                </form>
              )}

              {activePrefModal === 'employee-portal' && (
                <form onSubmit={e => handleSavePref(e, 'employeePortal', settings.employeePortal)} className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-2xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Allow GPS Mobile Punch In</span>
                      <span className="text-[10px] text-slate-400">Staff can mark attendance via iOS/Android app coordinates</span>
                    </div>
                    <input type="checkbox" checked={settings.employeePortal.allowMobile} onChange={e => updateSettingState('employeePortal', { ...settings.employeePortal, allowMobile: e.target.checked })} className="w-4 h-4 text-violet-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-2xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Employee Profile Self-Editing</span>
                      <span className="text-[10px] text-slate-400">Staff members can update personal profile info</span>
                    </div>
                    <input type="checkbox" checked={settings.employeePortal.allowProfileEdit} onChange={e => updateSettingState('employeePortal', { ...settings.employeePortal, allowProfileEdit: e.target.checked })} className="w-4 h-4 text-violet-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-2xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Leave & Absence Requests</span>
                      <span className="text-[10px] text-slate-400">Enable digital leave request application workflow</span>
                    </div>
                    <input type="checkbox" checked={settings.employeePortal.enableLeaves} onChange={e => updateSettingState('employeePortal', { ...settings.employeePortal, enableLeaves: e.target.checked })} className="w-4 h-4 text-violet-600 rounded" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-all">Save Portal Preferences</button>
                </form>
              )}

              {activePrefModal === 'attendance-settings' && (
                <form onSubmit={e => handleSavePref(e, 'attendanceSettings', settings.attendanceSettings)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Overtime Hour Rate multiplier</label>
                    <input type="number" step="0.1" value={settings.attendanceSettings.overtimeMultiplier} onChange={e => updateSettingState('attendanceSettings', { ...settings.attendanceSettings, overtimeMultiplier: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Half-Day Hours Threshold</label>
                    <input type="number" value={settings.attendanceSettings.halfDayHours} onChange={e => updateSettingState('attendanceSettings', { ...settings.attendanceSettings, halfDayHours: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-all">Save Overtime Settings</button>
                </form>
              )}

              {/* -------------------- STAFF -------------------- */}
              {activePrefModal === 'staff-list' && (
                <div className="space-y-6">
                  <div className="space-y-2 max-h-[300px] overflow-y-auto border border-slate-100 rounded-2xl p-4">
                    {settings.staffList.map(st => (
                      <div key={st.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{st.name}</p>
                          <p className="text-[10px] text-slate-400">{st.email} • <span className="font-semibold text-slate-500">{st.designation}</span></p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${st.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {st.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add dynamic team member form */}
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const name = form.staffName.value;
                    const email = form.staffEmail.value;
                    const designation = form.staffDesig.value;
                    const newList = [...settings.staffList, { id: Date.now().toString(), name, email, designation, status: 'Active' as const }];
                    updateSettingState('staffList', newList);
                    handleSavePref(e, 'staff-list', newList);
                    form.reset();
                  }} className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-700 uppercase">Onboard New Team Member</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input name="staffName" required placeholder="Full Name" className="w-full px-3 py-2 rounded-lg border text-xs outline-none" />
                      <input name="staffEmail" type="email" required placeholder="corporate@vyes.com" className="w-full px-3 py-2 rounded-lg border text-xs outline-none" />
                    </div>
                    <div>
                      <select name="staffDesig" className="w-full px-3 py-2 rounded-lg border text-xs outline-none bg-white">
                        {settings.designations.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700">Add & Provision Member</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'roles' && (
                <form onSubmit={e => handleSavePref(e, 'roles', settings.roles)} className="space-y-4">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {settings.roles.map((r, i) => (
                      <div key={r.name} className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                        <div className="flex items-center justify-between border-b pb-1.5 border-slate-200">
                          <span className="text-xs font-bold text-slate-800">{r.name}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {Object.keys(r.permissions).map((pKey) => {
                            const pk = pKey as keyof typeof r.permissions;
                            return (
                              <label key={pk} className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-slate-150 cursor-pointer hover:bg-blue-50/20">
                                <input type="checkbox" checked={r.permissions[pk]} onChange={e => {
                                  const newRoles = [...settings.roles];
                                  newRoles[i].permissions[pk] = e.target.checked;
                                  updateSettingState('roles', newRoles);
                                }} className="w-3.5 h-3.5 text-emerald-600 rounded" />
                                <span className="text-[9px] font-bold text-slate-500 capitalize mt-1">{pk}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all">Save Permission Matrix</button>
                </form>
              )}

              {activePrefModal === 'license-history' && (
                <div className="space-y-4">
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {settings.licenseHistory.map(lic => (
                      <div key={lic.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{lic.product}</p>
                          <code className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono block mt-1">{lic.key}</code>
                          <p className="text-[10px] text-slate-400 mt-1">Allocated to: <span className="font-semibold text-slate-500">{lic.assignedTo}</span></p>
                        </div>
                        <span className="text-xs font-extrabold text-slate-700">₹{lic.cost}/mo</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const newLic = {
                      id: Date.now().toString(),
                      product: form.prod.value,
                      key: form.key.value,
                      assignedTo: form.assign.value,
                      cost: Number(form.cost.value)
                    };
                    const updated = [...settings.licenseHistory, newLic];
                    updateSettingState('licenseHistory', updated);
                    handleSavePref(e, 'license-history', updated);
                    form.reset();
                  }} className="bg-slate-50 border p-4 rounded-2xl grid grid-cols-2 gap-3">
                    <input name="prod" required placeholder="Software Suite Name" className="px-3 py-2 border rounded-lg text-xs" />
                    <input name="key" required placeholder="Registration Serial Key" className="px-3 py-2 border rounded-lg text-xs" />
                    <input name="assign" type="email" required placeholder="Assignee Corporate Email" className="px-3 py-2 border rounded-lg text-xs" />
                    <input name="cost" type="number" required placeholder="Cost (INR/mo)" className="px-3 py-2 border rounded-lg text-xs" />
                    <button type="submit" className="col-span-2 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700">Register Active License</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'designations' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    {settings.designations.map(d => (
                      <span key={d} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        {d}
                        <Trash size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={e => {
                          const updated = settings.designations.filter(x => x !== d);
                          updateSettingState('designations', updated);
                          handleSavePref(e as any, 'designations', updated);
                        }} />
                      </span>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const val = form.newDesig.value.trim();
                    if (!val) return;
                    const updated = [...settings.designations, val];
                    updateSettingState('designations', updated);
                    handleSavePref(e, 'designations', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="newDesig" required placeholder="Add new job designation title..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs">Add Designation</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'staff-settings' && (
                <form onSubmit={e => handleSavePref(e, 'staffSettings', settings.staffSettings)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Daily System Hours Limit</label>
                    <input type="number" value={settings.staffSettings.maxDailyHours} onChange={e => updateSettingState('staffSettings', { ...settings.staffSettings, maxDailyHours: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mandatory Password Expiry (days)</label>
                    <input type="number" value={settings.staffSettings.resetPeriodDays} onChange={e => updateSettingState('staffSettings', { ...settings.staffSettings, resetPeriodDays: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.staffSettings.enableStaffNotifs} onChange={e => updateSettingState('staffSettings', { ...settings.staffSettings, enableStaffNotifs: e.target.checked })} className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-xs text-slate-600">Send automatic clock-out trigger emails if overtime exceeded</span>
                  </div>
                  <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all">Save Staff preferences</button>
                </form>
              )}

              {/* -------------------- CUSTOMER -------------------- */}
              {activePrefModal === 'cust-groups' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {settings.custGroups.map(cg => (
                      <div key={cg.name} className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
                        <span className="text-xs font-bold text-slate-700">{cg.name}</span>
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-black">{cg.discount}% Special Discount</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.custGroups, { name: form.grp.value, discount: Number(form.disc.value) }];
                    updateSettingState('custGroups', updated);
                    handleSavePref(e, 'cust-groups', updated);
                    form.reset();
                  }} className="bg-slate-50 border p-4 rounded-2xl grid grid-cols-2 gap-3">
                    <input name="grp" required placeholder="Segment/Group Name" className="px-3 py-2 border rounded-lg text-xs" />
                    <input name="disc" type="number" required placeholder="Flat Discount (%)" className="px-3 py-2 border rounded-lg text-xs" />
                    <button type="submit" className="col-span-2 py-2 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700">Add Customer Tier</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'cust-settings' && (
                <form onSubmit={e => handleSavePref(e, 'custSettings', settings.custSettings)} className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Automatic Welcome Campaign</span>
                      <span className="text-[10px] text-slate-400">Trigger standard email welcome templates on new contact creation</span>
                    </div>
                    <input type="checkbox" checked={settings.custSettings.autoWelcome} onChange={e => updateSettingState('custSettings', { ...settings.custSettings, autoWelcome: e.target.checked })} className="w-4 h-4 text-amber-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Mandatory Contact Validation</span>
                      <span className="text-[10px] text-slate-400">Requires verifying email addresses before sending campaigns</span>
                    </div>
                    <input type="checkbox" checked={settings.custSettings.requireVerify} onChange={e => updateSettingState('custSettings', { ...settings.custSettings, requireVerify: e.target.checked })} className="w-4 h-4 text-amber-600 rounded" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all">Save Customer Preferences</button>
                </form>
              )}

              {/* -------------------- TICKETS -------------------- */}
              {activePrefModal === 'ticket-depts' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl">
                    {settings.ticketDepts.map(d => (
                      <span key={d} className="px-3 py-1.5 bg-white border text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        {d}
                        <Trash size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={e => {
                          const updated = settings.ticketDepts.filter(x => x !== d);
                          updateSettingState('ticketDepts', updated);
                          handleSavePref(e as any, 'ticket-depts', updated);
                        }} />
                      </span>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.ticketDepts, form.newDept.value.trim()];
                    updateSettingState('ticketDepts', updated);
                    handleSavePref(e, 'ticket-depts', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="newDept" required placeholder="Add department (e.g. Sales Support)..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs">Add Department</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'ticket-replies' && (
                <div className="space-y-4">
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {settings.ticketReplies.map(rep => (
                      <div key={rep.title} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="text-xs font-bold text-slate-800 block">{rep.title}</span>
                        <p className="text-[10px] text-slate-400 italic">"{rep.reply}"</p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.ticketReplies, { title: form.title.value, reply: form.body.value }];
                    updateSettingState('ticketReplies', updated);
                    handleSavePref(e, 'ticket-replies', updated);
                    form.reset();
                  }} className="bg-slate-50 p-4 border rounded-2xl space-y-3">
                    <input name="title" required placeholder="Template Title" className="w-full px-3 py-2 border rounded-lg text-xs" />
                    <textarea name="body" required placeholder="Predefined Answer Body..." rows={2} className="w-full px-3 py-2 border rounded-lg text-xs resize-none" />
                    <button type="submit" className="w-full py-2 bg-rose-600 text-white font-bold rounded-lg text-xs hover:bg-rose-750">Add Response Template</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'ticket-priority' && (
                <form onSubmit={e => handleSavePref(e, 'ticketPriority', settings.ticketPriority)} className="space-y-4">
                  <div className="space-y-3">
                    {settings.ticketPriority.map((pri, idx) => (
                      <div key={pri.name} className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
                        <span className="text-xs font-bold text-slate-800">{pri.name} Priority</span>
                        <div className="flex items-center gap-2">
                          <input type="number" value={pri.slaHours} onChange={e => {
                            const updated = [...settings.ticketPriority];
                            updated[idx].slaHours = Number(e.target.value);
                            updateSettingState('ticketPriority', updated);
                          }} className="w-20 px-2 py-1 text-xs border rounded text-center" />
                          <span className="text-xs text-slate-500 font-bold">Hours SLA SLA SLA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-750 text-white font-bold rounded-xl text-xs transition-all">Save Response Thresholds</button>
                </form>
              )}

              {activePrefModal === 'ticket-statuses' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    {settings.ticketStatuses.map(d => (
                      <span key={d} className="px-3 py-1.5 bg-white border text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        {d}
                        <Trash size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={e => {
                          const updated = settings.ticketStatuses.filter(x => x !== d);
                          updateSettingState('ticketStatuses', updated);
                          handleSavePref(e as any, 'ticket-statuses', updated);
                        }} />
                      </span>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.ticketStatuses, form.newStatus.value.trim()];
                    updateSettingState('ticketStatuses', updated);
                    handleSavePref(e, 'ticket-statuses', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="newStatus" required placeholder="Add Custom Ticket Status Stage..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs">Add Status</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'ticket-services' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    {settings.ticketServices.map(d => (
                      <span key={d} className="px-3 py-1.5 bg-white border text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        {d}
                        <Trash size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={e => {
                          const updated = settings.ticketServices.filter(x => x !== d);
                          updateSettingState('ticketServices', updated);
                          handleSavePref(e as any, 'ticket-services', updated);
                        }} />
                      </span>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.ticketServices, form.newServ.value.trim()];
                    updateSettingState('ticketServices', updated);
                    handleSavePref(e, 'ticket-services', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="newServ" required placeholder="Add Service catalog entry (e.g. Hosting Cloud)..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs">Add Service</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'ticket-spam' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    {settings.ticketSpam.map(d => (
                      <span key={d} className="px-3 py-1.5 bg-white border text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        {d}
                        <Trash size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={e => {
                          const updated = settings.ticketSpam.filter(x => x !== d);
                          updateSettingState('ticketSpam', updated);
                          handleSavePref(e as any, 'ticket-spam', updated);
                        }} />
                      </span>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.ticketSpam, form.newSpam.value.trim()];
                    updateSettingState('ticketSpam', updated);
                    handleSavePref(e, 'ticket-spam', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="newSpam" required placeholder="Blacklist domain or word (e.g. spam-deals.club)..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs">Spam Block</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'ticket-settings' && (
                <form onSubmit={e => handleSavePref(e, 'ticketSettings', settings.ticketSettings)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Auto-Close Tickets Inactivity period (Days)</label>
                    <input type="number" value={settings.ticketSettings.autoCloseDays} onChange={e => updateSettingState('ticketSettings', { ...settings.ticketSettings, autoCloseDays: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-450" />
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <input type="checkbox" checked={settings.ticketSettings.enableRatings} onChange={e => updateSettingState('ticketSettings', { ...settings.ticketSettings, enableRatings: e.target.checked })} className="w-4 h-4 text-rose-650 rounded" />
                    <span className="text-xs text-slate-600">Send satisfaction survey email once status is resolved</span>
                  </div>
                  <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-750 text-white font-bold rounded-xl text-xs transition-all">Save Ticket Preferences</button>
                </form>
              )}

              {/* -------------------- LEADS -------------------- */}
              {activePrefModal === 'lead-statuses' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    {settings.leadStatuses.map(d => (
                      <span key={d} className="px-3 py-1.5 bg-white border text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        {d}
                        <Trash size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={e => {
                          const updated = settings.leadStatuses.filter(x => x !== d);
                          updateSettingState('leadStatuses', updated);
                          handleSavePref(e as any, 'lead-statuses', updated);
                        }} />
                      </span>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.leadStatuses, form.newStat.value.trim()];
                    updateSettingState('leadStatuses', updated);
                    handleSavePref(e, 'lead-statuses', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="newStat" required placeholder="Add Pipeline Stage (e.g., SLA Triggered)..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">Add Stage</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'lead-sources' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    {settings.leadSources.map(d => (
                      <span key={d} className="px-3 py-1.5 bg-white border text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        {d}
                        <Trash size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={e => {
                          const updated = settings.leadSources.filter(x => x !== d);
                          updateSettingState('leadSources', updated);
                          handleSavePref(e as any, 'lead-sources', updated);
                        }} />
                      </span>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.leadSources, form.newSource.value.trim()];
                    updateSettingState('leadSources', updated);
                    handleSavePref(e, 'lead-sources', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="newSource" required placeholder="Add marketing lead source..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">Add Source</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'lead-round-robin' && (
                <form onSubmit={e => handleSavePref(e, 'leadRoundRobin', settings.leadRoundRobin)} className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-2xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Auto Lead Assignment Routing</span>
                      <span className="text-[10px] text-slate-400">Trigger automated Round Robin lead routing criteria</span>
                    </div>
                    <input type="checkbox" checked={settings.leadRoundRobin.active} onChange={e => updateSettingState('leadRoundRobin', { ...settings.leadRoundRobin, active: e.target.checked })} className="w-4 h-4 text-blue-650 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max daily lead assignment cap per agent</label>
                    <input type="number" value={settings.leadRoundRobin.maxDailyLeads} onChange={e => updateSettingState('leadRoundRobin', { ...settings.leadRoundRobin, maxDailyLeads: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all">Save Round Robin Assignment</button>
                </form>
              )}

              {activePrefModal === 'lead-groups' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    {settings.leadGroups.map(d => (
                      <span key={d} className="px-3 py-1.5 bg-white border text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        {d}
                        <Trash size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={e => {
                          const updated = settings.leadGroups.filter(x => x !== d);
                          updateSettingState('leadGroups', updated);
                          handleSavePref(e as any, 'lead-groups', updated);
                        }} />
                      </span>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.leadGroups, form.newGrp.value.trim()];
                    updateSettingState('leadGroups', updated);
                    handleSavePref(e, 'lead-groups', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="newGrp" required placeholder="Add Lead segmentation category..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">Add Segment</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'lead-settings' && (
                <form onSubmit={e => handleSavePref(e, 'leadSettings', settings.leadSettings)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Decay Alert Trigger (Days with No Contact)</label>
                    <input type="number" value={settings.leadSettings.decayAlertDays} onChange={e => updateSettingState('leadSettings', { ...settings.leadSettings, decayAlertDays: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.leadSettings.autoMergeDuplicates} onChange={e => updateSettingState('leadSettings', { ...settings.leadSettings, autoMergeDuplicates: e.target.checked })} className="w-4 h-4 text-blue-650 rounded" />
                    <span className="text-xs text-slate-600">Auto-merge duplicate leads found with identical email and phone</span>
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all">Save Lead Parameters</button>
                </form>
              )}

              {/* -------------------- TASKS -------------------- */}
              {activePrefModal === 'task-status' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    {settings.taskStatus.map(d => (
                      <span key={d} className="px-3 py-1.5 bg-white border text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        {d}
                        <Trash size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={e => {
                          const updated = settings.taskStatus.filter(x => x !== d);
                          updateSettingState('taskStatus', updated);
                          handleSavePref(e as any, 'task-status', updated);
                        }} />
                      </span>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.taskStatus, form.newStatus.value.trim()];
                    updateSettingState('taskStatus', updated);
                    handleSavePref(e, 'task-status', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="newStatus" required placeholder="Add Custom Task Kanban Board Stage..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs">Add Board Stage</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'task-settings' && (
                <form onSubmit={e => handleSavePref(e, 'taskSettings', settings.taskSettings)} className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-2xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Send Daily Task Digest Email</span>
                      <span className="text-[10px] text-slate-400">Email staff automatically every morning with outstanding task items</span>
                    </div>
                    <input type="checkbox" checked={settings.taskSettings.sendDailyDigest} onChange={e => updateSettingState('taskSettings', { ...settings.taskSettings, sendDailyDigest: e.target.checked })} className="w-4 h-4 text-cyan-650 rounded" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-2xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Automatic Overdue Task Escalation</span>
                      <span className="text-[10px] text-slate-400">Escalate overdue items automatically to reporting team leads</span>
                    </div>
                    <input type="checkbox" checked={settings.taskSettings.autoEscalateOverdue} onChange={e => updateSettingState('taskSettings', { ...settings.taskSettings, autoEscalateOverdue: e.target.checked })} className="w-4 h-4 text-cyan-650 rounded" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-cyan-600 hover:bg-cyan-750 text-white font-bold rounded-xl text-xs transition-all">Save Task settings</button>
                </form>
              )}

              {/* -------------------- SALES -------------------- */}
              {activePrefModal === 'tax-rates' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {settings.taxRates.map(tr => (
                      <div key={tr.name} className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
                        <span className="text-xs font-bold text-slate-700">{tr.name}</span>
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-black">{tr.rate}% Rate</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.taxRates, { name: form.taxName.value, rate: Number(form.taxPct.value) }];
                    updateSettingState('taxRates', updated);
                    handleSavePref(e, 'tax-rates', updated);
                    form.reset();
                  }} className="bg-slate-50 p-4 border rounded-2xl grid grid-cols-2 gap-3">
                    <input name="taxName" required placeholder="Tax Rule Label (e.g. Standard IGST)" className="px-3 py-2 border rounded-lg text-xs" />
                    <input name="taxPct" type="number" required placeholder="Tax Percentage (%)" className="px-3 py-2 border rounded-lg text-xs" />
                    <button type="submit" className="col-span-2 py-2 bg-green-650 text-white font-bold rounded-lg text-xs hover:bg-green-700">Add Tax Rate Bracket</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'currencies' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {settings.currencies.map(cur => (
                      <div key={cur.code} className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
                        <span className="text-xs font-bold text-slate-700">{cur.code} ({cur.symbol})</span>
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-black">Exchange Multiplier: {cur.rate}</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.currencies, { code: form.ccode.value.toUpperCase(), symbol: form.csym.value, rate: Number(form.crate.value) }];
                    updateSettingState('currencies', updated);
                    handleSavePref(e, 'currencies', updated);
                    form.reset();
                  }} className="bg-slate-50 p-4 border rounded-2xl grid grid-cols-3 gap-3">
                    <input name="ccode" required placeholder="USD/INR Code" className="px-3 py-2 border rounded-lg text-xs" />
                    <input name="csym" required placeholder="$ or ₹" className="px-3 py-2 border rounded-lg text-xs" />
                    <input name="crate" type="number" step="0.001" required placeholder="Exchange Rate" className="px-3 py-2 border rounded-lg text-xs" />
                    <button type="submit" className="col-span-3 py-2 bg-green-650 text-white font-bold rounded-lg text-xs hover:bg-green-700">Add Supported Currency</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'payment-modes' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    {settings.paymentModes.map(d => (
                      <span key={d} className="px-3 py-1.5 bg-white border text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        {d}
                        <Trash size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={e => {
                          const updated = settings.paymentModes.filter(x => x !== d);
                          updateSettingState('paymentModes', updated);
                          handleSavePref(e as any, 'payment-modes', updated);
                        }} />
                      </span>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.paymentModes, form.newMode.value.trim()];
                    updateSettingState('paymentModes', updated);
                    handleSavePref(e, 'payment-modes', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="newMode" required placeholder="Add Gateway/Payment Channel (e.g. Stripe Checkout)..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs">Enable Gateway</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'expense-cats' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    {settings.expenseCats.map(d => (
                      <span key={d} className="px-3 py-1.5 bg-white border text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        {d}
                        <Trash size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={e => {
                          const updated = settings.expenseCats.filter(x => x !== d);
                          updateSettingState('expenseCats', updated);
                          handleSavePref(e as any, 'expense-cats', updated);
                        }} />
                      </span>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.expenseCats, form.newCat.value.trim()];
                    updateSettingState('expenseCats', updated);
                    handleSavePref(e, 'expense-cats', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="newCat" required placeholder="Add cost categorization center (e.g. Sales Commission)..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs">Add Category</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'sales-settings' && (
                <form onSubmit={e => handleSavePref(e, 'salesSettings', settings.salesSettings)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Standard Prefix Code</label>
                      <input value={settings.salesSettings.invoicePrefix} onChange={e => updateSettingState('salesSettings', { ...settings.salesSettings, invoicePrefix: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Starting Serial Index</label>
                      <input type="number" value={settings.salesSettings.invoiceStartNum} onChange={e => updateSettingState('salesSettings', { ...settings.salesSettings, invoiceStartNum: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Late Payment Charge rate multiplier (% monthly)</label>
                    <input type="number" step="0.1" value={settings.salesSettings.lateFeePercent} onChange={e => updateSettingState('salesSettings', { ...settings.salesSettings, lateFeePercent: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-green-200">Save Sales Configurations</button>
                </form>
              )}

              {/* -------------------- SYSTEM -------------------- */}
              {activePrefModal === 'api-keys' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {settings.apiKeys.map(k => (
                      <div key={k.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{k.name}</span>
                          <span className="text-[10px] text-slate-400">Created: {k.created}</span>
                          <code className="text-[10px] text-slate-600 font-mono bg-white px-2 py-1 rounded block mt-1.5">{k.key}</code>
                        </div>
                        <button onClick={() => {
                          navigator.clipboard.writeText(k.key);
                          showSuccess('Token copied to dashboard clipboard!');
                        }} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><Copy size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const name = form.keyName.value;
                    const randomKey = 'sk_live_vyes_' + Math.random().toString(16).substring(2, 16);
                    const updated = [...settings.apiKeys, { id: Date.now().toString(), name, key: randomKey, created: new Date().toISOString().split('T')[0] }];
                    updateSettingState('apiKeys', updated);
                    handleSavePref(e, 'api-keys', updated);
                    form.reset();
                  }} className="flex gap-2">
                    <input name="keyName" required placeholder="Key Reference Target (e.g. LeadWebhook API)..." className="flex-1 px-4 py-3 border rounded-xl text-xs" />
                    <button type="submit" className="px-5 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-xl text-xs">Generate API Token</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'branch-offices' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {settings.branchOffices.map(br => (
                      <div key={br.name} className="p-3 bg-slate-50 border rounded-xl">
                        <span className="text-xs font-bold text-slate-800 block">{br.name} ({br.city})</span>
                        <p className="text-[10px] text-slate-450 mt-0.5">{br.address}</p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    const updated = [...settings.branchOffices, { name: form.bname.value, city: form.bcity.value, address: form.baddr.value }];
                    updateSettingState('branchOffices', updated);
                    handleSavePref(e, 'branch-offices', updated);
                    form.reset();
                  }} className="bg-slate-50 p-4 border rounded-2xl grid grid-cols-2 gap-3">
                    <input name="bname" required placeholder="Branch Name (e.g. South India Hub)" className="px-3 py-2 border rounded-lg text-xs" />
                    <input name="bcity" required placeholder="City Location" className="px-3 py-2 border rounded-lg text-xs" />
                    <input name="baddr" required placeholder="Branch Full Postal Address" className="col-span-2 px-3 py-2 border rounded-lg text-xs" />
                    <button type="submit" className="col-span-2 py-2 bg-gray-700 text-white font-bold rounded-lg text-xs hover:bg-gray-800">Register New Office Branch</button>
                  </form>
                </div>
              )}

              {activePrefModal === 'security-policies' && (
                <form onSubmit={e => handleSavePref(e, 'securityPolicies', settings.securityPolicies)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Password Length Constraint</label>
                    <input type="number" min="6" max="24" value={settings.securityPolicies.minPasswordLen} onChange={e => updateSettingState('securityPolicies', { ...settings.securityPolicies, minPasswordLen: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Session Inactivity Timeout (minutes)</label>
                    <input type="number" min="5" max="1440" value={settings.securityPolicies.sessionTimeoutMins} onChange={e => updateSettingState('securityPolicies', { ...settings.securityPolicies, sessionTimeoutMins: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Enforce Multi-Factor 2FA Authentication</span>
                      <span className="text-[10px] text-slate-400">Require all agents and administrators to link phone/auth code</span>
                    </div>
                    <input type="checkbox" checked={settings.securityPolicies.force2fa} onChange={e => updateSettingState('securityPolicies', { ...settings.securityPolicies, force2fa: e.target.checked })} className="w-4 h-4 text-gray-700 rounded" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-gray-750 hover:bg-gray-850 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-slate-200">Save Security Rules</button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
