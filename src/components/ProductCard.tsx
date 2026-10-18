import React, { useState, memo } from 'react';
import { Product } from '../types';
import { Star, Eye, Plus, Check, Heart, ArrowLeftRight, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, color?: string, size?: string) => void;
  onQuickBuy?: (product: Product, color?: string, size?: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
}

function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  onQuickBuy,
  isWishlisted = false,
  onToggleWishlist,
  isCompared = false,
  onToggleCompare,
}: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { formatPrice } = useCurrency();

  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [showRateSuccess, setShowRateSuccess] = useState<boolean>(false);

  const handleQuickRate = (e: React.MouseEvent, ratingValue: number) => {
    e.stopPropagation(); // Prevents opening product detail modal
    
    const newReview = {
      id: `rev_quick_${Date.now()}`,
      productId: product.id,
      userName: 'Verified Buyer',
      rating: ratingValue,
      comment: 'Submitted a quick star rating.',
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    try {
      const stored = localStorage.getItem('aura_custom_reviews');
      const allCustom = stored ? JSON.parse(stored) : [];
      allCustom.push(newReview);
      localStorage.setItem('aura_custom_reviews', JSON.stringify(allCustom));
    } catch (err) {
      console.error('Failed to save user rating:', err);
    }

    // Trigger global update
    window.dispatchEvent(new CustomEvent('aura-rating-updated'));

    setShowRateSuccess(true);
    setTimeout(() => {
      setShowRateSuccess(false);
    }, 2500);
  };

  let unitValueText = '';
  if (product.netWeightGram) {
    const pricePerGram = product.price / product.netWeightGram;
    unitValueText = `${formatPrice(pricePerGram)}/g`;
  } else if (product.unitCount) {
    const pricePerUnit = product.price / product.unitCount;
    unitValueText = `${formatPrice(pricePerUnit)}/${product.unitName || 'unit'}`;
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    onAddToCart(product, defaultColor, defaultSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleQuickBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    if (onQuickBuy) {
      onQuickBuy(product, defaultColor, defaultSize);
    }
  };

  // Product image gallery handling
  const cardGallery = React.useMemo(() => {
    const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80';
    let rawList: string[] = [];
    if (product.images && product.images.length > 0) {
      const clean = product.images.filter((img) => img && img.trim() !== '');
      if (product.image && product.image.trim() !== '' && !clean.includes(product.image)) {
        rawList = [product.image.trim(), ...clean];
      } else {
        rawList = clean;
      }
    } else if (product.image && product.image.trim() !== '') {
      rawList = [product.image.trim()];
    }

    if (rawList.length === 0) {
      return [FALLBACK_IMG];
    }
    return rawList;
  }, [product]);

  const [cardImageIndex, setCardImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleNextCardImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cardGallery.length <= 1) return;
    setCardImageIndex((prev) => (prev + 1) % cardGallery.length);
  };

  const handlePrevCardImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cardGallery.length <= 1) return;
    setCardImageIndex((prev) => (prev - 1 + cardGallery.length) % cardGallery.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 35;
    if (distance > minSwipeDistance && cardGallery.length > 1) {
      setCardImageIndex((prev) => (prev + 1) % cardGallery.length);
    } else if (distance < -minSwipeDistance && cardGallery.length > 1) {
      setCardImageIndex((prev) => (prev - 1 + cardGallery.length) % cardGallery.length);
    }
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-colors duration-200"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Target area for viewing details */}
      <div 
        id={`product-image-container-${product.id}`}
        className="relative aspect-4/3 cursor-pointer overflow-hidden bg-slate-50 dark:bg-slate-950 group/imgstage"
        onClick={() => onViewDetails(product)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={cardImageIndex}
            src={cardGallery[cardImageIndex] || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80'}
            alt={`${product.name} image ${cardImageIndex + 1}`}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.15 }}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover/imgstage:scale-105 select-none"
            referrerPolicy="no-referrer"
            draggable={false}
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80';
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />
        </AnimatePresence>

        {/* Previous / Next Slide Buttons for Card */}
        {cardGallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevCardImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-md backdrop-blur-xs opacity-0 group-hover/imgstage:opacity-100 transition-all hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextCardImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-md backdrop-blur-xs opacity-0 group-hover/imgstage:opacity-100 transition-all hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Dots indicator at bottom */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-slate-900/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
              {cardGallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCardImageIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === cardImageIndex 
                      ? 'w-3.5 bg-white' 
                      : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Slide to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          <span id={`product-badge-${product.id}`} className="rounded-full bg-white/90 dark:bg-slate-900/95 px-3 py-1 text-[11px] font-medium tracking-wide text-slate-800 dark:text-slate-200 backdrop-blur-xs shadow-xs uppercase">
            {product.category}
          </span>
          <span id={`discount-badge-${product.id}`} className="rounded-full bg-orange-600/95 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xs shadow-xs w-fit">
            20% OFF
          </span>
          {product.stock !== undefined && product.stock <= 5 && (
            <span
              id={`low-stock-badge-${product.id}`}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xs shadow-xs w-fit ${
                product.stock === 0 ? 'bg-rose-700/95' : 'bg-rose-600/95 animate-pulse'
              }`}
            >
              {product.stock === 0 ? 'OUT OF STOCK' : `ONLY ${product.stock} LEFT`}
            </span>
          )}
        </div>

        {/* Wishlist Heart Toggle Button */}
        <button
          id={`product-wishlist-btn-${product.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) onToggleWishlist(product.id);
          }}
          className={`absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs shadow-xs transition-transform hover:scale-105 hover:bg-white dark:hover:bg-slate-800 active:scale-95 focus:outline-none ${
            isWishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Compare Toggle Button */}
        {onToggleCompare && (
          <button
            id={`product-compare-btn-${product.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            className={`absolute top-14 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs shadow-xs transition-all hover:scale-110 active:scale-95 focus:outline-none ${
              isCompared 
                ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
            title={isCompared ? "Remove from comparison" : "Add to comparison"}
          >
            <ArrowLeftRight className={`h-3.5 w-3.5 ${isCompared ? 'stroke-[2.5px]' : ''}`} />
          </button>
        )}

        {/* Hover action bar overlay */}
        <div id={`product-overlay-${product.id}`} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            id={`product-view-btn-${product.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="flex w-32 items-center justify-center gap-1.5 rounded-full bg-white py-2 text-xs font-bold text-slate-900 shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </button>
          
          <button
            id={`product-overlay-quick-add-${product.id}`}
            type="button"
            disabled={isAdded}
            onClick={handleQuickAdd}
            className={`flex w-32 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
              isAdded
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added!
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Quick Add
              </>
            )}
          </button>

          <button
            id={`product-overlay-quick-buy-${product.id}`}
            type="button"
            onClick={handleQuickBuyClick}
            className="flex w-32 items-center justify-center gap-1.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white py-2 text-xs font-bold shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            Quick Buy
          </button>
        </div>
      </div>

      {/* Product Content info */}
      <div id={`product-info-${product.id}`} className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between min-h-[22px]">
          <div className="flex items-center gap-1.5" id={`product-rating-container-${product.id}`}>
            <div className="flex items-center gap-0.5 group/stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={(e) => handleQuickRate(e, star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-0.5 focus:outline-hidden transition-transform active:scale-125 cursor-pointer"
                  title={`Rate ${star} stars`}
                >
                  <Star
                    className={`h-3.5 w-3.5 transition-colors ${
                      (hoveredStar ? star <= hoveredStar : star <= Math.round(product.rating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-800'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {product.rating}
              <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                ({product.reviewsCount})
              </span>
            </span>
          </div>

          {/* Direct Rating Toast */}
          <AnimatePresence>
            {showRateSuccess && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/30"
              >
                Thank you!
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <h3 
          id={`product-title-${product.id}`}
          onClick={() => onViewDetails(product)}
          className="cursor-pointer text-base font-semibold leading-snug text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
        >
          {product.name}
        </h3>
        
        <p id={`product-desc-${product.id}`} className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Color preview indicators */}
        {product.colors && product.colors.length > 0 && (
          <div id={`product-colors-${product.id}`} className="mt-3.5 flex gap-1.5">
            {product.colors.map((color) => {
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
                  className={`h-2.5 w-2.5 rounded-full ${bgClass}`}
                />
              );
            })}
          </div>
        )}

        {/* Low Stock text indicator */}
        {product.stock !== undefined && product.stock <= 5 && (
          <div id={`product-stock-warning-${product.id}`} className="mt-3 flex items-center gap-1.5 animate-pulse">
            <span className={`h-1.5 w-1.5 rounded-full ${product.stock === 0 ? 'bg-rose-500' : 'bg-rose-500'}`} />
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              {product.stock === 0 ? 'Out of stock' : `Only ${product.stock} units left!`}
            </span>
          </div>
        )}

        {/* Price and Add button flexbox */}
        <div id={`product-action-footer-${product.id}`} className="mt-auto pt-4 flex flex-col gap-3.5 border-t border-slate-50 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
                <span className="text-xs text-rose-500 line-through opacity-85 font-medium">{formatPrice(Math.round(product.price * 1.25))}</span>
              </div>
              {unitValueText && (
                <span id={`product-unit-val-${product.id}`} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 animate-fadeIn">
                  ({unitValueText})
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id={`product-add-to-cart-${product.id}`}
              type="button"
              onClick={handleQuickAdd}
              disabled={isAdded}
              className={`flex h-9 items-center justify-center gap-1 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 shadow-xs cursor-pointer w-full ${
                isAdded
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-sm active:scale-95'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </>
              )}
            </button>

            <button
              id={`product-quick-buy-${product.id}`}
              type="button"
              onClick={handleQuickBuyClick}
              className="flex h-9 items-center justify-center gap-1 rounded-xl bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 text-white text-xs font-bold tracking-wide transition-all duration-300 shadow-xs hover:shadow-sm active:scale-95 cursor-pointer w-full"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              Buy
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ProductCard);
