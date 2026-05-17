import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Download, Eye, Trash2, X, FileText, Check } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../supabase';

interface Props {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  orgId?: string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export default function InvoicesView({ invoices, setInvoices, orgId, showSuccess, showError }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Seller Details States
  const [sellerName, setSellerName] = useState('ABC Seller');
  const [sellerAddress, setSellerAddress] = useState('A 85, TTC Ind, Mumbai');
  const [sellerEmail, setSellerEmail] = useState('abcemail@gmail.com');
  const [sellerPhone, setSellerPhone] = useState('+913120000000');
  const [sellerVatTin, setSellerVatTin] = useState('VAT TIN 01234567891V');

  // Buyer Details States
  const [clientName, setClientName] = useState('');
  const [buyerCompany, setBuyerCompany] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Meta States
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0, tax: '' }
  ]);

  const getCurrencySymbol = (curr?: string) => {
    switch (curr) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'INR':
      default: return '₹';
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem | 'tax', value: any) => {
    const updated = [...items];
    const item = updated[index];
    if (field === 'description') {
      item.description = value;
    } else if (field === 'tax') {
      item.tax = value;
    } else {
      const numVal = Number(value) || 0;
      if (field === 'quantity') item.quantity = numVal;
      if (field === 'rate') item.rate = numVal;
      item.amount = item.quantity * item.rate;
    }
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0, tax: '' }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const loadTemplate = (templateName: string) => {
    if (templateName === 'Blank') {
      setClientName('');
      setBuyerCompany('');
      setClientAddress('');
      setSellerName('ABC Seller');
      setSellerAddress('A 85, TTC Ind, Mumbai');
      setSellerEmail('abcemail@gmail.com');
      setSellerPhone('+913120000000');
      setSellerVatTin('VAT TIN 01234567891V');
      setCurrency('INR');
      setItems([{ description: '', quantity: 1, rate: 0, amount: 0, tax: '' }]);
    } else if (templateName === 'GST-Template') {
      setClientName('XYZ Buyer');
      setBuyerCompany('ABC Company');
      setClientAddress('31 Vasant Est., Sakinaka\nIndia\nxyzemail@gmail.com');
      setSellerName('ABC Seller');
      setSellerAddress('A 85, TTC Ind, Mumbai');
      setSellerEmail('abcemail@gmail.com');
      setSellerPhone('+913120000000');
      setSellerVatTin('VAT TIN 01234567891V');
      setCurrency('INR');
      setItems([
        { description: 'Services, Products & Goods | Domestic', quantity: 1, rate: 1500, tax: 'GST(5%)', amount: 1500 },
        { description: 'Services, Products & Goods | Domestic', quantity: 1, rate: 1300, tax: 'GST(12%)', amount: 1300 },
        { description: 'Services, Products & Goods | Domestic', quantity: 1, rate: 700, tax: 'GST(18%)', amount: 700 },
        { description: 'Services, Products & Goods | Export', quantity: 1, rate: 8000, tax: '', amount: 8000 },
        { description: 'Vice Goods: Liquor, Tobacco', quantity: 1, rate: 5000, tax: 'GST(28%)', amount: 5000 },
        { description: 'Luxury Goods: Gold, Jewellery', quantity: 1, rate: 30000, tax: 'GST(1%)', amount: 30000 }
      ]);
    }
  };

  const calculateTaxesSummary = (itemsList: InvoiceItem[]) => {
    const summary: Record<string, number> = {};
    itemsList.forEach(item => {
      if (item.tax && item.tax.startsWith('GST(')) {
        const match = item.tax.match(/GST\((\d+)%\)/);
        if (match) {
          const rate = parseInt(match[1]);
          const taxAmt = Math.round((item.amount * rate) / 100);
          summary[item.tax] = (summary[item.tax] || 0) + taxAmt;
        }
      }
    });
    return Object.entries(summary).map(([label, amount]) => ({ label, amount }));
  };

  const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
  const taxesSummary = calculateTaxesSummary(items);
  const gstAmount = taxesSummary.reduce((acc, t) => acc + t.amount, 0);
  const total = subtotal + gstAmount;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      showError('Please provide a client name.');
      return;
    }
    const newInvoice: Invoice = {
      id: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      projectId: '',
      clientName,
      clientAddress,
      items,
      subtotal,
      gstRate: 18,
      gstAmount,
      total,
      status: 'Pending',
      dueDate: dueDate ? new Date(dueDate).getTime() : Date.now() + 30 * 86400000,
      createdAt: Date.now(),
      sellerDetails: {
        name: sellerName,
        address: sellerAddress,
        email: sellerEmail,
        phone: sellerPhone,
        vat_tin: sellerVatTin
      },
      taxesSummary,
      currency
    };

    try {
      const { error } = await supabase.from('invoices').insert([{
        id: crypto.randomUUID(),
        org_id: orgId || 'fb85fdf2-f961-48c7-ba2b-36fcb497b60b',
        invoice_number: newInvoice.id,
        place_of_supply: newInvoice.clientName,
        notes: JSON.stringify({
          clientAddress: newInvoice.clientAddress,
          sellerDetails: newInvoice.sellerDetails,
          taxesSummary: newInvoice.taxesSummary,
          currency: newInvoice.currency,
          buyerCompany
        }),
        line_items: newInvoice.items,
        subtotal: newInvoice.subtotal,
        taxable_amount: newInvoice.subtotal,
        igst_total: newInvoice.gstAmount,
        grand_total: newInvoice.total,
        status: newInvoice.status.toLowerCase(),
        due_date: new Date(newInvoice.dueDate).toISOString().split('T')[0],
      }]);

      if (error) throw error;
      setInvoices(prev => [newInvoice, ...prev]);
      setIsAdding(false);
      showSuccess('Invoice created successfully!');
      // Reset Form
      setClientName('');
      setBuyerCompany('');
      setClientAddress('');
      setItems([{ description: '', quantity: 1, rate: 0, amount: 0, tax: '' }]);
    } catch (err: any) {
      showError(`Failed to save invoice: ${err.message}`);
    }
  };

  const toggleInvoiceStatus = async (invoice: Invoice) => {
    const newStatus = invoice.status === 'Paid' ? 'Pending' : 'Paid';
    try {
      const { error } = await supabase.from('invoices').update({ status: newStatus.toLowerCase() }).eq('invoice_number', invoice.id);
      if (error) throw error;
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, status: newStatus } : inv));
      showSuccess(`Invoice marked as ${newStatus}`);
    } catch (err: any) {
      showError(`Failed to update invoice: ${err.message}`);
    }
  };

  const downloadPDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    const symbol = getCurrencySymbol(invoice.currency);

    // Premium Slate Header Banner
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 38, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(invoice.sellerDetails?.name || "ABC Seller", 15, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(invoice.sellerDetails?.vat_tin ? `GSTIN/TIN: ${invoice.sellerDetails.vat_tin}` : "", 15, 30);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TAX INVOICE", 195, 20, { align: 'right' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`# ${invoice.id}`, 195, 28, { align: 'right' });

    // Reset color to slate-900
    doc.setTextColor(15, 23, 42);

    // Buyer Seller columns
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SELLER (FROM):", 15, 52);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(invoice.sellerDetails?.name || "ABC Seller", 15, 58);
    const sellerAddrSplit = doc.splitTextToSize(invoice.sellerDetails?.address || "A 85, TTC Ind, Mumbai", 80);
    doc.text(sellerAddrSplit, 15, 64);
    doc.text(`Email: ${invoice.sellerDetails?.email || ""}`, 15, 76);
    doc.text(`Phone: ${invoice.sellerDetails?.phone || ""}`, 15, 81);

    doc.setFont("helvetica", "bold");
    doc.text("BUYER (TO):", 115, 52);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.clientName, 115, 58);
    const clientAddrSplit = doc.splitTextToSize(invoice.clientAddress || "", 80);
    doc.text(clientAddrSplit, 115, 64);

    // Metadata details
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 90, 180, 15, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.rect(15, 90, 180, 15);

    doc.setFont("helvetica", "bold");
    doc.text("Date of Issue:", 20, 99);
    doc.setFont("helvetica", "normal");
    doc.text(format(invoice.createdAt, 'dd MMM yyyy'), 48, 99);

    doc.setFont("helvetica", "bold");
    doc.text("Due Date:", 120, 99);
    doc.setFont("helvetica", "normal");
    doc.text(format(invoice.dueDate, 'dd MMM yyyy'), 145, 99);

    // Table
    (doc as any).autoTable({
      startY: 112,
      head: [['Item Description', 'Tax Bracket', 'Qty', 'Unit Rate', 'Amount']],
      body: invoice.items.map(item => [
        item.description, 
        item.tax || "0% Exempt", 
        item.quantity, 
        `${symbol}${item.rate.toLocaleString()}`, 
        `${symbol}${item.amount.toLocaleString()}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 9 },
    });

    let finalY = (doc as any).lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 125, finalY);
    doc.text(`${symbol}${invoice.subtotal.toLocaleString()}`, 195, finalY, { align: 'right' });

    let currentY = finalY;
    if (Array.isArray(invoice.taxesSummary) && invoice.taxesSummary.length > 0) {
      invoice.taxesSummary.forEach(t => {
        currentY += 6;
        doc.text(`${t.label}:`, 125, currentY);
        doc.text(`${symbol}${t.amount.toLocaleString()}`, 195, currentY, { align: 'right' });
      });
    } else {
      currentY += 6;
      doc.text(`GST (${invoice.gstRate}%):`, 125, currentY);
      doc.text(`${symbol}${invoice.gstAmount.toLocaleString()}`, 195, currentY, { align: 'right' });
    }

    currentY += 10;
    doc.setFillColor(30, 41, 59);
    doc.rect(120, currentY - 5, 80, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Total Amount Due:", 125, currentY + 1);
    doc.text(`${symbol}${invoice.total.toLocaleString()}`, 195, currentY + 1, { align: 'right' });

    doc.save(`invoice_${invoice.id}.pdf`);
    showSuccess('PDF downloaded successfully!');
  };

  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((acc, i) => acc + i.total, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500 text-sm">Generate itemized GST tax invoices, load templates, track status, and export PDF</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md">
          <Plus size={18} /> New GST Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Total Collected</p>
          <h3 className="text-2xl font-black text-emerald-800 mt-1">₹{totalPaid.toLocaleString()}</h3>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Total Pending</p>
          <h3 className="text-2xl font-black text-amber-800 mt-1">₹{totalPending.toLocaleString()}</h3>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Total Invoiced</p>
          <h3 className="text-2xl font-black text-blue-800 mt-1">₹{(totalPaid + totalPending).toLocaleString()}</h3>
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-700 text-sm">All Invoices ({invoices.length})</h3>
        </div>
        {invoices.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            <FileText size={48} className="mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="font-semibold text-sm">No invoices found. Generate one now!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 font-semibold text-slate-600 text-sm">Invoice ID</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm">Client</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm">Due Date</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm">Amount</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm">Status</th>
                  <th className="p-4 text-right font-semibold text-slate-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{invoice.id}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-700 text-sm">{invoice.clientName}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {format(invoice.dueDate, 'dd MMM yyyy')}
                    </td>
                    <td className="p-4 font-bold text-slate-800 text-sm">{getCurrencySymbol(invoice.currency)}{invoice.total.toLocaleString()}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleInvoiceStatus(invoice)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                          invoice.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {invoice.status === 'Paid' && <Check size={12} />}
                        {invoice.status}
                      </button>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => setSelectedInvoice(invoice)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl" title="View details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => downloadPDF(invoice)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl" title="Download PDF">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedInvoice.id}</h3>
                  <p className="text-xs text-slate-400">Created: {format(selectedInvoice.createdAt, 'dd MMM yyyy')}</p>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>

              {/* Side by side Billing Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seller details</p>
                  <p className="font-semibold text-slate-800 text-sm mt-1">{selectedInvoice.sellerDetails?.name || "ABC Seller"}</p>
                  <p className="text-xs text-slate-500 whitespace-pre-line mt-1">{selectedInvoice.sellerDetails?.address || "A 85, TTC Ind, Mumbai"}</p>
                  <p className="text-xs text-slate-400 mt-1">GSTIN: {selectedInvoice.sellerDetails?.vat_tin || "VAT TIN 01234567891V"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client details</p>
                  <p className="font-semibold text-slate-800 text-sm mt-1">{selectedInvoice.clientName}</p>
                  <p className="text-xs text-slate-500 whitespace-pre-line mt-1">{selectedInvoice.clientAddress}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden mb-6">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-600">
                      <th className="p-3">Description</th>
                      <th className="p-3">Tax</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Rate</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-slate-700">{item.description}</td>
                        <td className="p-3 text-slate-500 text-xs">{item.tax || '0% Exempt'}</td>
                        <td className="p-3 text-center text-slate-500">{item.quantity}</td>
                        <td className="p-3 text-right text-slate-500">{getCurrencySymbol(selectedInvoice.currency)}{item.rate.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-slate-800">{getCurrencySymbol(selectedInvoice.currency)}{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="w-64 ml-auto space-y-2 text-sm pt-4">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{getCurrencySymbol(selectedInvoice.currency)}{selectedInvoice.subtotal.toLocaleString()}</span>
                </div>

                {Array.isArray(selectedInvoice.taxesSummary) && selectedInvoice.taxesSummary.length > 0 ? (
                  selectedInvoice.taxesSummary.map((t, idx) => (
                    <div key={idx} className="flex justify-between text-slate-500">
                      <span>{t.label}:</span>
                      <span>{getCurrencySymbol(selectedInvoice.currency)}{t.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-slate-500">
                    <span>GST ({selectedInvoice.gstRate}%):</span>
                    <span>{getCurrencySymbol(selectedInvoice.currency)}{selectedInvoice.gstAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Amount:</span>
                  <span>{getCurrencySymbol(selectedInvoice.currency)}{selectedInvoice.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => downloadPDF(selectedInvoice)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                >
                  <Download size={18} /> Download Invoice PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Invoice Modal */}
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
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">New Tax Invoice</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>

              {/* Template Quick Loader Carousel */}
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Invoice Templates</p>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => loadTemplate('Blank')}
                    className="flex-shrink-0 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all flex items-center gap-2"
                  >
                    <FileText size={14} className="text-slate-400" /> Blank Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => loadTemplate('GST-Template')}
                    className="flex-shrink-0 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200/50 transition-all flex items-center gap-2"
                  >
                    <Check size={14} className="text-blue-600" /> Indian GST Template
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-6">
                {/* 2-Column Seller / Buyer Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Seller Configuration */}
                  <div className="space-y-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/80">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Your Details (Seller)</h4>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Company / Seller Name</label>
                      <input
                        required
                        value={sellerName}
                        onChange={e => setSellerName(e.target.value)}
                        placeholder="ABC Seller"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">VAT TIN / GSTIN</label>
                      <input
                        required
                        value={sellerVatTin}
                        onChange={e => setSellerVatTin(e.target.value)}
                        placeholder="VAT TIN 01234567891V"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Seller Address</label>
                      <textarea
                        required
                        value={sellerAddress}
                        onChange={e => setSellerAddress(e.target.value)}
                        rows={2}
                        placeholder="A 85, TTC Ind, Mumbai"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={sellerEmail}
                          onChange={e => setSellerEmail(e.target.value)}
                          placeholder="seller@gmail.com"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
                        <input
                          required
                          value={sellerPhone}
                          onChange={e => setSellerPhone(e.target.value)}
                          placeholder="+913120000000"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buyer Configuration */}
                  <div className="space-y-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/80">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Client Details (Buyer)</h4>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Buyer Name</label>
                      <input
                        required
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        placeholder="XYZ Buyer"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Buyer Company</label>
                      <input
                        required
                        value={buyerCompany}
                        onChange={e => setBuyerCompany(e.target.value)}
                        placeholder="ABC Company"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Billing Address & Meta Details</label>
                      <textarea
                        required
                        value={clientAddress}
                        onChange={e => setClientAddress(e.target.value)}
                        rows={2}
                        placeholder="31 Vasant Est., Sakinaka&#10;India&#10;xyzemail@gmail.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Due Date</label>
                        <input
                          type="date"
                          required
                          value={dueDate}
                          onChange={e => setDueDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Currency</label>
                        <select
                          value={currency}
                          onChange={e => setCurrency(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white font-semibold text-slate-700"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Dynamic Inputs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-800">Invoice Items & GST Rates</h4>
                    <button type="button" onClick={addItemRow} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                      <Plus size={14} /> Add Item Row
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-50/30 p-4 rounded-2xl border border-slate-100 relative">
                        <input
                          required
                          value={item.description}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Item Description"
                          className="w-full md:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                        <div className="flex gap-2 w-full md:w-auto items-center flex-wrap md:flex-nowrap">
                          {/* Row specific GST bracket selection */}
                          <select
                            value={item.tax || ''}
                            onChange={e => handleItemChange(idx, 'tax', e.target.value)}
                            className="px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white text-slate-600"
                          >
                            <option value="">0% (Exempt)</option>
                            <option value="GST(1%)">GST (1%)</option>
                            <option value="GST(5%)">GST (5%)</option>
                            <option value="GST(12%)">GST (12%)</option>
                            <option value="GST(18%)">GST (18%)</option>
                            <option value="GST(28%)">GST (28%)</option>
                          </select>

                          <input
                            type="number"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-16 px-2 py-2.5 rounded-xl border border-slate-200 text-sm text-center outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                          <input
                            type="number"
                            required
                            min="0"
                            value={item.rate}
                            onChange={e => handleItemChange(idx, 'rate', e.target.value)}
                            placeholder="Rate"
                            className="w-24 px-2 py-2.5 rounded-xl border border-slate-200 text-sm text-right outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                          <span className="w-24 text-right font-bold text-slate-700 text-sm ml-2">{getCurrencySymbol(currency)}{item.amount.toLocaleString()}</span>
                          <button type="button" onClick={() => removeItemRow(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl ml-auto md:ml-0">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Summary Cards & Taxes Bracket Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taxes breakdown</p>
                    {taxesSummary.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No taxable GST items added.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {taxesSummary.map((t, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-600">{t.label}</span>
                            <span className="font-black text-slate-800">{getCurrencySymbol(currency)}{t.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-full ml-auto space-y-2 text-sm text-right">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-slate-700">{getCurrencySymbol(currency)}{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Total GST Amount:</span>
                      <span className="font-semibold text-slate-700">{getCurrencySymbol(currency)}{gstAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-black text-base text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total Invoice Amount:</span>
                      <span>{getCurrencySymbol(currency)}{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200">
                  Generate GST Invoice & Sync
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
