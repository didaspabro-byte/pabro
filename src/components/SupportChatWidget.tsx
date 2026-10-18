import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Phone,
  HelpCircle,
  CheckCircle2,
  Clock,
  User,
  Mail,
  FileText,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportTicket, User as UserType } from '../types';

interface SupportChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserType | null;
}

export default function SupportChatWidget({
  isOpen,
  onClose,
  currentUser
}: SupportChatWidgetProps) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'ticket' | 'faq'>('whatsapp');

  // WhatsApp configuration
  const WHATSAPP_NUMBER = '256756351236';
  const DISPLAY_PHONE = '+256 756 351 236';

  const [customWaMsg, setCustomWaMsg] = useState('');

  // Support ticket form state
  const [ticketName, setTicketName] = useState(currentUser?.name || '');
  const [ticketEmail, setTicketEmail] = useState(currentUser?.email || '');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  const quickWaTemplates = [
    { label: '📦 Order Status Inquiry', text: 'Hi PrimeStockUG Support! I would like to inquire about the status of my recent order.' },
    { label: '💳 Payment or Billing Issue', text: 'Hello! I need help regarding a payment or billing question on my checkout.' },
    { label: '🛍️ Product & Sizing Advice', text: 'Hi! Could you help me choose the right product size or spec for my needs?' },
    { label: '🔄 Returns & Exchanges', text: 'Hello Support, I need assistance with initiating a return or exchange.' }
  ];

  const handleOpenWhatsApp = (messageText: string) => {
    const encodedText = encodeURIComponent(messageText || 'Hi PrimeStockUG Support, I need help with my shopping.');
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    try {
      const opened = window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        window.location.assign(waUrl);
      }
    } catch {
      window.location.assign(waUrl);
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName.trim() || !ticketEmail.trim() || !ticketMessage.trim()) return;

    const newTicket: SupportTicket = {
      id: `TICK-${Math.floor(100000 + Math.random() * 900000)}`,
      name: ticketName.trim(),
      email: ticketEmail.trim(),
      orderId: ticketOrderId.trim() || undefined,
      subject: ticketSubject.trim() || 'General Customer Support Request',
      message: ticketMessage.trim(),
      timestamp: new Date().toLocaleString([], {
        dateStyle: 'short',
        timeStyle: 'short'
      }),
      status: 'Open',
      priority: 'Medium'
    };

    // Save to localStorage
    try {
      const stored = localStorage.getItem('aura_shop_support_tickets');
      const tickets: SupportTicket[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('aura_shop_support_tickets', JSON.stringify([newTicket, ...tickets]));
    } catch (e) {
      console.error('Failed to save support ticket:', e);
    }

    setSubmittedTicket(newTicket);
  };

  const resetTicketForm = () => {
    setSubmittedTicket(null);
    setTicketSubject('');
    setTicketMessage('');
    setTicketOrderId('');
  };

  const faqs = [
    {
      q: 'How do I track my delivery status in real-time?',
      a: 'You can track any order by clicking the "Track Order" button in the navigation bar or going to your Account Activity tab. Each order features a live milestone progress bar and courier tracking number.'
    },
    {
      q: 'What is your return & refund policy?',
      a: 'We offer a 30-day hassle-free return window for all items in original condition. Refunds are issued to your original payment method within 2-3 business days after arrival at our fulfillment center.'
    },
    {
      q: 'What shipping options are available?',
      a: 'We offer Priority Express Air (2-3 days) and Standard Ground Freight (4-6 days). Free express shipping applies on all orders above $100.'
    },
    {
      q: 'Are custom currency conversions exact?',
      a: 'Yes, our store supports real-time multi-currency conversions across USD, EUR, GBP, JPY, CAD, and AUD based on daily exchange rates.'
    }
  ];

  if (!isOpen) return null;

  return (
    <div
      id="support-chat-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn font-sans"
    >
      <motion.div
        className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
                <Headphones className="h-5 w-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Support & WhatsApp Concierge</h3>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Online 🟢
                </span>
              </div>
              <p className="text-xs text-slate-300">Direct response within minutes</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp Direct</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ticket')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ticket'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Direct Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Quick FAQ</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-5">
              {/* WhatsApp Agent Banner */}
              <div className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                    WA
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      PrimeStockUG Official WhatsApp
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Direct line: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{DISPLAY_PHONE}</span>
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/60 px-2.5 py-1 rounded-full">
                  <Clock className="h-3 w-3" />
                  <span>~2 min reply</span>
                </div>
              </div>

              {/* Quick Template Buttons */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Select a Topic to Pre-Fill WhatsApp Message:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickWaTemplates.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleOpenWhatsApp(tmpl.text)}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all text-left group cursor-pointer"
                    >
                      <span className="block text-xs font-extrabold text-slate-900 dark:text-white">
                        {tmpl.label}
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                        "{tmpl.text}"
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message input */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Or Write a Custom Message:
                </label>
                <textarea
                  rows={3}
                  value={customWaMsg}
                  onChange={(e) => setCustomWaMsg(e.target.value)}
                  placeholder="Type your message or question here..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp(customWaMsg)}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Start Chat on WhatsApp</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT TICKET */}
          {activeTab === 'ticket' && (
            <div>
              {submittedTicket ? (
                <div className="text-center py-6 space-y-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Support Ticket Submitted!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Ticket Reference Code:{' '}
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {submittedTicket.id}
                      </span>
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 max-w-md mx-auto">
                    <p className="text-slate-700 dark:text-slate-300">
                      <b>Subject:</b> {submittedTicket.subject}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      <b>Response Sent To:</b> {submittedTicket.email}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
                      Our concierge team will reply to your inquiry within 2 hours.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetTicketForm}
                    className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
                  >
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={ticketName}
                        onChange={(e) => setTicketName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                        Order ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={ticketOrderId}
                        onChange={(e) => setTicketOrderId(e.target.value)}
                        placeholder="e.g. ORD-842109"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                        Topic / Subject
                      </label>
                      <input
                        type="text"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Brief title of your request"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                      Message Details *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Provide details about your question or issue..."
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3.5 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Support Ticket</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Frequently Asked Support Questions
              </span>
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                >
                  <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{faq.q}</span>
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-5 font-normal">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
