import React from 'react';
import { Order } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { Bell, ShoppingBag, Truck, Phone, MessageSquare, ExternalLink, X, Volume2, VolumeX, CheckCircle, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminOrderNotificationBarProps {
  order: Order | null;
  onViewInAdmin: (orderId: string) => void;
  onDismiss: () => void;
  onMarkShipped?: (orderId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function AdminOrderNotificationBar({
  order,
  onViewInAdmin,
  onDismiss,
  onMarkShipped,
  soundEnabled,
  onToggleSound
}: AdminOrderNotificationBarProps) {
  const { formatPrice } = useCurrency();

  if (!order) return null;

  const cleanPhone = order.shippingDetails.phone ? order.shippingDetails.phone.replace(/[^0-9+]/g, '') : '';
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hello ${order.shippingDetails.fullName}, regarding your order #${order.id} from PrimeStockUG...`)}` : '';

  return (
    <AnimatePresence>
      <motion.div
        id="admin-global-order-notification-bar"
        initial={{ height: 0, opacity: 0, y: -20 }}
        animate={{ height: 'auto', opacity: 1, y: 0 }}
        exit={{ height: 0, opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-lg border-b border-orange-500/50 relative z-50 overflow-hidden font-sans"
      >
        {/* Subtle background ambient pulse pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
          {/* Left: Live Notification Flag & Order Summary */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-xs">
                <Bell className="h-5 w-5 text-white animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-black/30 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border border-white/10">
                  ⚡ New Order Received
                </span>
                <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                  Order <span className="underline decoration-white/50">{order.id}</span>
                </span>
                <span className="text-orange-200 text-xs hidden sm:inline">•</span>
                <span className="text-xs font-bold text-amber-100 truncate">
                  {order.shippingDetails.fullName}
                </span>
                {order.shippingDetails.phone && (
                  <span className="text-xs font-medium text-white/90 bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Phone className="h-3 w-3 text-amber-200" />
                    {order.shippingDetails.phone}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-white/90 font-medium flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="font-bold text-white bg-black/20 px-1.5 py-0.2 rounded">
                  {formatPrice(order.total)}
                </span>
                <span>({order.items.length} item{order.items.length !== 1 ? 's' : ''})</span>
                <span className="text-white/60">•</span>
                <span className="flex items-center gap-1 truncate max-w-xs text-orange-100">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {order.shippingDetails.address}, {order.shippingDetails.city}
                </span>
                <span className="text-white/60">•</span>
                <span className="text-[10px] opacity-85">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Admin Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap sm:flex-nowrap">
            {/* WhatsApp Buyer Quick Action */}
            {whatsappUrl && (
              <a
                id="admin-bar-whatsapp-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                title="Open WhatsApp chat with customer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            )}

            {/* Quick Dispatch Action */}
            {onMarkShipped && order.status === 'Processing' && (
              <button
                id="admin-bar-quick-dispatch-btn"
                type="button"
                onClick={() => onMarkShipped(order.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all backdrop-blur-xs border border-white/25 cursor-pointer"
                title="Instantly mark order as Shipped"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Dispatch Rider</span>
              </button>
            )}

            {/* View in Pipeline Action */}
            <button
              id="admin-bar-view-pipeline-btn"
              type="button"
              onClick={() => onViewInAdmin(order.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-orange-900 hover:bg-orange-50 text-xs font-black transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <span>View in Admin Pipeline</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>

            {/* Sound Toggle */}
            <button
              id="admin-bar-toggle-sound-btn"
              type="button"
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                soundEnabled ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-black/30 text-white/60 hover:text-white'
              }`}
              title={soundEnabled ? 'Order sound chime is active (Click to mute)' : 'Order sound chime is muted (Click to enable)'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Dismiss Bar */}
            <button
              id="admin-bar-dismiss-btn"
              type="button"
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
              title="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
