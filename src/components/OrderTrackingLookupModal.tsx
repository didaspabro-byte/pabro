import React, { useState } from 'react';
import { Order } from '../types';
import OrderTrackingTimeline from './OrderTrackingTimeline';
import { Search, X, PackageSearch, Truck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderTrackingLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export default function OrderTrackingLookupModal({
  isOpen,
  onClose,
  orders
}: OrderTrackingLookupModalProps) {
  const [query, setQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return;

    setSearched(true);
    const found = orders.find((o) => {
      const idMatch = o.id.toLowerCase().includes(cleanQuery);
      const trackingMatch = o.trackingNumber?.toLowerCase().includes(cleanQuery) ||
        `aura-${o.id.toLowerCase().replace(/[^a-z0-9]/g, '')}`.includes(cleanQuery);
      return idMatch || trackingMatch;
    });

    setSearchedOrder(found || null);
  };

  return (
    <div
      id="order-tracking-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn font-sans"
    >
      <motion.div
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Live Order Delivery Tracker
              </h3>
              <p className="text-xs text-slate-400">
                Enter your Order ID or Courier Tracking Number to view real-time status.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (searched) setSearched(false);
                }}
                placeholder="e.g. ORD-842109 or AURA-842109-EX"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-3 pl-10 pr-4 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <span>Track Package</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick list preview if search hasn't been submitted */}
          {!searched && orders.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Recent Account Purchases
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {orders.slice(0, 4).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setQuery(o.id);
                      setSearchedOrder(o);
                      setSearched(true);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all text-left group cursor-pointer"
                  >
                    <div>
                      <span className="block text-xs font-black text-slate-900 dark:text-white">
                        {o.id}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {o.date} • {o.items.length} items
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                      Track →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Display */}
          {searched && (
            <div>
              {searchedOrder ? (
                <OrderTrackingTimeline order={searchedOrder} />
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30">
                  <PackageSearch className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    No matching order found
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                    Double-check the Order ID or Tracking Number and try again.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
