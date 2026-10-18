import React, { useEffect } from 'react';
import { CartItem, User } from '../types';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingCart, Cloud, CloudOff, RefreshCw, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number, color?: string, size?: string) => void;
  onRemoveItem: (productId: string, color?: string, size?: string) => void;
  onCheckout: () => void;
  currentUser?: User | null;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  currentUser,
  syncStatus = 'idle'
}: CartDrawerProps) {
  const { formatPrice } = useCurrency();
  
  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const subtotal = cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const totalQuantity = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            id="cart-drawer-backdrop"
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Drawer container body */}
          <motion.div
            id="cart-drawer"
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white dark:bg-slate-950 shadow-2xl transition-colors duration-200"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
          >
            {/* Header */}
            <div id="cart-drawer-header" className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 p-5">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-slate-800 dark:text-white" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Shopping Bag</h2>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {totalQuantity}
                  </span>
                </div>
                {currentUser && syncStatus && syncStatus !== 'idle' && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] font-black uppercase tracking-wider">
                    {syncStatus === 'syncing' && (
                      <>
                        <RefreshCw className="h-3 w-3 text-indigo-500 animate-spin" />
                        <span className="text-indigo-500">Backing up to Aura Cloud...</span>
                      </>
                    )}
                    {syncStatus === 'synced' && (
                      <>
                        <Cloud className="h-3 w-3 text-emerald-500 animate-pulse" />
                        <span className="text-emerald-500">Synced across devices</span>
                      </>
                    )}
                    {syncStatus === 'error' && (
                      <>
                        <CloudOff className="h-3 w-3 text-rose-500 animate-bounce" />
                        <span className="text-rose-500 font-bold">Sync error</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button
                id="cart-drawer-close"
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable list */}
            <div id="cart-drawer-body" className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div id="cart-empty-state" className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Your bag is empty</h3>
                  <p className="mt-1 text-sm text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                    Fill your bag with premium, carefully-selected goods from our catalog.
                  </p>
                  <button
                    id="cart-empty-browse-btn"
                    type="button"
                    onClick={onClose}
                    className="mt-6 rounded-xl bg-slate-950 dark:bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white dark:text-white hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors"
                  >
                    Start Exploring
                  </button>
                </div>
              ) : (
                cartItems.map((item, index) => {
                  const key = `${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`;
                  return (
                    <div
                      key={key}
                      id={`cart-item-${item.product.id}-${index}`}
                      className="flex gap-4 rounded-2xl border border-slate-50 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-3 hover:border-slate-100 dark:hover:border-slate-800 transition-colors"
                    >
                       {/* Product thumbnail */}
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950">
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

                      {/* Item Information body */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {item.product.name}
                          </h4>
                          <span className="text-sm font-bold text-slate-950 dark:text-white">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>

                        {/* Selected options tags */}
                        {(item.selectedColor || item.selectedSize) && (
                          <div className="mt-1 flex flex-wrap gap-1.5 font-sans">
                            {item.selectedColor && (
                              <span className="rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {item.selectedColor}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                Size: {item.selectedSize}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Quantity and removal footer */}
                        <div className="mt-auto pt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 rounded-lg border border-slate-205 dark:border-slate-805 p-0.5">
                            <button
                              id={`cart-item-decrease-${item.product.id}-${index}`}
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, -1, item.selectedColor, item.selectedSize)}
                              className="flex h-5 w-5 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-800 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              id={`cart-item-increase-${item.product.id}-${index}`}
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, 1, item.selectedColor, item.selectedSize)}
                              className="flex h-5 w-5 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            id={`cart-item-remove-${item.product.id}-${index}`}
                            type="button"
                            onClick={() => onRemoveItem(item.product.id, item.selectedColor, item.selectedSize)}
                            className="text-slate-400 dark:text-slate-550 hover:text-red-500 dark:hover:text-rose-400 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Calculations and CTA */}
            {cartItems.length > 0 && (() => {
              const estimatedDelivery = 7000; // Standard rate: UGX 7,000 for Kampala (UGX 3,000 for Entebbe)
              const estimatedTax = 0; // VAT/Tax strictly excluded
              const estimatedTotal = subtotal + estimatedDelivery;

              return (
                <div id="cart-drawer-footer" className="border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/60 p-5 space-y-4 font-sans">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span>Delivery Fee</span>
                        <span className="text-[10px] text-slate-400 font-normal">(UGX 7k Kla / 3k Ebb)</span>
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{formatPrice(estimatedDelivery)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span>VAT / Taxes</span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">Excluded</span>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatPrice(0)}</span>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                      <span>Estimated Total</span>
                      <span className="text-base text-slate-950 dark:text-white">{formatPrice(estimatedTotal)}</span>
                    </div>
                  </div>

                  <button
                    id="checkout-cta-btn"
                    type="button"
                    onClick={onCheckout}
                    className="w-full flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-950 dark:bg-indigo-600 text-xs font-semibold tracking-wide text-white hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors active:scale-98"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <p id="checkout-disclaimer" className="text-center text-[10px] text-slate-400 dark:text-slate-505">
                    Delivery fees applied according to destination distance at checkout.
                  </p>
                </div>
              );
            })()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
