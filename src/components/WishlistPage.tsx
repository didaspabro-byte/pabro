import React from 'react';
import { Product } from '../types';
import { Heart, HeartOff, Eye, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';

interface WishlistPageProps {
  wishlist: string[];
  products: Product[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, color?: string, size?: string) => void;
  onViewDetails: (product: Product) => void;
  onBrowseStore: () => void;
}

export default function WishlistPage({
  wishlist,
  products,
  onToggleWishlist,
  onAddToCart,
  onViewDetails,
  onBrowseStore,
}: WishlistPageProps) {
  const { formatPrice } = useCurrency();
  // Filter products that are in the wishlist
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleQuickAdd = (product: Product) => {
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    onAddToCart(product, defaultColor, defaultSize);
  };

  return (
    <div id="wishlist-page-view" className="space-y-8">
      {/* Header Segment */}
      <section id="wishlist-hero" className="text-center md:text-left">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl flex items-center justify-center md:justify-start gap-3">
          <Heart className="h-8 w-8 fill-rose-500 text-rose-500 animate-pulse" />
          Your Saved Wishlist
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-2xl">
          A personalized collection of your favorite minimalist pieces and premium tools. Monitor pricing or easily add them to your daily rotation.
        </p>
      </section>

      {/* Main Wishlist content */}
      {wishlistedProducts.length === 0 ? (
        <motion.div
          id="wishlist-empty-view"
          className="py-16 text-center border border-slate-100 rounded-3xl bg-white p-8 shadow-xs"
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
          {/* Lottie-like empty wishlist animation */}
          <div className="relative mx-auto h-40 w-40 flex items-center justify-center mb-4 overflow-visible select-none">
            {/* Soft ambient background glow */}
            <motion.div 
              className="absolute h-24 w-24 rounded-full bg-rose-500/5 blur-xl"
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Rotating dashed ring */}
            <motion.svg 
              className="absolute h-32 w-32 text-rose-100/80 dark:text-rose-950/20" 
              viewBox="0 0 100 100"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
            >
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6, 6" fill="none" />
            </motion.svg>

            {/* Floating primary heart container */}
            <motion.div
              className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100/80 text-rose-500 shadow-sm"
              animate={{
                y: [0, -8, 0],
                rotate: [0, -3, 3, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Heart className="h-9 w-9 fill-rose-500/10 text-rose-500 filter drop-shadow-xs" />
            </motion.div>

            {/* Floating particle 1 (Heart) */}
            <motion.div
              className="absolute text-rose-400"
              initial={{ y: 20, x: -40, opacity: 0, scale: 0.6 }}
              animate={{ 
                y: [-5, -45, -5], 
                x: [-40, -48, -40],
                opacity: [0, 0.85, 0.85, 0], 
                scale: [0.6, 1.1, 0.8] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4.2, 
                ease: "easeInOut" 
              }}
            >
              <Heart className="h-4 w-4 fill-rose-400/10" />
            </motion.div>

            {/* Floating particle 2 (Sparkle/Star) */}
            <motion.div
              className="absolute text-amber-400"
              initial={{ y: 30, x: 45, opacity: 0, scale: 0.5 }}
              animate={{ 
                y: [10, -40, 10], 
                x: [45, 52, 45],
                opacity: [0, 0.9, 0.9, 0], 
                scale: [0.5, 1, 0.7],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4.8, 
                delay: 0.8, 
                ease: "easeInOut" 
              }}
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
              </svg>
            </motion.div>

            {/* Floating particle 3 (Tiny ring) */}
            <motion.div
              className="absolute text-indigo-400"
              initial={{ y: 15, x: 25, opacity: 0, scale: 0.4 }}
              animate={{ 
                y: [0, -55, 0], 
                x: [25, 18, 25],
                opacity: [0, 0.8, 0], 
                scale: [0.4, 0.9, 0.4] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3.8, 
                delay: 1.5, 
                ease: "easeInOut" 
              }}
            >
              <div className="h-2 w-2 rounded-full border border-indigo-400 bg-indigo-400/20" />
            </motion.div>

            {/* Floating particle 4 (Small rose heart) */}
            <motion.div
              className="absolute text-rose-300"
              initial={{ y: 35, x: -15, opacity: 0, scale: 0.3 }}
              animate={{ 
                y: [5, -45, 5], 
                x: [-15, -4, -15],
                opacity: [0, 0.8, 0], 
                scale: [0.3, 0.8, 0.3],
                rotate: [-20, 20, -20]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4.5, 
                delay: 0.3, 
                ease: "easeInOut" 
              }}
            >
              <Heart className="h-3.5 w-3.5 fill-rose-300/20" />
            </motion.div>

            {/* Floating particle 5 (Mini Sparkle) */}
            <motion.div
              className="absolute text-amber-300"
              initial={{ y: -20, x: -25, opacity: 0, scale: 0.5 }}
              animate={{ 
                scale: [0.5, 1.05, 0.5],
                opacity: [0.2, 0.95, 0.2]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.8, 
                ease: "easeInOut" 
              }}
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0l2.5 7.5 7.5 2.5-7.5 2.5-2.5 7.5-2.5-7.5-7.5-2.5 7.5-2.5z" />
              </svg>
            </motion.div>
          </div>

          <motion.h3 
            className="text-base font-bold text-slate-950"
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            Your Saved Wishlist is currently empty
          </motion.h3>
          <motion.p 
            className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed"
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            Explore our curated catalog of premium goods and press the heart icon on any product card to start building your wishlist.
          </motion.p>
          <motion.button
            id="wishlist-browse-btn"
            type="button"
            onClick={onBrowseStore}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 cursor-pointer"
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            Explore Catalog
            <ArrowRight className="h-3 w-3" />
          </motion.button>
        </motion.div>
      ) : (
        <div id="wishlist-grid" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {wishlistedProducts.map((product) => (
              <motion.div
                key={product.id}
                id={`wishlist-card-${product.id}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs transition-shadow duration-300 hover:shadow-md"
              >
                {/* Image panel */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-50">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80'}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                    onClick={() => onViewDetails(product)}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80';
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />
                  
                  {/* Category badge */}
                  <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium tracking-wide text-slate-800 backdrop-blur-xs shadow-xs uppercase">
                    {product.category}
                  </span>

                  {/* Remove filter button */}
                  <button
                    id={`wishlist-remove-${product.id}`}
                    type="button"
                    onClick={() => onToggleWishlist(product.id)}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 backdrop-blur-xs shadow-xs transition-colors hover:bg-white hover:text-rose-600 focus:outline-none"
                    title="Remove from wishlist"
                  >
                    <HeartOff className="h-4.5 w-4.5 fill-rose-500 text-rose-500" />
                  </button>
                </div>

                {/* Product details */}
                <div className="flex flex-1 flex-col p-5">
                  <h3
                    onClick={() => onViewDetails(product)}
                    className="cursor-pointer text-base font-semibold leading-snug text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                  >
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Price</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-slate-900">{formatPrice(product.price)}</span>
                        <span className="text-xs text-rose-500 line-through opacity-85 font-medium">{formatPrice(Math.round(product.price * 1.25))}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(product)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product)}
                        className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-950 px-3 text-xs font-semibold text-white tracking-wide hover:bg-slate-800 transition-colors"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
