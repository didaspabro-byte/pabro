import React, { useState } from 'react';
import { Order } from '../types';
import {
  getOrCreateOrderTrackingInfo,
  getStageProgressPercent
} from '../lib/trackingUtils';
import {
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Building2,
  Navigation,
  FileText,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderTrackingTimelineProps {
  order: Order;
  compact?: boolean;
}

export default function OrderTrackingTimeline({ order, compact = false }: OrderTrackingTimelineProps) {
  const [copied, setCopied] = useState(false);
  const [showEventHistory, setShowEventHistory] = useState(!compact);

  const trackingInfo = getOrCreateOrderTrackingInfo(order);
  const progressPercent = getStageProgressPercent(trackingInfo.currentStage);

  const handleCopyTracking = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(trackingInfo.trackingNumber).catch(() => {});
      }
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { key: 'placed', label: 'Order Placed', icon: FileText },
    { key: 'processing', label: 'Processing', icon: Clock },
    { key: 'shipped', label: 'In Transit', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 }
  ];

  if (order.status === 'Cancelled' || trackingInfo.currentStage === 'cancelled') {
    return (
      <div id={`order-tracking-cancelled-${order.id}`} className="rounded-2xl border border-rose-100 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900/30 p-4 font-sans">
        <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Order Delivery Cancelled</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Tracking tracking code <span className="font-mono font-bold text-rose-800 dark:text-rose-300">{trackingInfo.trackingNumber}</span> is revoked.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id={`order-tracking-container-${order.id}`} className="space-y-4 font-sans">
      {/* Top Banner Card */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-925 to-slate-950 p-4 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Carrier Logistics</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  {trackingInfo.carrierService}
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-white">{trackingInfo.carrier}</h4>
            </div>
          </div>

          {/* Tracking Number badge */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-300 font-bold tracking-wide">
                {trackingInfo.trackingNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyTracking}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
                title="Copy tracking number"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            {copied && (
              <span className="text-[10px] text-emerald-400 font-bold animate-fadeIn">Copied!</span>
            )}
          </div>
        </div>

        {/* Estimated arrival highlight */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-slate-300 font-medium">Estimated Handover:</span>
            <span className="font-black text-amber-300">{trackingInfo.estimatedDeliveryDate}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Guaranteed Express Delivery</span>
          </div>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Delivery Status Lifecycle
          </h4>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
            {progressPercent}% Completed
          </span>
        </div>

        {/* Main Bar */}
        <div className="relative h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Steps Nodes */}
        <div className="grid grid-cols-5 gap-1 text-center">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            const stageIndex = steps.findIndex((s) => s.key === trackingInfo.currentStage);
            const isCompleted = idx < stageIndex || (idx === stageIndex && trackingInfo.currentStage === 'delivered');
            const isCurrent = idx === stageIndex && trackingInfo.currentStage !== 'delivered';

            return (
              <div key={step.key} className="flex flex-col items-center group">
                <div
                  className={`relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100 dark:ring-indigo-950/60 scale-110'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                  )}
                </div>
                <span
                  className={`mt-2 text-[10px] font-bold tracking-tight line-clamp-1 ${
                    isCurrent
                      ? 'text-indigo-700 dark:text-indigo-400 font-black'
                      : isCompleted
                      ? 'text-slate-900 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulated Live Route Canvas / Visual Pinpoint */}
      {!compact && (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-950 p-4 text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 z-10 relative">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Live Route Simulator
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Destination: {order.shippingDetails?.city || 'City'}, {order.shippingDetails?.country || 'Country'}
            </span>
          </div>

          {/* SVG Route Visualization */}
          <div className="relative h-24 w-full bg-slate-900/90 rounded-xl border border-slate-800 p-3 flex items-center justify-between">
            {/* Origin */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-[9px] font-bold text-slate-400">Warehouse Hub</span>
            </div>

            {/* Dotted path */}
            <div className="relative flex-1 mx-3 h-0.5 border-t-2 border-dashed border-slate-700 flex items-center">
              <motion.div
                className="absolute -top-3.5 h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg border border-indigo-400"
                initial={{ left: '5%' }}
                animate={{ left: `${Math.max(10, Math.min(90, progressPercent))}%` }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                <Truck className="h-3.5 w-3.5" />
              </motion.div>
            </div>

            {/* Destination */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <span className="text-[9px] font-bold text-emerald-400">
                {order.shippingDetails?.city || 'Home'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Checkpoints Event Log List */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Checkpoint Milestone Log ({trackingInfo.events.length})
          </h4>
          <button
            type="button"
            onClick={() => setShowEventHistory((prev) => !prev)}
            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {showEventHistory ? 'Hide Checkpoints' : 'View Checkpoints'}
          </button>
        </div>

        {showEventHistory && (
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            {trackingInfo.events.map((evt) => (
              <div key={evt.id} className="flex items-start gap-3 text-xs">
                <div
                  className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${
                    evt.completed
                      ? 'bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-950'
                      : evt.current
                      ? 'bg-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-950 animate-pulse'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className={`font-extrabold ${evt.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      {evt.title}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {evt.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal leading-relaxed">
                    {evt.description}
                  </p>
                  {evt.location && (
                    <span className="inline-block mt-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      📍 {evt.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
