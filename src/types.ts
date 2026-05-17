/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  customFields?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Closed Won' | 'Closed Lost';

export interface Lead {
  id: string;
  contactId: string; // References a Contact
  title: string;
  value: number;
  stage: LeadStage;
  contactNumber?: string;
  customerLocation?: string;
  assignedTo?: string; // Employee ID or Name
  assignedBy?: string; // Manager Name or ID
  assignmentHistory?: {
    assignedTo: string;
    assignedBy: string;
    timestamp: number;
  }[];
  customFields?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: number;
  completed: boolean;
  relatedToType: 'contact' | 'lead';
  relatedToId: string;
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  remoteId?: string; // ID for remote calendar (Google/Outlook)
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  relatedToType: 'contact' | 'lead';
  relatedToId: string;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'follow_up' | 'stage_stagnant' | 'system';
  read: boolean;
  relatedToType: 'contact' | 'lead';
  relatedToId: string;
  createdAt: number;
}

export type ActivityType = 'Note' | 'Call' | 'Inbound Call' | 'Outbound Call' | 'Email' | 'Meeting';

export interface Activity {
  id: string;
  contactId: string;
  leadId?: string;
  type: ActivityType;
  content: string;
  duration?: number; // duration in minutes
  createdAt: number;
}

export type WidgetType = 'contacts' | 'deals' | 'tasks' | 'revenue' | 'notifications' | 'tickets' | 'projects' | 'invoices' | 'whatsapp' | 'marketing' | 'settings';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  visible: boolean;
  order: number;
}

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date';
  target: 'contact' | 'lead';
}

export interface Quote {
  id: string;
  title: string;
  leadId: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
  createdAt: number;
  updatedAt: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface CalendarSyncSettings {
  service: 'google' | 'outlook' | 'none';
  tokens?: any;
  lastSyncedAt?: number;
}

export interface SupportTicket {
  id: string;
  leadId: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: number;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: number;
  completed: boolean;
  createdAt: number;
}

export interface Project {
  id: string;
  leadId?: string; // Optional, can be linked to a lead (deal)
  accountId?: string; // Optional, can be linked to an account
  name: string;
  description: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  milestones: Milestone[];
  createdAt: number;
  updatedAt: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  tax?: string; // e.g., "GST(5%)", "GST(18%)", or ""
}

export interface Invoice {
  id: string;
  projectId: string;
  clientName: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  gstRate: number; // e.g., 18 for 18% (fallback or global rate)
  gstAmount: number;
  total: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  dueDate: number;
  createdAt: number;
  sellerDetails?: {
    name: string;
    address: string;
    email: string;
    phone: string;
    vat_tin?: string;
  };
  taxesSummary?: { label: string; amount: number }[];
  currency?: string;
}

export interface WhatsAppMessage {
  id: string;
  contactId: string;
  direction: 'Inbound' | 'Outbound';
  content: string;
  createdAt: number;
}

