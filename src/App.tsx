import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Building2, 
  ArrowLeft,
  X,
  Plus,
  Save,
  Trash2,
  Edit2,
  Calendar,
  CheckSquare,
  TrendingUp,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Clock,
  ExternalLink,
  Target,
  Bell,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  GripVertical,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  Package,
  FileText,
  Globe,
  Tag,
  Ghost,
  Star,
  UserX,
  Download,
  Upload,
  LifeBuoy,
  Megaphone,
  Menu,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  RefreshCw,
  Activity as ActivityIcon,
  TrendingDown,
  ArrowUpRight,
  ShieldCheck,
  Bug,
  History,
  UserCog,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, eachDayOfInterval as eachDay, subDays } from 'date-fns';
import { 
  Contact, 
  Lead, 
  LeadStage, 
  Task, 
  CalendarEvent, 
  AppNotification, 
  Activity, 
  ActivityType, 
  DashboardWidget, 
  CustomFieldDefinition, 
  CalendarSyncSettings,
  Account,
  Product,
  Quote,
  Project,
  Milestone,
  Invoice
} from './types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from './supabase';

import ProjectsView from './views/ProjectsView';
import InvoicesView from './views/InvoicesView';
import WhatsAppView from './views/WhatsAppView';
import MarketingView from './views/MarketingView';
import SettingsView from './views/SettingsView';
import TasksView from './views/TasksView';
import ReportsView from './views/ReportsView';



