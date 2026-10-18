import React, { useState } from 'react';
import { Order } from '../types';
import { Clock, Archive, ChevronDown, ChevronUp, Package, MapPin, ExternalLink, Search, X, RotateCcw, ShoppingBag, Truck, Phone, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';
import OrderTrackingTimeline from './OrderTrackingTimeline';

interface OrderHistoryProps {
  orders: Order[];
  onBrowseStore: () => void;
  onReorder: (order: Order) => void;
  onCancelOrder: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  onClearCancelledOrders?: () => void;
}

export default function OrderHistory({ 
  orders, 
  onBrowseStore, 
  onReorder, 
  onCancelOrder,
  onDeleteOrder,
  onClearCancelledOrders
}: OrderHistoryProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isConfirmingClearCanceled, setIsConfirmingClearCanceled] = useState(false);
  const { formatPrice } = useCurrency();

  const isCancelled = (status?: string) => {
    const s = (status || '').toLowerCase().trim();
    return s === 'cancelled' || s === 'canceled';
  };

  const cancelledOrdersCount = orders.filter((o) => isCancelled(o.status)).length;

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchesId = order.id.toLowerCase().includes(query);
    const matchesProduct = order.items.some((item) =>
      item.product.name.toLowerCase().includes(query)
    );

    return matchesId || matchesProduct;
  });

  return (
    <div id="order-history-section" className="mx-auto max-w-4xl px-4 py-8 md:px-0">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">Purchase Account Activity</h2>
          <p className="text-xs text-slate-400">View and track status logs for your simulated purchases and orders.</p>
        </div>

        {orders.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {cancelledOrdersCount > 0 && onClearCancelledOrders && (
              !isConfirmingClearCanceled ? (
                <button
                  id="btn-history-clear-canceled"
                  type="button"
                  onClick={() => setIsConfirmingClearCanceled(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                  title="Remove all canceled orders from purchase history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Canceled ({cancelledOrdersCount})</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl shadow-2xs">
                  <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                    Remove {cancelledOrdersCount} canceled {cancelledOrdersCount === 1 ? 'order' : 'orders'}?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearCancelledOrders();
                      setIsConfirmingClearCanceled(false);
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-2xs"
                  >
                    Yes, Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClearCanceled(false)}
                    className="px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )
            )}

            <div className="relative w-full md:w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="order-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID or Product..."
                className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <motion.div
          id="order-history-empty"
          className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-xs"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.6,
                staggerChildren: 0.12,
                delayChildren: 0.1
              }
            }
          }}
        >
          {/* Lottie-like empty orders animation */}
          <div className="relative mx-auto h-40 w-40 flex items-center justify-center mb-4 overflow-visible select-none">
            {/* Soft ambient background glow */}
            <motion.div 
              className="absolute h-24 w-24 rounded-full bg-slate-500/5 blur-xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Rotating dashed tracking ring */}
            <motion.svg 
              className="absolute h-32 w-32 text-slate-200 dark:text-slate-100" 
              viewBox="0 0 100 100"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
            >
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4, 8" fill="none" />
            </motion.svg>

            {/* Floating primary package container */}
            <motion.div
              className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 text-slate-600 shadow-xs"
              animate={{
                y: [0, -6, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.08, rotate: -5 }}
            >
              <Archive className="h-8 w-8 text-slate-600 filter drop-shadow-xs" />
            </motion.div>

            {/* Floating tracking dot particle 1 */}
            <motion.div
              className="absolute text-slate-400"
              initial={{ y: 20, x: -45, opacity: 0, scale: 0.5 }}
              animate={{ 
                y: [5, -45, 5], 
                x: [-45, -50, -45],
                opacity: [0, 0.8, 0], 
                scale: [0.5, 0.9, 0.5] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4.4, 
                ease: "easeInOut" 
              }}
            >
              <div className="h-2 w-2 rounded-full border border-slate-400 bg-slate-400/25" />
            </motion.div>

            {/* Floating delivery check particle 2 */}
            <motion.div
              className="absolute text-emerald-500"
              initial={{ y: 35, x: 40, opacity: 0, scale: 0.4 }}
              animate={{ 
                y: [15, -35, 15], 
                x: [40, 48, 40],
                opacity: [0, 0.9, 0], 
                scale: [0.4, 1, 0.4]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 5, 
                delay: 1.2, 
                ease: "easeInOut" 
              }}
            >
              <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>

            {/* Floating location pin particle 3 */}
            <motion.div
              className="absolute text-indigo-500"
              initial={{ y: -15, x: 30, opacity: 0, scale: 0.5 }}
              animate={{ 
                y: [-15, -45, -15], 
                x: [30, 20, 30],
                opacity: [0, 0.85, 0], 
                scale: [0.5, 0.9, 0.5] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4, 
                delay: 2.2, 
                ease: "easeInOut" 
              }}
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-4.198 0-8 3.797-8 8 0 5.4 8 16 8 16s8-10.6 8-16c0-4.203-3.802-8-8-8zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
              </svg>
            </motion.div>

            {/* Floating map trace dash line 4 */}
            <motion.div
              className="absolute text-slate-300"
              initial={{ y: 40, x: -10, opacity: 0, scale: 0.6 }}
              animate={{ 
                y: [10, -50, 10], 
                x: [-10, 5, -10],
                opacity: [0, 0.7, 0], 
                scale: [0.6, 0.85, 0.6] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4.8, 
                delay: 0.5, 
                ease: "easeInOut" 
              }}
            >
              <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeDasharray="3, 3">
                <path d="M5 12h14" />
              </svg>
            </motion.div>
          </div>

          <motion.h3 
            className="text-base font-bold text-slate-900"
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            No transactions recorded
          </motion.h3>
          <motion.p 
            className="mt-1.5 text-xs text-slate-400 max-w-sm leading-relaxed"
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            Once you place simulated queries through our secure Checkout modal, invoices are recorded here dynamically.
          </motion.p>
          <motion.button
            id="history-browse-cta"
            type="button"
            onClick={onBrowseStore}
            className="mt-6 flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white tracking-wide hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            Start Shopping Catalog
          </motion.button>
        </motion.div>
      ) : (
        <>
          {filteredOrders.length === 0 ? (
            <motion.div
              id="order-history-no-results"
              className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/30 p-12 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No matching orders found</h3>
              <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">
                We couldn't find any orders matching &ldquo;<span className="font-semibold text-slate-700">{searchQuery}</span>&rdquo;. Try checking the spelling or search for another keyword.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
              >
                Clear Search Filter
              </button>
            </motion.div>
          ) : (
            <div id="order-history-list" className="space-y-4">
              {filteredOrders.map((order, orderIdx) => {
                const isExpanded = expandedOrderId === order.id;
                const itemsCount = order.items.reduce((acc, curr) => acc + curr.quantity, 0);

                return (
                  <motion.div
                    key={order.id}
                    id={`order-record-${order.id}`}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs hover:border-slate-250 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: orderIdx * 0.05 }}
                  >
                    {/* Header overview row */}
                    <div
                      id={`order-header-${order.id}`}
                      onClick={() => toggleOrderExpand(order.id)}
                      className="flex flex-wrap items-center justify-between gap-4 p-5 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div>
                          <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Order ID</span>
                          <span className="text-sm font-black text-slate-900">{order.id}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Date Logged</span>
                          <span className="text-xs font-semibold text-slate-700">{order.date}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Quantity</span>
                          <span className="text-xs font-semibold text-slate-700">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Grand Total</span>
                          <span className="text-xs font-black text-indigo-700">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorder(order);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-[10px] font-bold text-white px-2.5 py-1.5 transition-all shadow-xs cursor-pointer"
                          title="Quickly re-populate cart with this order's items"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Re-order</span>
                        </button>
                        {order.status === 'Processing' ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                            <Clock className="h-3 w-3" />
                            Processing
                          </span>
                        ) : order.status === 'Shipped' ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">
                            <Package className="h-3 w-3" />
                            Shipped
                          </span>
                        ) : order.status === 'Cancelled' ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">
                            <X className="h-3 w-3" />
                            Cancelled
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                            <Package className="h-3 w-3" />
                            Delivered
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Collapsible Detail body */}
                    {isExpanded && (
                      <div id={`order-detail-expanded-${order.id}`} className="border-t border-slate-100 p-5 space-y-6">
                        {/* Live Delivery Status Timeline */}
                        <div>
                          <OrderTrackingTimeline order={order} />
                        </div>

                        {/* Items Purchased List */}
                        <div>
                          <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 mb-3.5 flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5" />
                            Purchased Goods
                          </h4>
                          <div className="space-y-3.5">
                            {order.items.map((item, index) => (
                              <div
                                key={`${item.product.id}-${index}`}
                                className="flex items-center justify-between gap-4 border-b border-dashed border-slate-100 pb-3"
                              >
                                <div className="flex gap-3">
                                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                                    <img
                                      src={item.product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80'}
                                      alt={item.product.name}
                                      className="h-full w-full object-cover object-center"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        const target = e.currentTarget;
                                        const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80';
                                        if (target.src !== fallback) {
                                          target.src = fallback;
                                        }
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-slate-800">{item.product.name}</h5>
                                    <div className="mt-0.5 flex gap-1.5 text-[10px] text-slate-400 font-medium">
                                      <span>Qty: {item.quantity}</span>
                                      {item.selectedColor && (
                                        <>
                                          <span>|</span>
                                          <span>Color: {item.selectedColor}</span>
                                        </>
                                      )}
                                      {item.selectedSize && (
                                        <>
                                          <span>|</span>
                                          <span>Size: {item.selectedSize}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-slate-900">
                                  {formatPrice(item.product.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address & Billing info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/60 rounded-xl p-4">
                          {/* Shipping info */}
                          <div>
                            <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              Delivery Coordinates
                            </h4>
                            <div className="text-xs text-slate-600 space-y-0.5 font-medium">
                              <p className="font-bold text-slate-800">{order.shippingDetails.fullName}</p>
                              {order.shippingDetails.phone && (
                                <p className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {order.shippingDetails.phone}
                                </p>
                              )}
                              <p>{order.shippingDetails.address}</p>
                              <p>{order.shippingDetails.city}, {order.shippingDetails.postalCode}</p>
                              <p>{order.shippingDetails.country}</p>
                              {order.shippingDetails.distance && (
                                <p className="text-orange-600 dark:text-orange-400 font-bold mt-1">
                                  Delivery Distance: {order.shippingDetails.distance} km
                                </p>
                              )}
                              <p className="pt-2 text-[10px] text-slate-400 font-normal">Email: {order.shippingDetails.email}</p>
                            </div>
                          </div>

                          {/* Billing detailed breakdown */}
                          <div className="flex flex-col justify-end text-xs text-slate-500 space-y-1.5">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span className="font-semibold text-slate-700">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery Charge:</span>
                              <span className="font-semibold text-slate-700">{formatPrice(order.shipping || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>VAT / Taxes:</span>
                              <span className="font-semibold text-slate-700">
                                {order.tax && order.tax > 0 ? formatPrice(order.tax) : 'Excluded (0%)'}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-900">
                              <span className="text-sm font-semibold">Order Total:</span>
                              <span className="text-sm text-indigo-700">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Actions row */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                          <div>
                            {order.status === 'Processing' ? (
                              cancellingOrderId === order.id ? (
                                <div className="flex flex-wrap items-center gap-2.5 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/60 dark:border-rose-900/20 px-3 py-2 rounded-xl">
                                  <span className="text-[11px] font-extrabold text-rose-700 dark:text-rose-450 uppercase tracking-wide">Are you sure?</span>
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onCancelOrder(order.id);
                                        setCancellingOrderId(null);
                                      }}
                                      className="rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-[10px] font-black text-white px-3 py-1.5 transition-all shadow-xs cursor-pointer"
                                    >
                                      Confirm Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setCancellingOrderId(null)}
                                      className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 active:scale-95 text-[10px] font-bold px-3 py-1.5 transition-all cursor-pointer"
                                    >
                                      Nevermind, Keep
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setCancellingOrderId(order.id)}
                                  className="rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 active:scale-95 text-xs font-bold px-4 py-2.5 transition-all cursor-pointer shadow-2xs hover:text-rose-800"
                                >
                                  Cancel Order
                                </button>
                              )
                            ) : isCancelled(order.status) ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="rounded-xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-150 dark:border-rose-900/30 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                                  <span>Order Cancelled</span>
                                </div>
                                {onDeleteOrder && (
                                  confirmDeleteId === order.id ? (
                                    <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 px-2.5 py-1.5 rounded-xl animate-fadeIn">
                                      <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">Remove?</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onDeleteOrder(order.id);
                                          setConfirmDeleteId(null);
                                        }}
                                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-2xs transition-all"
                                      >
                                        Yes, Remove
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                                      >
                                        Keep
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(order.id)}
                                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 text-slate-500 text-xs font-bold px-3 py-2 transition-all cursor-pointer shadow-2xs"
                                      title="Remove cancelled order from purchase log"
                                    >
                                      Remove from Log
                                    </button>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 px-3.5 py-2 text-xs font-bold text-slate-500 flex items-center gap-1.5" title="Only pending Processing orders can be cancelled.">
                                <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                                <span>Order is {order.status.toLowerCase()} and cannot be cancelled</span>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => onReorder(order)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-slate-900 hover:bg-slate-800 dark:hover:bg-slate-850 active:scale-98 text-xs font-bold text-white px-5 py-2.5 tracking-wide transition-all shadow-sm w-full md:w-auto cursor-pointer"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Re-order All Items (Populate Cart)
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
