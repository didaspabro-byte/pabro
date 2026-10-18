import React from 'react';
import { Product } from '../types';
import { X, Check, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProducts: Product[];
  onRemoveFromCompare: (productId: string) => void;
  onAddToCart: (product: Product, color?: string, size?: string) => void;
}

export default function ProductCompareModal({
  isOpen,
  onClose,
  comparedProducts,
  onRemoveFromCompare,
  onAddToCart,
}: ProductCompareModalProps) {
  const { formatPrice } = useCurrency();

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs">
        {/* Backdrop background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Modal Window Container */}
        <motion.div
          id="product-compare-modal-box"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-6xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-5 md:px-8">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white md:text-xl flex items-center gap-2">
                Compare Selected Products
                <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 text-xs font-bold">
                  {comparedProducts.length} {comparedProducts.length === 1 ? 'Product' : 'Products'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Compare and contrast technical specifications, prices, and features side-by-side to make the perfect decision.
              </p>
            </div>
            <button
              id="compare-modal-close-btn"
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-100 dark:border-slate-800 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal content body (Scrollable table/grid comparison) */}
          <div className="flex-1 overflow-auto p-6 md:p-8">
            {comparedProducts.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
                  <Trash2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No products selected for comparison</h3>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                  Add products to the comparison tray first to view them side-by-side.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-xl bg-slate-950 dark:bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Return to Store Catalog
                </button>
              </div>
            ) : (
              <div className="min-w-[650px] space-y-6">
                {/* Side-by-side Grid Table */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Sticky Column / Label Column */}
                  <div className="col-span-3 flex flex-col justify-between py-4 pr-4 border-r border-slate-100 dark:border-slate-800">
                    <div className="font-extrabold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-2">
                      Product Overview
                    </div>
                    <div className="space-y-16 mt-20">
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Rating & Demand</span>
                        <span className="text-[11px] text-slate-500 mt-1 block">Customer feedback & review scale.</span>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Category Details</span>
                        <span className="text-[11px] text-slate-500 mt-1 block">Store catalog classification.</span>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Stock Level</span>
                        <span className="text-[11px] text-slate-500 mt-1 block">Real-time inventory count status.</span>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Styling Colors</span>
                        <span className="text-[11px] text-slate-500 mt-1 block">Options for personalization.</span>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Sizes / Fitment</span>
                        <span className="text-[11px] text-slate-500 mt-1 block">Available physical dimensions.</span>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Curated Features</span>
                        <span className="text-[11px] text-slate-500 mt-1 block">Technical attributes & benefits.</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Columns */}
                  <div className={`col-span-9 grid gap-4`} style={{ gridTemplateColumns: `repeat(${comparedProducts.length}, minmax(0, 1fr))` }}>
                    {comparedProducts.map((product) => {
                      const discountPrice = Math.round(product.price * 1.25);
                      const isOutOfStock = product.stock !== undefined && product.stock <= 0;

                      return (
                        <div
                          key={product.id}
                          id={`compare-column-${product.id}`}
                          className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-slate-100 dark:border-slate-800/60 p-4 transition-all hover:shadow-xs relative"
                        >
                          {/* Remove button */}
                          <button
                            id={`compare-remove-btn-${product.id}`}
                            type="button"
                            onClick={() => onRemoveFromCompare(product.id)}
                            className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-100 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                            title="Remove from comparison"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>

                          {/* Image & Main Info */}
                          <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="h-28 w-full overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-2 mb-3">
                              <img
                                src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80'}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain rounded-lg"
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
                            <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1" title={product.name}>
                              {product.name}
                            </h3>
                            <div className="mt-1 flex flex-col items-center">
                              <div className="flex items-baseline justify-center gap-1.5">
                                <span className="text-base font-black text-indigo-700 dark:text-indigo-400">
                                  {formatPrice(product.price)}
                                </span>
                                <span className="text-[10px] text-rose-500 line-through opacity-80 font-medium">
                                  {formatPrice(discountPrice)}
                                </span>
                              </div>
                              {(() => {
                                let unitText = '';
                                if (product.netWeightGram) {
                                  unitText = `${formatPrice(product.price / product.netWeightGram)}/g`;
                                } else if (product.unitCount) {
                                  unitText = `${formatPrice(product.price / product.unitCount)}/${product.unitName || 'unit'}`;
                                }
                                return unitText ? (
                                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/25 px-1.5 py-0.5 rounded-md mt-1 animate-fadeIn">
                                    {unitText}
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-slate-450 dark:text-slate-500 mt-1 italic">n/a</span>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Spec Rows */}
                          <div className="flex-1 space-y-6 pt-4 text-xs">
                            {/* Rating */}
                            <div className="flex flex-col items-center justify-center text-center h-14">
                              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-lg">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{product.rating}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">{product.reviewsCount} reviews</span>
                            </div>

                            {/* Category */}
                            <div className="flex items-center justify-center h-14 text-center">
                              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                {product.category}
                              </span>
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center justify-center h-14 text-center">
                              {isOutOfStock ? (
                                <span className="rounded-full bg-rose-50 dark:bg-rose-950/30 px-3 py-1 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                  In Stock ({product.stock ?? 12} left)
                                </span>
                              )}
                            </div>

                            {/* Colors */}
                            <div className="flex flex-wrap gap-1.5 items-center justify-center h-14">
                              {product.colors && product.colors.length > 0 ? (
                                product.colors.map((color) => {
                                  let bgClass = 'bg-slate-800';
                                  if (color.includes('White') || color.includes('Alabaster')) bgClass = 'bg-slate-100 border border-slate-300';
                                  else if (color.includes('Gold') || color.includes('Sand')) bgClass = 'bg-amber-100';
                                  else if (color.includes('Blue') || color.includes('Mist')) bgClass = 'bg-blue-200';
                                  else if (color.includes('Green') || color.includes('Sage')) bgClass = 'bg-emerald-200';
                                  else if (color.includes('Silver') || color.includes('Grey') || color.includes('Gray')) bgClass = 'bg-slate-300';
                                  else if (color.includes('Brown') || color.includes('Driftwood')) bgClass = 'bg-amber-800';

                                  return (
                                    <span
                                      key={color}
                                      title={color}
                                      className={`h-4.5 w-4.5 rounded-full ring-2 ring-transparent hover:ring-indigo-400 cursor-help transition-all ${bgClass}`}
                                    />
                                  );
                                })
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold">—</span>
                              )}
                            </div>

                            {/* Sizes */}
                            <div className="flex flex-wrap gap-1 items-center justify-center h-14">
                              {product.sizes && product.sizes.length > 0 ? (
                                product.sizes.map((size) => (
                                  <span
                                    key={size}
                                    className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase"
                                  >
                                    {size}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold">—</span>
                              )}
                            </div>

                            {/* Features list */}
                            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                              <ul className="space-y-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 min-h-[160px]">
                                {product.features.map((feature, fIdx) => (
                                  <li key={fIdx} className="flex gap-2">
                                    <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Footer Action Button */}
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                              id={`compare-add-to-cart-btn-${product.id}`}
                              type="button"
                              onClick={() => {
                                const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
                                const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
                                onAddToCart(product, defaultColor, defaultSize);
                              }}
                              disabled={isOutOfStock}
                              className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold tracking-wide transition-all shadow-xs cursor-pointer ${
                                isOutOfStock
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md active:scale-95'
                              }`}
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4 md:px-8 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold">
              Tip: You can compare up to 4 different catalog products side-by-side.
            </span>
            <button
              id="compare-modal-footer-close-btn"
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 px-5 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
            >
              Close Comparison
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
