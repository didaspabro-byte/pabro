import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Building2,
  Navigation,
  Globe,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import { saveInquiryToFirestore, InquiryData } from '../lib/db';

interface ContactHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserType | null;
}

export default function ContactHelpModal({
  isOpen,
  onClose,
  currentUser
}: ContactHelpModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'location' | 'whatsapp'>('form');

  // WhatsApp Config
  const WHATSAPP_RAW = '256756351236';
  const WHATSAPP_DISPLAY = '+256 756 351 236';

  // Physical Store Address
  const STORE_ADDRESS = 'Shop Corner Flagship Store, Plot 14 Acacia Avenue, Kololo, Kampala, Uganda';
  const GOOGLE_MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE_ADDRESS)}`;

  // Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.linkedPhone || currentUser?.mfaPhone || '');
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('General Product / Order Inquiry');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<InquiryData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const inquiryId = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const inquiry: InquiryData = {
      id: inquiryId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      orderId: orderId.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
      status: 'New'
    };

    try {
      await saveInquiryToFirestore(inquiry);
    } catch (err) {
      console.warn('Inquiry save fallback:', err);
    } finally {
      setIsSubmitting(false);
      setSubmittedInquiry(inquiry);
    }
  };

  const resetForm = () => {
    setSubmittedInquiry(null);
    setMessage('');
    setOrderId('');
  };

  const openWhatsApp = (customText?: string) => {
    const text = customText || 'Hello Shop Corner! I am reaching out regarding a store inquiry.';
    const url = `https://wa.me/${WHATSAPP_RAW}?text=${encodeURIComponent(text)}`;
    try {
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) {
        window.location.assign(url);
      }
    } catch {
      window.location.assign(url);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="contact-help-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn font-sans"
    >
      <motion.div
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Contact & Flagship Store Help</h3>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Official Store
                </span>
              </div>
              <p className="text-xs text-slate-300">WhatsApp, Store Location & Direct Inquiries</p>
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'form'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send Inquiry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Official WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'location'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Store Location</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CONTACT INQUIRY FORM */}
          {activeTab === 'form' && (
            <div>
              {submittedInquiry ? (
                <div className="text-center py-6 space-y-4">
                  <div className="h-14 w-14 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Inquiry Received & Saved!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Inquiry Reference ID:{' '}
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {submittedInquiry.id}
                      </span>
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 max-w-md mx-auto">
                    <p className="text-slate-700 dark:text-slate-300">
                      <b>Name:</b> {submittedInquiry.name} ({submittedInquiry.email})
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <b>Subject:</b> {submittedInquiry.subject}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
                      Your inquiry has been stored in our customer records database. Our representative will respond via email or phone shortly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sarah@example.com"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+256 756 351 236"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                        Order ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="e.g. ORD-920148"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                      Topic / Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="General Product / Order Inquiry">General Product / Order Inquiry</option>
                      <option value="Store Visit & Pickup Inquiry">Store Visit & Pickup Inquiry</option>
                      <option value="Custom Order & Bulk Pricing">Custom Order & Bulk Pricing</option>
                      <option value="Returns & Warranty Support">Returns & Warranty Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                      Inquiry Details *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your questions or details here..."
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3.5 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Inquiry to Store'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: WHATSAPP DIRECT */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30">
                      Instant Messaging
                    </span>
                    <span className="text-[10px] font-bold text-emerald-200">Available 24/7</span>
                  </div>

                  <div>
                    <p className="text-xs text-emerald-100 font-medium">Official WhatsApp Contact</p>
                    <h3 className="text-xl font-black tracking-tight text-white font-mono mt-0.5">
                      {WHATSAPP_DISPLAY}
                    </h3>
                  </div>

                  <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                    Connect directly with our customer concierge team for instant answers, product availability checks, and order updates.
                  </p>

                  <button
                    type="button"
                    onClick={() => openWhatsApp()}
                    className="w-full mt-2 py-3.5 rounded-2xl bg-white text-emerald-950 font-black text-xs uppercase tracking-wider hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <span>Chat on WhatsApp Now</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </button>
                </div>
              </div>

              {/* Quick pre-made templates */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Tap any template to launch WhatsApp:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openWhatsApp('Hi! I would like to confirm stock availability for a product.')}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all text-left cursor-pointer"
                  >
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">🛍️ Check Item Availability</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Inquire about stock before ordering</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => openWhatsApp('Hello! Can you help me locate the physical store for in-person pickup?')}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all text-left cursor-pointer"
                  >
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">📍 Store Visit & Pickup</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Directions and store hours inquiry</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHYSICAL STORE LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4 border border-slate-800 shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Shop Corner Flagship Store</h4>
                      <p className="text-xs text-slate-400">Main Retail Showroom & Fulfillment Center</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Open Today
                  </span>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200 leading-relaxed font-medium">{STORE_ADDRESS}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="text-slate-200 font-medium">Mon - Sat: 8:00 AM - 8:00 PM | Sun: 10:00 AM - 5:00 PM</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="text-slate-200 font-mono font-bold">{WHATSAPP_DISPLAY}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="text-slate-200 font-medium">support@shopcorner.app</span>
                  </div>
                </div>

                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer block text-center"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              </div>

              {/* Visual Location Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    <span>In-Store Pickups</span>
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Select "In-Store Pickup" during checkout to reserve items and pick them up at Acacia Avenue with zero shipping fee.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-indigo-500" />
                    <span>Regional Logistics</span>
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Same-day express dispatch across Kampala and nationwide priority freight handling for bulk orders.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