// Initial constants
const STAGES: LeadStage[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'];

const INITIAL_WIDGETS: DashboardWidget[] = [
  { id: '1', type: 'contacts', title: 'Total Contacts', visible: true, order: 0 },
  { id: '2', type: 'deals', title: 'Active Deals', visible: true, order: 1 },
  { id: '3', type: 'tasks', title: 'Tasks Due', visible: true, order: 2 },
  { id: '4', type: 'revenue', title: 'Revenue', visible: true, order: 3 },
  { id: '5', type: 'notifications', title: 'Recent Alerts', visible: false, order: 4 },
];

const LoginPage = ({ onLogin }: { onLogin: (e: React.FormEvent<HTMLFormElement>) => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Vyes CRM
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to manage your leads and contacts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-[32px] sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={onLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-100 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(INITIAL_WIDGETS);
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [calendarSyncSettings, setCalendarSyncSettings] = useState<CalendarSyncSettings>({ service: 'none' });
  const [auth, setAuth] = useState<{ user: any; isAuthenticated: boolean }>({ user: null, isAuthenticated: false });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'leads' | 'calendar' | 'notifications' | 'reports' | 'accounts' | 'products' | 'quotes' | 'tickets' | 'projects' | 'invoices' | 'whatsapp' | 'marketing' | 'settings'>('dashboard');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isCustomizingDashboard, setIsCustomizingDashboard] = useState(false);
  const [isCustomizingFields, setIsCustomizingFields] = useState(false);
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'tasks' | 'events'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [calendarFormType, setCalendarFormType] = useState<'task' | 'event'>('event');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  // Issue / bug log state
  const [bugLogs, setBugLogs] = useState<{id: string; level: 'error'|'warning'|'info'; message: string; context?: string; timestamp: number}[]>([]);
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{open: boolean; type: 'contact'|'lead'|'bulk'|'activity'; id?: string; ids?: string[]; label?: string} | null>(null);
  // Employees list (fetched from Supabase user_profiles)
  const [employees, setEmployees] = useState<{id: string; name: string; email: string; role: string}[]>([]);
  // Notification panel
  const [notifySuccess, setNotifySuccess] = useState<string | null>(null);
  const [notifyError, setNotifyError] = useState<string | null>(null);

  // Helper to push to bug log
  const logBug = useCallback((level: 'error'|'warning'|'info', message: string, context?: string) => {
    setBugLogs(prev => [{ id: crypto.randomUUID(), level, message, context, timestamp: Date.now() }, ...prev.slice(0, 99)]);
  }, []);

  // Helper to show success/error toasts
  const showSuccess = useCallback((msg: string) => {
    setNotifySuccess(msg);
    setTimeout(() => setNotifySuccess(null), 3500);
  }, []);
  const showError = useCallback((msg: string) => {
    setNotifyError(msg);
    setTimeout(() => setNotifyError(null), 4000);
  }, []);

  const stageMapLocalToSupabase: Record<LeadStage, string> = {
    'New': 'lead',
    'Contacted': 'qualified',
    'Qualified': 'proposal',
    'Proposal': 'negotiation',
    'Closed Won': 'closed_won',
    'Closed Lost': 'closed_lost'
  };

  const stageMapSupabaseToLocal: Record<string, LeadStage> = {
    'lead': 'New',
    'qualified': 'Contacted',
    'proposal': 'Qualified',
    'negotiation': 'Proposal',
    'closed_won': 'Closed Won',
    'closed_lost': 'Closed Lost'
  };

  // Clear selection when tab changes
  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  // Load data and recover session from Supabase on mount concurrently
  useEffect(() => {
    async function initSupabase() {
      const startTime = Date.now();
      try {
        // Recover Auth Session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setAuth({
            user: {
              id: session.user.id,
              name: profile?.full_name || session.user.email?.split('@')[0] || '',
              email: session.user.email || '',
              org_id: profile?.org_id || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'
            },
            isAuthenticated: true
          });
        }

        // Fetch All CRM Data Concurrently
        const [
          { data: contactsData },
          { data: dealsData },
          { data: activitiesData },
          { data: projectsData },
          { data: invoicesData }
        ] = await Promise.all([
          supabase.from('contacts').select('*').order('created_at', { ascending: false }),
          supabase.from('deals').select('*').order('created_at', { ascending: false }),
          supabase.from('activities').select('*').order('created_at', { ascending: false }),
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('invoices').select('*').order('created_at', { ascending: false })
        ]);

        if (contactsData) {
          setContacts(contactsData.map(c => ({
            id: c.id,
            name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.company || 'Unnamed',
            email: c.email || '',
            phone: c.phone || '',
            company: c.company || '',
            location: '',
            createdAt: new Date(c.created_at).getTime(),
            updatedAt: new Date(c.updated_at).getTime()
          })));
        }

        if (dealsData) {
          setLeads(dealsData.map(d => ({
            id: d.id,
            contactId: d.contact_id || '',
            title: d.title || '',
            value: Number(d.value) || 0,
            stage: stageMapSupabaseToLocal[d.stage] || 'New',
            createdAt: new Date(d.created_at).getTime(),
            updatedAt: new Date(d.updated_at).getTime()
          })));
        }

        if (activitiesData) {
          setActivities(activitiesData.map(a => ({
            id: a.id,
            contactId: a.contact_id || '',
            leadId: a.deal_id || undefined,
            type: (a.type === 'meeting' ? 'Meeting' : a.type === 'email' ? 'Email' : a.type === 'call' ? 'Call' : 'Note') as ActivityType,
            content: a.description || a.title || '',
            createdAt: new Date(a.created_at).getTime()
          })));

          const taskActivities = activitiesData.filter(a => a.type === 'task');
          setTasks(taskActivities.map(t => ({
            id: t.id,
            title: t.title || '',
            description: t.description || '',
            dueDate: t.due_at ? new Date(t.due_at).getTime() : Date.now(),
            completed: t.status === 'completed',
            relatedToType: t.deal_id ? 'lead' : 'contact',
            relatedToId: t.deal_id || t.contact_id || '',
            createdAt: new Date(t.created_at).getTime()
          })));

          const eventActivities = activitiesData.filter(a => a.type === 'meeting');
          setEvents(eventActivities.map(e => ({
            id: e.id,
            title: e.title || '',
            description: e.description || '',
            startTime: e.due_at ? new Date(e.due_at).getTime() : Date.now(),
            endTime: e.due_at ? new Date(e.due_at).getTime() + 3600000 : Date.now() + 3600000,
            relatedToType: e.deal_id ? 'lead' : 'contact',
            relatedToId: e.deal_id || e.contact_id || '',
            createdAt: new Date(e.created_at).getTime()
          })));
        }

        if (projectsData) {
          setProjects(projectsData.map(p => ({
            id: p.id,
            name: p.name || '',
            description: p.description || '',
            status: (p.status === 'planning' ? 'Planning' : p.status === 'active' ? 'Active' : p.status === 'on_hold' ? 'On Hold' : 'Completed') as any,
            milestones: [],
            createdAt: new Date(p.created_at).getTime(),
            updatedAt: new Date(p.updated_at).getTime()
          })));
        }

        if (invoicesData) {
          setInvoices(invoicesData.map(i => {
            let notesObj: any = {};
            try {
              notesObj = JSON.parse(i.notes || '{}');
            } catch (e) {
              notesObj = { clientAddress: i.notes || '' };
            }
            return {
              id: i.invoice_number || i.id,
              projectId: '',
              clientName: i.place_of_supply || '',
              clientAddress: notesObj.clientAddress || notesObj.notes || '',
              items: Array.isArray(i.line_items) ? i.line_items : [],
              subtotal: Number(i.subtotal) || 0,
              gstRate: 18,
              gstAmount: Number(i.igst_total || i.cgst_total || 0),
              total: Number(i.grand_total) || 0,
              status: (i.status === 'paid' ? 'Paid' : i.status === 'overdue' ? 'Overdue' : 'Pending') as any,
              dueDate: i.due_date ? new Date(i.due_date).getTime() : Date.now(),
              createdAt: new Date(i.created_at).getTime(),
              sellerDetails: notesObj.sellerDetails || undefined,
              taxesSummary: notesObj.taxesSummary || undefined,
              currency: notesObj.currency || 'INR'
            };
          }));
        }

        // Fetch employees (team members)
        const { data: employeeData } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, role');
        if (employeeData) {
          setEmployees(employeeData.map((e: any) => ({
            id: e.id,
            name: e.full_name || e.email?.split('@')[0] || 'User',
            email: e.email || '',
            role: e.role || 'member'
          })));
        }
      } catch (err: any) {
        console.error('Error initializing production CRM data:', err);
        logBug('error', `Supabase init failed: ${err?.message || 'Unknown error'}`, JSON.stringify(err));
      } finally {
        const elapsed = Date.now() - startTime;
        const remain = Math.max(0, 1800 - elapsed);
        setTimeout(() => {
          setIsSplashLoading(false);
        }, remain);
      }
    }
    initSupabase();
  }, []);


  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('vyes_crm_contacts', JSON.stringify(contacts));
    localStorage.setItem('vyes_crm_leads', JSON.stringify(leads));
    localStorage.setItem('vyes_crm_tasks', JSON.stringify(tasks));
    localStorage.setItem('vyes_crm_events', JSON.stringify(events));
    localStorage.setItem('vyes_crm_notifications', JSON.stringify(notifications));
    localStorage.setItem('vyes_crm_activities', JSON.stringify(activities));
    localStorage.setItem('vyes_crm_widgets', JSON.stringify(widgets));
    localStorage.setItem('vyes_crm_custom_fields', JSON.stringify(customFieldDefinitions));
    localStorage.setItem('vyes_crm_accounts', JSON.stringify(accounts));
    localStorage.setItem('vyes_crm_products', JSON.stringify(products));
    localStorage.setItem('vyes_crm_quotes', JSON.stringify(quotes));
    localStorage.setItem('vyes_crm_auth', JSON.stringify(auth));
    localStorage.setItem('vyes_crm_sync', JSON.stringify(calendarSyncSettings));
    localStorage.setItem('vyes_crm_projects', JSON.stringify(projects));
    localStorage.setItem('vyes_crm_invoices', JSON.stringify(invoices));
  }, [contacts, leads, tasks, events, notifications, activities, widgets, customFieldDefinitions, auth, calendarSyncSettings, accounts, products, quotes, projects, invoices]);

  // Automated Follow-up Logic
  useEffect(() => {
    const checkStagnantLeads = () => {
      const now = Date.now();
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      const newNotifications: AppNotification[] = [];

      leads.forEach(lead => {
        if (lead.stage !== 'Closed Won' && lead.stage !== 'Closed Lost') {
          const stagnantTime = now - lead.updatedAt;
          if (stagnantTime > threeDaysMs) {
            // Check if we already have a recent notification for this
            const existingNote = notifications.find(n => 
              n.relatedToId === lead.id && 
              n.type === 'stage_stagnant' && 
              (now - n.createdAt) < threeDaysMs
            );

            if (!existingNote) {
              newNotifications.push({
                id: crypto.randomUUID(),
                title: 'Stagnant Lead',
                message: `Lead "${lead.title}" has been in "${lead.stage}" for over 3 days. Time to follow up!`,
                type: 'stage_stagnant',
                read: false,
                relatedToType: 'lead',
                relatedToId: lead.id,
                createdAt: now
              });
            }
          }
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
      }
    };

    const interval = setInterval(checkStagnantLeads, 60000); // Check every minute
    checkStagnantLeads(); // Initial check
    return () => clearInterval(interval);
  }, [leads, notifications]);

  const handleConnectCalendar = async (service: 'google' | 'outlook') => {
    try {
      const response = await fetch(`/api/auth/${service}/url`);
      const { url } = await response.json();
      window.open(url, 'calendar_auth', 'width=600,height=700');
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        setCalendarSyncSettings({
          service: 'google',
          tokens: event.data.tokens,
          lastSyncedAt: Date.now()
        });
        alert('Google Calendar connected successfully!');
      } else if (event.data?.type === 'MICROSOFT_AUTH_SUCCESS') {
        setCalendarSyncSettings({
          service: 'outlook',
          tokens: { accessToken: event.data.accessToken, account: event.data.account },
          lastSyncedAt: Date.now()
        });
        alert('Outlook Calendar connected successfully!');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSyncCalendar = async () => {
    if (calendarSyncSettings.service === 'none') return;
    
    try {
      const response = await fetch(`/api/calendar/${calendarSyncSettings.service}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tokens: calendarSyncSettings.tokens,
          events: events 
        }),
      });
      
      const data = await response.json();
      if (data.remoteEvents) {
        // Merge remote events into local state
        // This is a naive merge, in a real app you'd check for duplicates
        const newEvents: CalendarEvent[] = data.remoteEvents.map((re: any) => ({
          id: crypto.randomUUID(),
          remoteId: re.id,
          title: re.summary || re.subject,
          description: re.description || re.bodyPreview || '',
          startTime: new Date(re.start?.dateTime || re.start?.dateTime).getTime(),
          endTime: new Date(re.end?.dateTime || re.end?.dateTime).getTime(),
          relatedToType: 'contact', // Default or logical mapping
          relatedToId: '',
          createdAt: Date.now()
        }));

        // Filter out events we already have by remoteId
        const existingRemoteIds = new Set(events.filter(e => e.remoteId).map(e => e.remoteId));
        const filteredNewEvents = newEvents.filter(ne => !existingRemoteIds.has(ne.remoteId));
        
        if (filteredNewEvents.length > 0) {
          setEvents(prev => [...prev, ...filteredNewEvents]);
        }
        
        setCalendarSyncSettings(prev => ({ ...prev, lastSyncedAt: Date.now() }));
        alert(`Synced successfully! Added ${filteredNewEvents.length} new events.`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please check your connection.');
    }
  };

  const filteredContacts = contacts.filter(c => {
    const name = c.name?.toLowerCase() || '';
    const email = c.email?.toLowerCase() || '';
    const company = c.company?.toLowerCase() || '';
    const location = c.location?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) ||
      email.includes(search) ||
      company.includes(search) ||
      location.includes(search);
    
    const matchesLocation = locationFilter === 'All' || location.includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const handleGlobalSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Helper to extract custom fields
    const getCustomFields = (target: 'contact' | 'lead') => {
      const fields: Record<string, string> = {};
      customFieldDefinitions
        .filter(d => d.target === target)
        .forEach(d => {
          const val = formData.get(`custom_${d.id}`);
          if (val) fields[d.id] = val as string;
        });
      return fields;
    };

    if (isAddingNew) {
      if (activeTab === 'contacts') {
        const newContact: Contact = {
          id: crypto.randomUUID(),
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          company: formData.get('company') as string,
          location: formData.get('location') as string,
          customFields: getCustomFields('contact'),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const [first_name, ...last_parts] = newContact.name.split(' ');
        const last_name = last_parts.join(' ');
        supabase.from('contacts').insert([{
          id: newContact.id,
          first_name,
          last_name,
          email: newContact.email,
          phone: newContact.phone,
          company: newContact.company,
          org_id: 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'
        }]).then();
        setContacts([newContact, ...contacts]);
      } else if (activeTab === 'leads') {
        const newLead: Lead = {
          id: crypto.randomUUID(),
          title: formData.get('title') as string,
          contactId: formData.get('contactId') as string,
          value: Number(formData.get('value')),
          stage: formData.get('stage') as LeadStage,
          contactNumber: formData.get('contactNumber') as string,
          customerLocation: formData.get('customerLocation') as string,
          assignedTo: formData.get('assignedTo') as string,
          assignedBy: formData.get('assignedBy') as string,
          assignmentHistory: [{
            assignedTo: formData.get('assignedTo') as string,
            assignedBy: formData.get('assignedBy') as string,
            timestamp: Date.now()
          }],
          customFields: getCustomFields('lead'),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        supabase.from('deals').insert([{
          id: newLead.id,
          contact_id: newLead.contactId || null,
          title: newLead.title,
          value: newLead.value,
          stage: stageMapLocalToSupabase[newLead.stage] || 'lead',
          org_id: 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'
        }]).then();
        setLeads([newLead, ...leads]);
      } else if (activeTab === 'accounts') {
        const newAccount: Account = {
          id: crypto.randomUUID(),
          name: formData.get('name') as string,
          industry: formData.get('industry') as string,
          website: formData.get('website') as string,
          phone: formData.get('phone') as string,
          description: formData.get('description') as string,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setAccounts([newAccount, ...accounts]);
      } else if (activeTab === 'products') {
        const newProduct: Product = {
          id: crypto.randomUUID(),
          name: formData.get('name') as string,
          description: formData.get('description') as string,
          price: Number(formData.get('price')),
          category: formData.get('category') as string,
          sku: formData.get('sku') as string,
        };
        setProducts([newProduct, ...products]);
      } else if (activeTab === 'quotes') {
        const newQuote: Quote = {
          id: crypto.randomUUID(),
          title: formData.get('title') as string,
          leadId: formData.get('leadId') as string,
          items: [],
          total: Number(formData.get('total')),
          status: 'Draft',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setQuotes([newQuote, ...quotes]);
      }
      setIsAddingNew(false);
    } else {
      // Edit logic
      if (selectedContact) {
        const updatedData = { 
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          company: formData.get('company') as string,
          location: formData.get('location') as string,
          customFields: getCustomFields('contact'), 
          updatedAt: Date.now() 
        };
        const [first_name, ...last_parts] = updatedData.name.split(' ');
        const last_name = last_parts.join(' ');
        supabase.from('contacts').update({
          first_name,
          last_name,
          email: updatedData.email,
          phone: updatedData.phone,
          company: updatedData.company
        }).eq('id', selectedContact.id).then();
        setContacts(contacts.map(c => c.id === selectedContact.id ? { ...c, ...updatedData } : c));
        setSelectedContact({ ...selectedContact, ...updatedData });
      } else if (selectedLead) {
        const updatedData = {
          title: formData.get('title') as string,
          contactId: formData.get('contactId') as string,
          value: Number(formData.get('value')),
          stage: formData.get('stage') as LeadStage,
          assignedTo: formData.get('assignedTo') as string,
          assignedBy: formData.get('assignedBy') as string,
          assignmentHistory: [
            ...(selectedLead.assignmentHistory || []),
            {
              assignedTo: formData.get('assignedTo') as string,
              assignedBy: formData.get('assignedBy') as string,
              timestamp: Date.now()
            }
          ],
          customFields: getCustomFields('lead'), 
          updatedAt: Date.now()
        };
        supabase.from('deals').update({
          title: updatedData.title,
          contact_id: updatedData.contactId || null,
          value: updatedData.value,
          stage: stageMapLocalToSupabase[updatedData.stage] || 'lead'
        }).eq('id', selectedLead.id).then();
        setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, ...updatedData } : l));
        setSelectedLead({ ...selectedLead, ...updatedData });
      } else if (selectedAccount) {
         const updatedData = {
          name: formData.get('name') as string,
          industry: formData.get('industry') as string,
          website: formData.get('website') as string,
          phone: formData.get('phone') as string,
          description: formData.get('description') as string,
          updatedAt: Date.now(),
        };
        setAccounts(accounts.map(a => a.id === selectedAccount.id ? { ...a, ...updatedData } : a));
        setSelectedAccount({ ...selectedAccount, ...updatedData });
      }
      setIsEditing(false);
    }

  };

  const handleSaveTaskOrEvent = (e: React.FormEvent<HTMLFormElement>, type: 'task' | 'event') => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (type === 'task') {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        dueDate: new Date(formData.get('dueDate') as string).getTime(),
        completed: false,
        relatedToType: formData.get('relatedToType') as 'contact' | 'lead',
        relatedToId: formData.get('relatedToId') as string,
        createdAt: Date.now(),
      };
      supabase.from('activities').insert([{
        id: newTask.id,
        org_id: 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b',
        type: 'task',
        title: newTask.title,
        description: newTask.description,
        status: 'pending',
        due_at: new Date(newTask.dueDate).toISOString(),
        contact_id: newTask.relatedToType === 'contact' ? newTask.relatedToId : null,
        deal_id: newTask.relatedToType === 'lead' ? newTask.relatedToId : null
      }]).then();
      setTasks([...tasks, newTask]);
    } else {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        startTime: new Date(formData.get('startTime') as string).getTime(),
        endTime: new Date(formData.get('endTime') as string).getTime(),
        relatedToType: formData.get('relatedToType') as 'contact' | 'lead',
        relatedToId: formData.get('relatedToId') as string,
        createdAt: Date.now(),
      };
      supabase.from('activities').insert([{
        id: newEvent.id,
        org_id: 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b',
        type: 'meeting',
        title: newEvent.title,
        description: newEvent.description,
        status: 'completed',
        due_at: new Date(newEvent.startTime).toISOString(),
        contact_id: newEvent.relatedToType === 'contact' ? newEvent.relatedToId : null,
        deal_id: newEvent.relatedToType === 'lead' ? newEvent.relatedToId : null
      }]).then();
      setEvents([...events, newEvent]);
    }
    setIsAddingNew(false);
  };

  const toggleTaskCompletion = (taskId: string) => {
    const t = tasks.find(x => x.id === taskId);
    if (t) {
      supabase.from('activities').update({
        status: !t.completed ? 'completed' : 'pending'
      }).eq('id', taskId).then();
    }
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteContact = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    openDeleteModal('contact', id, undefined, contact?.name || 'this contact');
  };

  const handleDeleteLead = (id: string) => {
    const lead = leads.find(l => l.id === id);
    openDeleteModal('lead', id, undefined, lead?.title || 'this deal');
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Open delete modal (shows a beautiful modal instead of browser confirm)
  const openDeleteModal = (type: 'contact'|'lead'|'bulk'|'activity', id?: string, ids?: string[], label?: string) => {
    setDeleteModal({ open: true, type, id, ids, label });
  };

  const executeDelete = async () => {
    if (!deleteModal) return;
    try {
      if (deleteModal.type === 'contact' && deleteModal.id) {
        const { error } = await supabase.from('contacts').delete().eq('id', deleteModal.id);
        if (error) throw error;
        setContacts(prev => prev.filter(c => c.id !== deleteModal.id));
        if (selectedContact?.id === deleteModal.id) { setSelectedContact(null); setIsEditing(false); }
        showSuccess('Contact deleted successfully.');
        logBug('info', `Contact deleted: ${deleteModal.id}`);
      } else if (deleteModal.type === 'lead' && deleteModal.id) {
        const { error } = await supabase.from('deals').delete().eq('id', deleteModal.id);
        if (error) throw error;
        setLeads(prev => prev.filter(l => l.id !== deleteModal.id));
        if (selectedLead?.id === deleteModal.id) { setSelectedLead(null); setIsEditing(false); }
        showSuccess('Deal deleted successfully.');
        logBug('info', `Deal deleted: ${deleteModal.id}`);
      } else if (deleteModal.type === 'bulk' && deleteModal.ids?.length) {
        if (activeTab === 'contacts') {
          const { error } = await supabase.from('contacts').delete().in('id', deleteModal.ids);
          if (error) throw error;
          setContacts(prev => prev.filter(c => !deleteModal.ids!.includes(c.id)));
          showSuccess(`${deleteModal.ids.length} contacts deleted.`);
        } else if (activeTab === 'leads') {
          const { error } = await supabase.from('deals').delete().in('id', deleteModal.ids);
          if (error) throw error;
          setLeads(prev => prev.filter(l => !deleteModal.ids!.includes(l.id)));
          showSuccess(`${deleteModal.ids.length} deals deleted.`);
        }
        setSelectedIds([]);
      } else if (deleteModal.type === 'activity' && deleteModal.id) {
        const { error } = await supabase.from('activities').delete().eq('id', deleteModal.id);
        if (error) throw error;
        setActivities(prev => prev.filter(a => a.id !== deleteModal.id));
        showSuccess('Activity removed.');
      }
    } catch (err: any) {
      showError(`Delete failed: ${err?.message || 'Unknown error'}`);
      logBug('error', `Delete failed [${deleteModal.type}]: ${err?.message}`, JSON.stringify(err));
    }
    setDeleteModal(null);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    openDeleteModal('bulk', undefined, selectedIds, `${selectedIds.length} selected records`);
  };

  const handleBulkStageChange = (stage: LeadStage) => {
    supabase.from('deals').update({
      stage: stageMapLocalToSupabase[stage] || 'lead',
      updated_at: new Date().toISOString()
    }).in('id', selectedIds).then(({ error }) => {
      if (error) logBug('error', `Bulk stage change failed: ${error.message}`);
      else showSuccess(`${selectedIds.length} deals moved to ${stage}.`);
    });
    setLeads(leads.map(l => selectedIds.includes(l.id) ? { ...l, stage, updatedAt: Date.now() } : l));
    setSelectedIds([]);
  };


  const renderNotificationsView = () => (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm">Stay on top of your deals and tasks</p>
        </div>
        <button 
          onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
          className="text-sm text-blue-600 font-medium hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Bell size={32} />
            </div>
            <p className="text-slate-500 font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id}
              onClick={() => {
                setNotifications(notifications.map(n => n.id === notification.id ? { ...n, read: true } : n));
                if (notification.relatedToType === 'lead') {
                  const lead = leads.find(l => l.id === notification.relatedToId);
                  if (lead) {
                    setSelectedLead(lead);
                    setActiveTab('leads');
                  }
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-4 ${notification.read ? 'bg-white border-slate-100 text-slate-500' : 'bg-blue-50 border-blue-100 text-slate-900 shadow-sm'}`}
            >
              <div className={`p-2 rounded-xl flex-shrink-0 ${notification.read ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                {notification.type === 'stage_stagnant' ? <Clock size={20} /> : <Bell size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`font-bold text-sm ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>{notification.title}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">{format(notification.createdAt, 'MMM d, h:mm a')}</span>
                </div>
                <p className="text-sm mt-1 leading-relaxed">{notification.message}</p>
                {!notification.read && (
                  <div className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
                    Take action <ChevronRight size={12} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );

  const handleSaveActivity = (e: React.FormEvent<HTMLFormElement>, context: 'contact' | 'lead') => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const duration = formData.get('duration');
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      contactId: context === 'contact' ? selectedContact!.id : selectedLead!.contactId,
      leadId: context === 'lead' ? selectedLead!.id : undefined,
      type: formData.get('type') as ActivityType,
      content: formData.get('content') as string,
      duration: duration ? Number(duration) : undefined,
      createdAt: Date.now(),
    };
    supabase.from('activities').insert([{
      id: newActivity.id,
      org_id: 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b',
      contact_id: newActivity.contactId,
      deal_id: newActivity.leadId || null,
      type: newActivity.type.toLowerCase() === 'meeting' ? 'meeting' : newActivity.type.toLowerCase() === 'email' ? 'email' : newActivity.type.toLowerCase() === 'call' ? 'call' : 'note',
      title: newActivity.type,
      description: newActivity.content,
      status: 'completed',
      due_at: new Date(newActivity.createdAt).toISOString()
    }]).then();
    setActivities([newActivity, ...activities]);
    e.currentTarget.reset();
  };

  const handleRemoveActivity = (id: string) => {
    openDeleteModal('activity', id, undefined, 'this activity');
  };


  const handleAddCustomField = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newField: CustomFieldDefinition = {
      id: crypto.randomUUID(),
      label: formData.get('label') as string,
      type: formData.get('type') as 'text' | 'number' | 'date',
      target: formData.get('target') as 'contact' | 'lead',
    };
    setCustomFieldDefinitions([...customFieldDefinitions, newField]);
    e.currentTarget.reset();
  };

  const handleRemoveCustomField = (id: string) => {
    if (confirm('Are you sure you want to remove this custom field? Data associated with it will remain but won\'t be visible.')) {
      setCustomFieldDefinitions(customFieldDefinitions.filter(d => d.id !== id));
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        alert(`Authentication Error: ${error.message}`);
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      setAuth({
        user: { 
          id: data.user.id,
          name: profile?.full_name || email.split('@')[0], 
          email,
          org_id: profile?.org_id || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'
        },
        isAuthenticated: true
      });
    } catch (err: any) {
      console.error(err);
      alert(`Login failed: ${err.message || 'Unknown network error'}`);
    }
  };


  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await supabase.auth.signOut();
      setAuth({ user: null, isAuthenticated: false });
    }
  };

  const handleMoveWidget = (id: string, direction: 'up' | 'down') => {
    const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);
    const index = sortedWidgets.findIndex(w => w.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sortedWidgets.length - 1)) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const target = sortedWidgets[index];
    const other = sortedWidgets[newIndex];

    const tempOrder = target.order;
    target.order = other.order;
    other.order = tempOrder;

    setWidgets([...sortedWidgets]);
  };

  const toggleWidgetVisibility = (id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const renderDashboardWidget = (widget: DashboardWidget) => {
    if (!widget.visible) return null;

    switch (widget.type) {
      case 'contacts':
        return (
          <div 
            key={widget.id}
            onClick={() => setActiveTab('contacts')}
            className="bg-[#EEF7FF] p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-blue-50/50 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group active:scale-95"
          >
            <div className="text-blue-500 mb-6 md:mb-12">
              <Users size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800 mb-2">{contacts.length.toLocaleString()}</p>
              <p className="text-slate-400 text-sm font-medium tracking-tight">{widget.title}</p>
            </div>
          </div>
        );
      case 'deals':
        return (
          <div 
            key={widget.id}
            onClick={() => setActiveTab('leads')}
            className="bg-[#F2FAF5] p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-emerald-50/50 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group active:scale-95"
          >
            <div className="text-emerald-500 mb-6 md:mb-12">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800 mb-2">
                {leads.filter(l => l.stage !== 'Closed Won' && l.stage !== 'Closed Lost').length}
              </p>
              <p className="text-slate-400 text-sm font-medium tracking-tight">{widget.title}</p>
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div 
            key={widget.id}
            onClick={() => setActiveTab('calendar')}
            className="bg-[#FFF9F2] p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-orange-50/50 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group active:scale-95"
          >
            <div className="text-orange-500 mb-6 md:mb-12">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800 mb-2">
                {tasks.filter(t => !t.completed).length}
              </p>
              <p className="text-slate-400 text-sm font-medium tracking-tight">{widget.title}</p>
            </div>
          </div>
        );
      case 'revenue':
        return (
          <div 
            key={widget.id}
            onClick={() => setActiveTab('leads')}
            className="bg-[#F9F4FF] p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-purple-50/50 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group active:scale-95"
          >
            <div className="text-purple-500 mb-12">
              <TrendingUp size={32} />
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-800 mb-2">
                ₹{(leads.reduce((acc, curr) => acc + curr.value, 0) / 1000).toFixed(1)}k
              </p>
              <p className="text-slate-400 font-medium tracking-tight">{widget.title}</p>
            </div>
          </div>
        );
      case 'notifications':
        const unreadCount = notifications.filter(n => !n.read).length;
        return (
          <div 
            key={widget.id}
            onClick={() => setActiveTab('notifications')}
            className="bg-[#FFF0F0] p-10 rounded-[40px] border border-red-50/50 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group active:scale-95"
          >
            <div className="text-red-500 mb-12">
              <Bell size={32} />
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-800 mb-2">{unreadCount}</p>
              <p className="text-slate-400 font-medium tracking-tight">{widget.title}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAccountsView = () => (
    <motion.div
      key="accounts"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
          <p className="text-slate-500 text-sm">Manage organizations and companies</p>
        </div>
        <button 
          onClick={() => { setIsAddingNew(true); setSelectedAccount(null); }}
          className="btn-gradient px-4 py-2 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(account => (
          <motion.div 
            key={account.id}
            onClick={() => setSelectedAccount(account)}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{account.name}</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{account.industry}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Globe size={14} />
                <span className="truncate">{account.website}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone size={14} />
                <span>{account.phone}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderProductsView = () => (
    <motion.div
      key="products"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 text-sm">Manage your product catalog and services</p>
        </div>
        <button 
          onClick={() => { setIsAddingNew(true); setSelectedProduct(null); }}
          className="btn-gradient px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <motion.div 
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Package size={20} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{product.category}</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{product.name}</h3>
            <p className="text-xs text-slate-400 mb-4 line-clamp-1">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.sku}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderQuotesView = () => (
    <motion.div
      key="quotes"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quotes</h1>
          <p className="text-slate-500 text-sm">Create and track customer estimates</p>
        </div>
        <button 
          onClick={() => { setIsAddingNew(true); setSelectedQuote(null); }}
          className="btn-gradient px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Quote</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Quote Title</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Total Value</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Date Created</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(quote => (
              <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                <td className="px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText size={16} />
                    </div>
                    <span className="font-bold text-slate-700">{quote.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-slate-100">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    quote.status === 'Sent' ? 'bg-blue-50 text-blue-600' :
                    quote.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' :
                    quote.status === 'Declined' ? 'bg-red-50 text-red-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {quote.status}
                  </span>
                </td>
                <td className="px-6 py-4 border-b border-slate-100">
                  <span className="font-bold text-slate-900">₹{quote.total.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 border-b border-slate-100 text-sm text-slate-500 font-medium">
                  {format(quote.createdAt, 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 border-b border-slate-100 text-right">
                   <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all opacity-0 group-hover:opacity-100">
                      <ExternalLink size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderLeadsView = () => (
    <motion.div
      key="leads"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
          <p className="text-slate-500 text-sm">Track and manage your potential deals</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
              >
                <span className="text-sm font-bold text-slate-600">{selectedIds.length} Selected</span>
                
                <select 
                  onChange={(e) => handleBulkStageChange(e.target.value as LeadStage)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-slate-600"
                  defaultValue=""
                >
                  <option value="" disabled>Change Stage</option>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <button 
                  onClick={handleBulkDelete}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Selected"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => { setIsAddingNew(true); setSelectedLead(null); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-md font-semibold"
          >
            <Plus size={20} />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 overflow-x-auto lg:grid-cols-6 gap-4 min-w-[1200px]">
        {STAGES.map(stage => (
          <div key={stage} className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{stage}</h3>
              <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full font-bold">
                {leads.filter(l => l.stage === stage).length}
              </span>
            </div>
            <div className="space-y-3">
              {leads.filter(l => l.stage === stage).map(lead => {
                const contact = contacts.find(c => c.id === lead.contactId);
                return (
                  <motion.div 
                    key={lead.id}
                    layoutId={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all relative ${selectedIds.includes(lead.id) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-100'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-slate-900 text-sm">{lead.title}</p>
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={(e) => { e.stopPropagation(); toggleSelection(lead.id); }}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <p className="text-blue-600 text-xs font-semibold mb-2">{contact?.name || 'Unknown Contact'}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                      <p className="text-sm font-mono text-slate-700 tracking-tighter">₹{lead.value.toLocaleString()}</p>
                      <select 
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          setLeads(leads.map(l => l.id === lead.id ? { ...l, stage: e.target.value as LeadStage, updatedAt: Date.now() } : l));
                        }}
                        value={lead.stage}
                        className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-1 outline-none text-slate-500 font-bold uppercase tracking-tight hover:border-blue-300 transition-colors"
                      >
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderReportsView = () => {
    // Lead Stage Distribution
    const stageData = STAGES.map(stage => ({
      name: stage,
      value: leads.filter(l => l.stage === stage).length
    }));

    // Revenue over time (simplified)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dayLeads = leads.filter(l => isSameDay(new Date(l.createdAt), date));
      const revenue = dayLeads.reduce((acc, curr) => acc + curr.value, 0);
      return {
        date: format(date, 'MMM d'),
        revenue
      };
    });

    // Activity types
    const activityData = [
      { name: 'Note', count: activities.filter(a => a.type === 'Note').length },
      { name: 'Inbound', count: activities.filter(a => a.type === 'Inbound Call').length },
      { name: 'Outbound', count: activities.filter(a => a.type === 'Outbound Call').length },
      { name: 'Email', count: activities.filter(a => a.type === 'Email').length },
      { name: 'Meeting', count: activities.filter(a => a.type === 'Meeting').length },
    ];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#64748B'];

    return (
      <motion.div
        key="reports"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Business Intelligence</h1>
            <p className="text-slate-500 font-medium mt-1">Deep dive into your CRM performance metrics</p>
          </div>
          <button 
            onClick={() => {
              const headers = ['Contact', 'Type', 'Content', 'Duration', 'Date'];
              const rows = activities.map(a => {
                const contact = contacts.find(c => c.id === a.contactId);
                return [
                  contact?.name || 'Unknown',
                  a.type,
                  a.content,
                  a.duration ? `${a.duration} mins` : '-',
                  format(a.createdAt, 'MMM d, yyyy')
                ];
              });
              const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `activities-${format(new Date(), 'yyyy-MM-dd')}.csv`;
              a.click();
            }}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
          >
            <Download size={18} />
            Export Activities
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Lead Stage Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Activity Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Pipeline Revenue (Last 30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last30Days}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>
      </motion.div>
    );
  };


  const renderTicketsView = () => (
    <div className="p-8 text-center text-slate-400">Tickets (Support) View - Coming Soon</div>
  );

  const renderProjectsView = () => (
    <ProjectsView
      projects={projects}
      setProjects={setProjects}
      orgId={auth.user?.org_id || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'}
      showSuccess={showSuccess}
      showError={showError}
    />
  );

  const renderInvoicesView = () => (
    <InvoicesView
      invoices={invoices}
      setInvoices={setInvoices}
      orgId={auth.user?.org_id || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'}
      showSuccess={showSuccess}
      showError={showError}
    />
  );

  const renderWhatsAppView = () => (
    <WhatsAppView
      contacts={contacts}
      orgId={auth.user?.org_id || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'}
      showSuccess={showSuccess}
      showError={showError}
    />
  );

  const renderMarketingView = () => (
    <MarketingView
      orgId={auth.user?.org_id || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'}
      showSuccess={showSuccess}
      showError={showError}
    />
  );

  const renderSettingsView = () => (
    <SettingsView
      orgId={auth.user?.org_id || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'}
      showSuccess={showSuccess}
      showError={showError}
    />
  );

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <motion.div
        key="calendar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your schedule and deadlines</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Toggle */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center shadow-inner">
              <button 
                onClick={() => setCalendarFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${calendarFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setCalendarFilter('events')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${calendarFilter === 'events' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Events
              </button>
              <button 
                onClick={() => setCalendarFilter('tasks')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${calendarFilter === 'tasks' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tasks
              </button>
            </div>

            <div className="flex items-center bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-3 hover:bg-slate-50 border-r border-slate-100 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentMonth(new Date())}
                className="px-6 py-2 hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors"
              >
                Today
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-3 hover:bg-slate-50 border-l border-slate-100 transition-colors"
                title="Next Month"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            <button 
              onClick={() => { setIsAddingNew(true); setCalendarFormType('event'); }}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold"
            >
              <Plus size={20} />
              <span>Add Activity</span>
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-50 bg-[#FDFDFD]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-xs font-bold text-slate-400 border-r border-slate-50 last:border-r-0 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => (
              <div 
                key={day.toISOString()} 
                className={`min-h-[140px] p-4 border-r border-b border-slate-50 last:border-r-0 hover:bg-slate-50/30 transition-colors group ${!isSameMonth(day, monthStart) ? 'bg-[#FCFCFC]/50 opacity-40' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`text-sm font-bold flex items-center justify-center w-8 h-8 rounded-xl transition-all ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 group-hover:text-slate-800'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {(calendarFilter === 'all' || calendarFilter === 'events') && events.filter(e => isSameDay(new Date(e.startTime), day)).map(event => (
                    <div key={event.id} className="text-[10px] p-2 bg-blue-50/50 text-blue-700 border border-blue-100/50 rounded-lg truncate font-bold shadow-sm">
                      {event.title}
                    </div>
                  ))}
                  {(calendarFilter === 'all' || calendarFilter === 'tasks') && tasks.filter(t => isSameDay(new Date(t.dueDate), day)).map(task => (
                    <div key={task.id} className={`text-[10px] p-2 border rounded-lg truncate font-bold flex items-center gap-2 shadow-sm transition-all ${task.completed ? 'bg-slate-50 text-slate-400 border-slate-100 pr-3' : 'bg-emerald-50/50 text-emerald-700 border-emerald-100/50'}`}>
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => toggleTaskCompletion(task.id)}
                        className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className={`truncate ${task.completed ? 'line-through decoration-slate-300' : ''}`}>{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const getNavButtonClass = (tab: string) => {
    const isActive = activeTab === tab;
    const baseClass = "w-full flex items-center rounded-2xl transition-all duration-200";
    const activeClass = isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-400 hover:bg-slate-50";
    const layoutClass = isMobileMenuOpen 
      ? "justify-start space-x-4 px-4" 
      : "justify-center lg:justify-start lg:space-x-4 px-2 lg:px-4";
    return `${baseClass} ${activeClass} ${layoutClass}`;
  };

  const getIconWrapperClass = (tab: string) => {
    const isActive = activeTab === tab;
    return `p-2 rounded-xl transition-colors duration-200 relative ${isActive ? 'bg-blue-100' : 'bg-transparent'}`;
  };

  if (isSplashLoading) {
    return (
      <div className="fixed inset-0 bg-[#0A0E1A] z-[9999] flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient Background Auras */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-75" />

        <div className="flex flex-col items-center relative z-10">
          {/* Logo Glow Ring */}
          <div className="relative w-28 h-28 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-3xl blur-xl animate-ping animate-duration-1000" />
            <motion.div
              initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
              className="w-24 h-24 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl shadow-2xl flex items-center justify-center"
            >
              <img src="/logo.svg" alt="Vyes Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            </motion.div>
          </div>

          {/* Title & Slogan */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-3xl font-black tracking-tight text-white flex items-center gap-1.5"
          >
            Vyes <span className="bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">CRM</span>
          </motion.h1>
          
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2"
          >
            Intelligent SaaS Platform
          </motion.p>

          {/* Progress Indicator */}
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mt-8 border border-white/5 relative">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div id="crm-root" className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-800">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        id="sidebar-nav" 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FDFDFD] border-r border-slate-100 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20 lg:w-64'
        }`}
      >
        <div className={`p-4 lg:p-8 flex items-center ${isMobileMenuOpen ? 'justify-between' : 'justify-center lg:justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <img src="/logo.svg" alt="Vyes Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`font-black text-xl tracking-tight text-slate-800 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Vyes CRM</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            title="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav id="sidebar-links" className={`flex-1 ${isMobileMenuOpen ? 'px-6' : 'px-2 lg:px-6'} space-y-1 overflow-y-auto custom-scrollbar`}>
          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Core</p>
          <button 
            id="nav-dashboard"
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('dashboard')}
          >
            <div className={getIconWrapperClass('dashboard')}>
              <LayoutDashboard size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Overview</span>
          </button>

          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2 px-4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>CRM</p>
          <button 
            id="nav-accounts"
            onClick={() => { setActiveTab('accounts'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('accounts')}
          >
            <div className={getIconWrapperClass('accounts')}>
              <Building2 size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Accounts</span>
          </button>
          <button 
            id="nav-contacts"
            onClick={() => { setActiveTab('contacts'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('contacts')}
          >
            <div className={getIconWrapperClass('contacts')}>
              <Users size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Contacts</span>
          </button>
          <button 
            id="nav-leads"
            onClick={() => { setActiveTab('leads'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('leads')}
          >
            <div className={getIconWrapperClass('leads')}>
              <Briefcase size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Deals</span>
          </button>

          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2 px-4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Sales</p>
          <button 
            id="nav-quotes"
            onClick={() => { setActiveTab('quotes'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('quotes')}
          >
            <div className={getIconWrapperClass('quotes')}>
              <FileText size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Quotes</span>
          </button>
          <button 
            id="nav-products"
            onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('products')}
          >
            <div className={getIconWrapperClass('products')}>
              <Package size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Products</span>
          </button>

          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2 px-4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Operations</p>
          <button 
            id="nav-tickets"
            onClick={() => { setActiveTab('tickets'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('tickets')}
          >
            <div className={getIconWrapperClass('tickets')}>
              <LifeBuoy size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Support</span>
          </button>
          <button 
            id="nav-projects"
            onClick={() => { setActiveTab('projects'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('projects')}
          >
            <div className={getIconWrapperClass('projects')}>
              <Briefcase size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Projects</span>
          </button>
          <button 
            id="nav-invoices"
            onClick={() => { setActiveTab('invoices'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('invoices')}
          >
            <div className={getIconWrapperClass('invoices')}>
              <FileText size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Invoicing</span>
          </button>
          <button 
            id="nav-whatsapp"
            onClick={() => { setActiveTab('whatsapp'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('whatsapp')}
          >
            <div className={getIconWrapperClass('whatsapp')}>
              <MessageSquare size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>WhatsApp</span>
          </button>
          
          <button 
            id="nav-marketing"
            onClick={() => { setActiveTab('marketing'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('marketing')}
          >
            <div className={getIconWrapperClass('marketing')}>
              <Megaphone size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Marketing</span>
          </button>

          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2 px-4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>System</p>
          <button 
            id="nav-settings"
            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('settings')}
          >
            <div className={getIconWrapperClass('settings')}>
              <Settings size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Settings</span>
          </button>
          <button 
            id="nav-bug-log"
            onClick={() => { setActiveTab('notifications'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('notifications')}
            title="Issue Log"
          >
            <div className={getIconWrapperClass('notifications')}>
              <Bug size={20} />
              {bugLogs.filter(b => b.level === 'error').length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              )}
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Issue Log</span>
            {bugLogs.filter(b => b.level === 'error').length > 0 && isMobileMenuOpen && (
              <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {bugLogs.filter(b => b.level === 'error').length}
              </span>
            )}
          </button>

          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2 px-4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Workspace</p>
          <button 
            id="nav-calendar"
            onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('calendar')}
          >
            <div className={getIconWrapperClass('calendar')}>
              <Calendar size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Tasks</span>
          </button>
          <button 
            id="nav-reports"
            onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('reports')}
          >
            <div className={getIconWrapperClass('reports')}>
              <BarChart3 size={20} />
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Reports</span>
          </button>
          <button 
            id="nav-notifications"
            onClick={() => { setActiveTab('notifications'); setIsMobileMenuOpen(false); }}
            className={getNavButtonClass('notifications')}
          >
            <div className={getIconWrapperClass('notifications')}>
              <Bell size={20} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              )}
            </div>
            <span className={`font-semibold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Status</span>
            {notifications.filter(n => !n.read).length > 0 && isMobileMenuOpen && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </nav>

        <div className={`p-4 lg:p-8 flex ${isMobileMenuOpen ? 'flex-row justify-start gap-4' : 'flex-col lg:flex-row justify-center lg:justify-start gap-2 lg:gap-4'} items-center`}>
          <button 
            onClick={() => { setIsCustomizingFields(true); setIsMobileMenuOpen(false); }}
            className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-2xl transition-all flex-shrink-0"
            title="Custom Fields"
          >
            <Settings size={22} />
          </button>
          <button 
            onClick={() => { setIsCalendarSettingsOpen(true); setIsMobileMenuOpen(false); }}
            className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-2xl transition-all flex-shrink-0"
            title="Calendar Sync"
          >
            <Calendar size={22} />
          </button>
          <button 
            onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
            className="w-12 h-12 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all flex-shrink-0"
            title="Log Out"
          >
            <LogOut size={24} />
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 overflow-auto relative flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center flex-1 max-w-xl">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mr-4 p-2.5 text-slate-500 hover:text-slate-700 md:hidden bg-slate-50 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
              title="Toggle Menu"
            >
              <Menu size={22} />
            </button>
            <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
               <Search className="text-slate-400 group-focus-within:text-blue-500" size={18} />
               <input 
                 type="text" 
                 placeholder="Global search contacts, deals, tasks..." 
                 className="w-full pl-3 pr-4 outline-none bg-transparent text-sm font-medium"
               />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end">
                <p className="text-sm font-bold text-slate-800">{auth.user?.email || 'Admin User'}</p>
                <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   Online
                </div>
             </div>
             
             <div className="flex items-center gap-3 border-l border-slate-100 pl-6 text-slate-400">
                <button 
                  onClick={() => { setActiveTab('notifications'); }}
                  className="p-2 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all relative"
                >
                   <Bell size={20} />
                   {notifications.filter(n => !n.read).length > 0 && (
                     <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                   )}
                </button>
                <button 
                  onClick={() => { setIsAddingNew(true); }}
                  className="bg-slate-900 text-white p-2 rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                  title="Quick Create"
                >
                   <Plus size={20} />
                </button>
             </div>
          </div>
        </header>

        <div className="max-w-7xl w-full mx-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'contacts' ? (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
                    <p className="text-slate-500 text-sm">Manage your relationships and leads</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AnimatePresence>
                      {selectedIds.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          <span className="text-sm font-bold text-slate-600">{selectedIds.length} Selected</span>
                          <button 
                            onClick={handleBulkDelete}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Selected"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button 
                      onClick={() => {
                        const headers = ['Name', 'Email', 'Phone', 'Company', 'Location'];
                        const rows = contacts.map(c => [
                          `"${c.name || ''}"`,
                          `"${c.email || ''}"`,
                          `"${c.phone || ''}"`,
                          `"${c.company || ''}"`,
                          `"${c.location || ''}"`
                        ]);
                        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                      className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-sm font-semibold"
                    >
                      <Download size={20} />
                      <span className="hidden md:inline">Export</span>
                    </button>
                    <button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.csv';
                        input.onchange = async (e: any) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const text = event.target?.result as string;
                            const lines = text.split('\n').filter(line => line.trim());
                            if (lines.length < 2) return alert('File is empty or missing data rows');
                            const newContacts = lines.slice(1).map(line => {
                               // Match CSV ignoring commas inside quotes
                               const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
                               return {
                                 id: crypto.randomUUID(),
                                 name: parts[0] || 'Unknown',
                                 email: parts[1] || '',
                                 phone: parts[2] || '',
                                 company: parts[3] || '',
                                 location: parts[4] || '',
                                 createdAt: Date.now(),
                                 updatedAt: Date.now()
                               };
                            });
                            const { error } = await supabase.from('contacts').insert(
                              newContacts.map(c => {
                                 const [first_name, ...last_parts] = c.name.split(' ');
                                 const last_name = last_parts.join(' ');
                                 return {
                                    id: c.id,
                                    first_name,
                                    last_name,
                                    email: c.email,
                                    phone: c.phone,
                                    company: c.company,
                                    org_id: 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'
                                 }
                              })
                            );
                            if (error) {
                               alert('Failed to import to database: ' + error.message);
                            } else {
                               setContacts(prev => [...newContacts, ...prev]);
                               alert(`Successfully imported ${newContacts.length} contacts!`);
                            }
                          };
                          reader.readAsText(file);
                        };
                        input.click();
                      }}
                      className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-sm font-semibold"
                    >
                      <Upload size={20} />
                      <span className="hidden md:inline">Import</span>
                    </button>
                    <button 
                      onClick={() => { setIsAddingNew(true); setSelectedContact(null); }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-md font-semibold"
                    >
                      <Plus size={20} />
                      <span className="hidden md:inline">Add Contact</span>
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex-1 relative flex items-center bg-slate-50 rounded-xl px-4 py-1 border border-slate-200 w-full">
                    <Search className="text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search contacts by name, company or location..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-3 pr-4 py-2 focus:outline-none bg-transparent text-sm text-slate-600 font-medium"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Place:</span>
                    <select 
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 outline-none w-full md:w-auto min-w-[140px]"
                    >
                      <option value="All">All Locations</option>
                      {Array.from(new Set(contacts.map(c => c.location))).sort().map(loc => (
                        loc && <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contact List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContacts.map(contact => (
                    <motion.div 
                      key={contact.id}
                      layoutId={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${selectedIds.includes(contact.id) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-100'}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            checked={selectedIds.includes(contact.id)}
                            onChange={(e) => { e.stopPropagation(); toggleSelection(contact.id); }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                            {contact.name[0]}
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                      <h3 className="font-semibold text-lg text-slate-900">{contact.name}</h3>
                      <p className="text-blue-600 text-sm mb-4 font-medium">{contact.company}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-slate-500 space-x-3">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                            <Mail size={14} />
                          </div>
                          <span className="truncate font-medium">{contact.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-500 space-x-3">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                            <Phone size={14} />
                          </div>
                          <span className="font-medium">{contact.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-500 space-x-3">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                            <MapPin size={14} />
                          </div>
                          <span className="font-medium">{contact.location}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {filteredContacts.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Users size={32} />
                      </div>
                      <p className="text-slate-500">No contacts found. Try a different search or add a new one.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : activeTab === 'accounts' ? (
              renderAccountsView()
            ) : activeTab === 'leads' ? (
              renderLeadsView()
            ) : activeTab === 'quotes' ? (
              renderQuotesView()
            ) : activeTab === 'products' ? (
              renderProductsView()
            ) : activeTab === 'tickets' ? (
              renderTicketsView()
            ) : activeTab === 'projects' ? (
              renderProjectsView()
            ) : activeTab === 'invoices' ? (
              renderInvoicesView()
            ) : activeTab === 'whatsapp' ? (
              renderWhatsAppView()
            ) : activeTab === 'marketing' ? (
              renderMarketingView()
            ) : activeTab === 'settings' ? (
              renderSettingsView()
            ) : activeTab === 'calendar' ? (
              <TasksView
                tasks={tasks}
                setTasks={setTasks}
                orgId={auth.user?.org_id || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'}
                showSuccess={showSuccess}
                showError={showError}
              />
            ) : activeTab === 'notifications' ? (
              renderNotificationsView()
            ) : activeTab === 'reports' ? (
              <ReportsView
                orgId={auth.user?.org_id || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b'}
              />
            ) : (
              // ─── ENHANCED DASHBOARD ───────────────────────────────────────
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {auth.user?.name?.split(' ')[0] || 'Admin'} 👋</h1>
                    <p className="text-slate-400 text-sm mt-1">Here's what's happening with your CRM today.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsCustomizingDashboard(true)}
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200 bg-white"
                      title="Customize Dashboard"
                    >
                      <Settings size={18} />
                    </button>
                    <button 
                      onClick={() => { setActiveTab('leads'); setIsAddingNew(true); }}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md font-semibold text-sm"
                    >
                      <Plus size={16} /> New Deal
                    </button>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Contacts */}
                  <div onClick={() => setActiveTab('contacts')} className="bg-gradient-to-br from-blue-50 to-blue-100/60 p-5 rounded-2xl border border-blue-100 cursor-pointer hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600"><Users size={20} /></div>
                      <span className="text-xs font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">Total</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{contacts.length}</p>
                    <p className="text-slate-500 text-sm font-medium mt-1">Contacts</p>
                  </div>
                  {/* Active Deals */}
                  <div onClick={() => setActiveTab('leads')} className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-5 rounded-2xl border border-emerald-100 cursor-pointer hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600"><Briefcase size={20} /></div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{leads.filter(l => l.stage !== 'Closed Won' && l.stage !== 'Closed Lost').length}</p>
                    <p className="text-slate-500 text-sm font-medium mt-1">Active Deals</p>
                  </div>
                  {/* Pipeline Value */}
                  <div onClick={() => setActiveTab('leads')} className="bg-gradient-to-br from-purple-50 to-purple-100/60 p-5 rounded-2xl border border-purple-100 cursor-pointer hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600"><TrendingUp size={20} /></div>
                      <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Pipeline</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">₹{(leads.filter(l => l.stage !== 'Closed Lost').reduce((acc, l) => acc + l.value, 0) / 1000).toFixed(0)}k</p>
                    <p className="text-slate-500 text-sm font-medium mt-1">Pipeline Value</p>
                  </div>
                  {/* Win Rate */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 p-5 rounded-2xl border border-amber-100 cursor-pointer hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600"><Target size={20} /></div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">
                      {leads.filter(l => l.stage === 'Closed Won' || l.stage === 'Closed Lost').length === 0 ? '—' : `${Math.round((leads.filter(l => l.stage === 'Closed Won').length / leads.filter(l => l.stage === 'Closed Won' || l.stage === 'Closed Lost').length) * 100)}%`}
                    </p>
                    <p className="text-slate-500 text-sm font-medium mt-1">Win Rate</p>
                  </div>
                </div>

                {/* Secondary Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Won Deals</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{leads.filter(l => l.stage === 'Closed Won').length}</p>
                    <p className="text-xs text-slate-400 mt-1">₹{(leads.filter(l => l.stage === 'Closed Won').reduce((a, l) => a + l.value, 0) / 1000).toFixed(1)}k closed</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-orange-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Tasks</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{tasks.filter(t => !t.completed).length}</p>
                    <p className="text-xs text-orange-400 font-medium mt-1">
                      {tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length} overdue
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-blue-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Team Members</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{employees.length || 1}</p>
                    <p className="text-xs text-slate-400 mt-1">{employees.filter(e => e.role === 'admin').length || 1} admin(s)</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <ActivityIcon size={16} className="text-indigo-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activities</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{activities.length}</p>
                    <p className="text-xs text-slate-400 mt-1">{activities.filter(a => {
                      const today = new Date(); const d = new Date(a.createdAt);
                      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
                    }).length} today</p>
                  </div>
                </div>

                {/* Pipeline Stage Breakdown & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pipeline Funnel */}
                  <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                      <Layers size={16} className="text-blue-500" /> Pipeline Stages
                    </h3>
                    <div className="space-y-3">
                      {STAGES.map((stage, i) => {
                        const count = leads.filter(l => l.stage === stage).length;
                        const total = leads.length || 1;
                        const pct = Math.round((count / total) * 100);
                        const colors = ['bg-slate-400','bg-blue-400','bg-indigo-500','bg-violet-500','bg-emerald-500','bg-red-400'];
                        return (
                          <div key={stage} className="cursor-pointer" onClick={() => setActiveTab('leads')}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-slate-600">{stage}</span>
                              <span className="text-xs font-bold text-slate-400">{count}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${colors[i]} rounded-full transition-all duration-700`} style={{width: `${pct}%`}} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <History size={16} className="text-purple-500" /> Recent Activity
                      </h3>
                      <button onClick={() => setActiveTab('reports')} className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                      {activities.slice(0, 6).map(act => {
                        const contact = contacts.find(c => c.id === act.contactId);
                        const icons: Record<string, React.ReactNode> = {
                          'Call': <Phone size={14} className="text-blue-500" />,
                          'Inbound Call': <Phone size={14} className="text-green-500" />,
                          'Outbound Call': <Phone size={14} className="text-purple-500" />,
                          'Email': <Mail size={14} className="text-amber-500" />,
                          'Meeting': <Calendar size={14} className="text-indigo-500" />,
                          'Note': <MessageSquare size={14} className="text-slate-400" />,
                        };
                        return (
                          <div key={act.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {icons[act.type] || <ActivityIcon size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 truncate">{act.content}</p>
                              <p className="text-xs text-slate-400">{contact?.name || 'Unknown'} · {format(act.createdAt, 'MMM d, h:mm a')}</p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{act.type}</span>
                          </div>
                        );
                      })}
                      {activities.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <ActivityIcon size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No activities logged yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bug / Issue Log Panel */}
                {bugLogs.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Bug size={16} className="text-red-500" /> System Issue Log
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{bugLogs.filter(b=>b.level==='error').length} errors</span>
                      </h3>
                      <button onClick={() => setBugLogs([])} className="text-xs text-slate-400 hover:text-red-500 transition-colors font-semibold">Clear All</button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {bugLogs.slice(0, 10).map(log => (
                        <div key={log.id} className={`flex items-start gap-3 p-3 rounded-xl text-sm ${
                          log.level === 'error' ? 'bg-red-50 border border-red-100' :
                          log.level === 'warning' ? 'bg-amber-50 border border-amber-100' :
                          'bg-blue-50 border border-blue-100'
                        }`}>
                          <span>{log.level === 'error' ? '🔴' : log.level === 'warning' ? '🟡' : '🔵'}</span>
                          <div className="flex-1">
                            <p className="font-medium text-slate-700">{log.message}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{format(log.timestamp, 'HH:mm:ss')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Widget Panel (the old dashboard widgets, now secondary) */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Access Widgets</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...widgets].sort((a, b) => a.order - b.order).map(widget => renderDashboardWidget(widget))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── TOAST NOTIFICATIONS ─── */}
        <AnimatePresence>
          {notifySuccess && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-200 font-semibold text-sm"
            >
              <CheckCircle2 size={18} /> {notifySuccess}
            </motion.div>
          )}
          {notifyError && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-red-200 font-semibold text-sm"
            >
              <AlertTriangle size={18} /> {notifyError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal / Detail View */}
        <AnimatePresence>
          {isCustomizingFields && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsCustomizingFields(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <Settings size={20} />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900">Manage Custom Fields</h3>
                  </div>
                  <button 
                    onClick={() => setIsCustomizingFields(false)}
                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Add New Field</h4>
                    <form onSubmit={handleAddCustomField} className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Field Label</label>
                        <input name="label" required placeholder="e.g., Birthday, Referral Source" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Type</label>
                        <select name="type" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none">
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Target</label>
                        <select name="target" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none">
                          <option value="contact">Contact</option>
                          <option value="lead">Lead</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-100">
                          Create Custom Field
                        </button>
                      </div>
                    </form>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Existing Fields</h4>
                    <div className="space-y-2 max-h-[200px] overflow-auto pr-2 scrollbar-hide">
                      {customFieldDefinitions.length === 0 ? (
                        <p className="text-center py-8 text-slate-400 text-xs italic">No custom fields defined yet.</p>
                      ) : (
                        customFieldDefinitions.map(field => (
                          <div key={field.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-purple-200 transition-all">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{field.label}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{field.target} • {field.type}</p>
                            </div>
                            <button 
                              onClick={() => handleRemoveCustomField(field.id)}
                              className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={() => setIsCustomizingFields(false)}
                    className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {isCalendarSettingsOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsCalendarSettingsOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Calendar size={20} />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900">Calendar Sync</h3>
                  </div>
                  <button 
                    onClick={() => setIsCalendarSettingsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <p className="text-sm text-slate-500 font-medium">Connect your favorite calendar service to keep your tasks and events in sync.</p>
                  
                  <div className="space-y-4">
                    <div 
                      className={`p-4 rounded-2xl border transition-all ${calendarSyncSettings.service === 'google' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                             <img src="https://www.gstatic.com/images/branding/product/2x/calendar_2020q4_48dp.png" alt="Google" className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">Google Calendar</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Personal or Workspace</p>
                          </div>
                        </div>
                        {calendarSyncSettings.service === 'google' ? (
                          <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-1 rounded-lg border border-blue-100 uppercase tracking-wider">Connected</span>
                        ) : (
                          <button 
                            onClick={() => handleConnectCalendar('google')}
                            className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-2xl border transition-all ${calendarSyncSettings.service === 'outlook' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                             <img src="https://static.overlay-tech.com/assets/26d573d4-6330-4e14-9988-7e108153c306.png" alt="Outlook" className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">Outlook Calendar</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Office 365 or Outlook.com</p>
                          </div>
                        </div>
                        {calendarSyncSettings.service === 'outlook' ? (
                          <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-1 rounded-lg border border-blue-100 uppercase tracking-wider">Connected</span>
                        ) : (
                          <button 
                            onClick={() => handleConnectCalendar('outlook')}
                            className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {calendarSyncSettings.service !== 'none' && (
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last Synced</p>
                          <p className="text-xs font-bold text-slate-600">{calendarSyncSettings.lastSyncedAt ? format(calendarSyncSettings.lastSyncedAt, 'MMM d, h:mm a') : 'Never'}</p>
                        </div>
                        <button 
                          onClick={handleSyncCalendar}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
                        >
                          <TrendingUp size={14} />
                          Sync Now
                        </button>
                      </div>
                      <button 
                        onClick={() => setCalendarSyncSettings({ service: 'none' })}
                        className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all border border-red-50"
                      >
                        Disconnect Service
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={() => setIsCalendarSettingsOpen(false)}
                    className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {isCustomizingDashboard && (

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsCustomizingDashboard(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Layers size={20} />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900">Customize Widgets</h3>
                  </div>
                  <button 
                    onClick={() => setIsCustomizingDashboard(false)}
                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6">
                  <p className="text-sm text-slate-500 mb-6 font-medium">Reorder and toggle dashboard widgets to fit your workflow.</p>
                  <div className="space-y-3">
                    {[...widgets].sort((a, b) => a.order - b.order).map((widget, idx) => (
                      <div 
                        key={widget.id}
                        className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-200 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing">
                            <GripVertical size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{widget.title}</p>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{widget.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            <button 
                              onClick={() => handleMoveWidget(widget.id, 'up')}
                              disabled={idx === 0}
                              className="p-1 hover:bg-white rounded-lg text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button 
                              onClick={() => handleMoveWidget(widget.id, 'down')}
                              disabled={idx === widgets.length - 1}
                              className="p-1 hover:bg-white rounded-lg text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => toggleWidgetVisibility(widget.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${widget.visible ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                          >
                            {widget.visible ? 'Visible' : 'Hidden'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 mt-2">
                  <button 
                    onClick={() => setIsCustomizingDashboard(false)}
                    className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(isAddingNew || selectedContact || selectedLead || selectedAccount || selectedProduct || selectedQuote) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => { if (!isEditing) { setSelectedContact(null); setSelectedLead(null); setSelectedAccount(null); setSelectedProduct(null); setSelectedQuote(null); setIsAddingNew(false); } }}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-8"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-xl text-slate-900">
                    {isAddingNew ? `New ${activeTab.slice(0, -1)}` : isEditing ? 'Edit Record' : 'Record Details'}
                  </h3>
                  <button 
                    onClick={() => { setSelectedContact(null); setSelectedLead(null); setSelectedAccount(null); setSelectedProduct(null); setSelectedQuote(null); setIsAddingNew(false); setIsEditing(false); }}
                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8">
                  {isAddingNew || isEditing ? (
                    <form 
                      onSubmit={(e) => {
                        if (activeTab === 'calendar') {
                          handleSaveTaskOrEvent(e, calendarFormType);
                        } else {
                          handleGlobalSave(e);
                        }
                      }} 
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 gap-6">
                        {activeTab === 'contacts' ? (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                              <input 
                                name="name"
                                required
                                defaultValue={selectedContact?.name}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="John Doe"
                              />
                            </div>
                            <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                               <input 
                                 name="email"
                                 type="email"
                                 required
                                 defaultValue={selectedContact?.email}
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                 placeholder="john@example.com"
                               />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                                 <input 
                                   name="phone"
                                   required
                                   defaultValue={selectedContact?.phone}
                                   className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                   placeholder="+1 (555) 000-0000"
                                 />
                               </div>
                               <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                                 <input 
                                   name="company"
                                   defaultValue={selectedContact?.company}
                                   className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                   placeholder="Acme Corp"
                                 />
                               </div>
                             </div>
                             <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-2">Location / Place</label>
                               <input 
                                 name="location"
                                 defaultValue={selectedContact?.location}
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                 placeholder="City, State"
                               />
                             </div>
                          </>
                        ) : activeTab === 'accounts' ? (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Account Name</label>
                              <input 
                                name="name"
                                required
                                defaultValue={selectedAccount?.name}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="TechFlow Inc."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Industry</label>
                                <input 
                                  name="industry"
                                  defaultValue={selectedAccount?.industry}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                  placeholder="Software"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                                <input 
                                  name="phone"
                                  defaultValue={selectedAccount?.phone}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                  placeholder="+1 (555) 000-0000"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Website</label>
                              <input 
                                name="website"
                                defaultValue={selectedAccount?.website}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="https://example.com"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                              <textarea 
                                name="description"
                                defaultValue={selectedAccount?.description}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                                placeholder="Details about this account..."
                              />
                            </div>
                          </>
                        ) : activeTab === 'products' ? (
                          <>
                            <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
                               <input 
                                 name="name"
                                 required
                                 defaultValue={selectedProduct?.name}
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                 placeholder="CRM Pro License"
                               />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-2">Price (INR)</label>
                                 <input 
                                   name="price"
                                   type="number"
                                   required
                                   defaultValue={selectedProduct?.price}
                                   className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                   placeholder="0.00"
                                 />
                               </div>
                               <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-2">SKU</label>
                                 <input 
                                   name="sku"
                                   defaultValue={selectedProduct?.sku}
                                   className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                   placeholder="PROD-001"
                                 />
                               </div>
                             </div>
                             <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                               <input 
                                 name="category"
                                 defaultValue={selectedProduct?.category}
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                 placeholder="Software"
                               />
                             </div>
                             <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                               <textarea 
                                 name="description"
                                 defaultValue={selectedProduct?.description}
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                                 placeholder="Product details..."
                               />
                             </div>
                          </>
                        ) : activeTab === 'quotes' ? (
                          <>
                            <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-2">Quote Title</label>
                               <input 
                                 name="title"
                                 required
                                 defaultValue={selectedQuote?.title}
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                 placeholder="Project Estimate"
                               />
                             </div>
                             <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Related Lead / Deal</label>
                                <select 
                                  name="leadId"
                                  required
                                  defaultValue={selectedQuote?.leadId}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                >
                                  {leads.map(lead => <option key={lead.id} value={lead.id}>{lead.title}</option>)}
                                </select>
                             </div>
                             <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-2">Total Amount (INR)</label>
                               <input 
                                 name="total"
                                 type="number"
                                 required
                                 defaultValue={selectedQuote?.total}
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                 placeholder="0.00"
                               />
                             </div>
                          </>
                        ) : activeTab === 'leads' ? (
                          <>
                             <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Lead Title</label>
                              <input 
                                name="title"
                                required
                                defaultValue={selectedLead?.title}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Big Deal 2024"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Associated Contact</label>
                              <select 
                                name="contactId"
                                defaultValue={selectedLead?.contactId || ""}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                              >
                                <option value="">Select a contact (optional)</option>
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Value (₹)</label>
                                <input 
                                  name="value"
                                  type="number"
                                  required
                                  defaultValue={selectedLead?.value}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Stage</label>
                                <select 
                                  name="stage"
                                  required
                                  defaultValue={selectedLead?.stage}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                >
                                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
                                <input 
                                  name="contactNumber"
                                  defaultValue={selectedLead?.contactNumber}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                  placeholder="+91 9876543210"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Location</label>
                                <input 
                                  name="customerLocation"
                                  defaultValue={selectedLead?.customerLocation}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                  placeholder="Mumbai, Maharashtra"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned To (Employee)</label>
                                <input 
                                  name="assignedTo"
                                  defaultValue={selectedLead?.assignedTo}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                  placeholder="Employee Name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned By (Manager)</label>
                                <input 
                                  name="assignedBy"
                                  defaultValue={selectedLead?.assignedBy}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                  placeholder="Manager Name"
                                />
                              </div>
                            </div>
                            
                            {/* Render Custom Fields for Lead */}
                            {customFieldDefinitions.filter(d => d.target === 'lead').map(field => (
                              <div key={field.id}>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">{field.label}</label>
                                <input 
                                  name={`custom_${field.id}`}
                                  type={field.type}
                                  defaultValue={selectedLead?.customFields?.[field.id]}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            <div className="flex bg-slate-100 p-1 rounded-xl mb-2">
                              <button 
                                type="button"
                                onClick={() => setCalendarFormType('event')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${calendarFormType === 'event' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                              >
                                Event
                              </button>
                              <button 
                                type="button"
                                onClick={() => setCalendarFormType('task')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${calendarFormType === 'task' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                              >
                                Task
                              </button>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                {calendarFormType === 'event' ? 'Event Title' : 'Task Title'}
                              </label>
                              <input 
                                name="title"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder={calendarFormType === 'event' ? "Project Kickoff" : "Follow up with client"}
                              />
                            </div>

                            {calendarFormType === 'event' ? (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                                  <input 
                                    name="startTime"
                                    type="datetime-local"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
                                  <input 
                                    name="endTime"
                                    type="datetime-local"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                                <input 
                                  name="dueDate"
                                  type="date"
                                  required
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Related To Type</label>
                                <select name="relatedToType" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                                  <option value="contact">Contact</option>
                                  <option value="lead">Lead</option>
                                </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Related Record</label>
                              <select name="relatedToId" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                {leads.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                              <textarea name="description" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" rows={3}></textarea>
                            </div>
                          </>
                        )
}
                      </div>
                      <div className="flex space-x-3 pt-6">
                        <button 
                          type="submit"
                          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-md"
                        >
                          <Save size={20} />
                          <span>{isAddingNew ? 'Create' : 'Save Changes'}</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setIsAddingNew(false); setIsEditing(false); }}
                          className="px-6 py-3 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 transition-all text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (activeTab === 'contacts' && selectedContact) || (activeTab === 'leads' && selectedLead) || (activeTab === 'accounts' && selectedAccount) || (activeTab === 'products' && selectedProduct) || (activeTab === 'quotes' && selectedQuote) ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="flex items-center gap-6">
                         <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center font-bold text-2xl shadow-inner border ${
                           activeTab === 'contacts' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                           activeTab === 'leads' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                           activeTab === 'accounts' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                           'bg-slate-50 text-slate-600 border-slate-100'
                         }`}>
                            {activeTab === 'contacts' ? selectedContact?.name[0] : 
                             activeTab === 'leads' ? <Star size={32} /> :
                             activeTab === 'accounts' ? <Building2 size={32} /> :
                             activeTab === 'products' ? <Package size={32} /> :
                             <FileText size={32} />}
                         </div>
                         <div>
                            <h3 className="text-2xl font-bold text-slate-900">
                               {activeTab === 'contacts' ? selectedContact?.name :
                                activeTab === 'leads' ? selectedLead?.title :
                                activeTab === 'accounts' ? selectedAccount?.name :
                                activeTab === 'products' ? selectedProduct?.name :
                                selectedQuote?.title}
                            </h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                               {activeTab.slice(0, -1)} Record
                            </p>
                         </div>
                      </div>

                      <div className="space-y-6">
                        {activeTab === 'leads' && selectedLead && (
                         <div className="flex gap-4">
                           <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex-1">
                               <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Assigned Employee</p>
                               <p className="text-sm font-semibold text-emerald-800">{selectedLead.assignedTo || 'Unassigned'}</p>
                           </div>
                           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex-1">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Manager</p>
                               <p className="text-sm font-semibold text-slate-700">{selectedLead.assignedBy || 'None'}</p>
                           </div>
                         </div>
                       )}

                        {activeTab === 'contacts' && selectedContact && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                              <p className="text-sm font-semibold text-slate-700">{selectedContact.email}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                              <p className="text-sm font-semibold text-slate-700">{selectedContact.phone}</p>
                            </div>
                          </div>
                        )}

                        {(activeTab === 'contacts' || activeTab === 'leads') && (
                          <div className="pt-6 border-t border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <MessageSquare size={18} className="text-blue-500" />
                              Timeline & Activities
                            </h4>

                            {/* Logging Form */}
                            <form 
                              onSubmit={(e) => handleSaveActivity(e, activeTab === 'contacts' ? 'contact' : 'lead')} 
                              className="mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4"
                            >
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Activity Type</label>
                                  <select 
                                    name="type" 
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="Note">Note</option>
                                    <option value="Inbound Call">Inbound Call</option>
                                    <option value="Outbound Call">Outbound Call</option>
                                    <option value="Email">Email</option>
                                    <option value="Meeting">Meeting</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Duration (Min)</label>
                                  <input 
                                    name="duration"
                                    type="number"
                                    placeholder="Optional"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notes / Content</label>
                                <textarea 
                                  name="content"
                                  required
                                  rows={2}
                                  placeholder="What happened?"
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                              </div>
                              <button className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md">
                                Log Activity
                              </button>
                            </form>

                            {/* Activity Feed */}
                            <div className="space-y-4 max-h-[400px] overflow-auto pr-2 scrollbar-hide">
                              {activities
                                .filter(a => 
                                  activeTab === 'contacts' 
                                    ? a.contactId === selectedContact?.id 
                                    : a.leadId === selectedLead?.id
                                )
                                .length === 0 ? (
                                <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                  <Ghost size={32} className="text-slate-200 mx-auto mb-2" />
                                  <p className="text-slate-400 text-xs italic">No activities logged yet.</p>
                                </div>
                              ) : (
                                activities
                                  .filter(a => 
                                    activeTab === 'contacts' 
                                      ? a.contactId === selectedContact?.id 
                                      : a.leadId === selectedLead?.id
                                  )
                                  .map(activity => (
                                    <div key={activity.id} className="flex gap-4 group relative">
                                      <div className="flex flex-col items-center">
                                        <div className={`p-2 rounded-xl border ${
                                          activity.type === 'Inbound Call' || activity.type === 'Outbound Call' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                          activity.type === 'Email' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                          activity.type === 'Meeting' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                          'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                          {activity.type === 'Inbound Call' && <Phone size={14} className="rotate-0" />}
                                          {activity.type === 'Outbound Call' && <Phone size={14} className="rotate-180" />}
                                          {activity.type === 'Email' && <Mail size={14} />}
                                          {activity.type === 'Meeting' && <Calendar size={14} />}
                                          {activity.type === 'Note' && <MessageSquare size={14} />}
                                        </div>
                                        <div className="w-[1px] flex-1 bg-slate-100 my-1 group-last:hidden" />
                                      </div>
                                      <div className="pb-6 flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-800">{activity.type}</span>
                                            {activity.duration && (
                                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                                                {activity.duration} MIN
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] text-slate-400 font-medium">{format(activity.createdAt, 'MMM d, h:mm a')}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-50 shadow-sm">{activity.content}</p>
                                        <button 
                                          onClick={() => handleRemoveActivity(activity.id)}
                                          className="absolute -right-2 top-0 p-1.5 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                              )}
                            </div>
                          </div>
                        )}

                        {activeTab === 'accounts' && selectedAccount && (
                          <div className="space-y-4">
                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Industry</p>
                                <p className="text-sm font-semibold text-slate-700">{selectedAccount.industry}</p>
                             </div>
                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description</p>
                                <p className="text-sm text-slate-600 leading-relaxed">{selectedAccount.description}</p>
                             </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                         <button onClick={() => setIsEditing(true)} className="flex-1 bg-white border border-slate-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-slate-700 shadow-sm font-mono text-[10px] uppercase tracking-widest">
                            <Edit2 size={16} />
                            Edit Detail
                         </button>
                         <button onClick={() => { setIsAddingNew(false); setIsEditing(false); setSelectedContact(null); setSelectedLead(null); setSelectedAccount(null); setSelectedProduct(null); setSelectedQuote(null); }} className="px-6 py-3 rounded-xl border border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-all font-mono text-[10px] uppercase tracking-widest">
                            Close
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-4">
                       <div className="p-4 bg-slate-50 rounded-full">
                          <Ghost size={40} className="text-slate-200" />
                       </div>
                       <p className="font-bold">Select a record to view details</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── DELETE CONFIRMATION MODAL ─── */}
        <AnimatePresence>
          {deleteModal?.open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
              onClick={() => setDeleteModal(null)}
            >
              <motion.div
                initial={{ scale: 0.85, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.85, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Trash2 size={24} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Confirm Delete</h3>
                    <p className="text-sm text-slate-500 mt-0.5">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-slate-600 bg-slate-50 rounded-xl p-4 text-sm font-medium mb-6">
                  Are you sure you want to permanently delete <span className="font-bold text-slate-800">{deleteModal.label || 'this record'}</span>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
