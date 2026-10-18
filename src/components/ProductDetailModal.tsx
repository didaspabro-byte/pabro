import React, { useState, useEffect } from 'react';
import { Product, ProductReview, User as UserType } from '../types';
import { X, Star, CheckCircle2, ShoppingBag, Bell, Mail, Heart, Send, User, Share2, Check, ChevronLeft, ChevronRight, Sparkles, ZoomIn, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';
import { productReviews, products as defaultProducts } from '../data';

const getProductGallery = (prod: Product | null): string[] => {
  if (!prod) return [];
  const cleanImages = (prod.images || []).filter((img) => img && typeof img === 'string' && img.trim() !== '');
  const cleanBase = (prod.image && typeof prod.image === 'string' && prod.image.trim() !== '') ? prod.image.trim() : '';

  let list: string[] = [];
  if (cleanImages.length > 0) {
    if (cleanBase && !cleanImages.includes(cleanBase)) {
      list = [cleanBase, ...cleanImages];
    } else {
      list = cleanImages;
    }
  } else if (cleanBase) {
    list = [cleanBase];
  }

  if (list.length > 0) {
    return list;
  }
  
  // Custom high-quality Unsplash image presets based on product categories/names
  const fallbackGalleries: Record<string, string[]> = {
    'prod_1': [ // Aura Wireless Headphones
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=700&auto=format&fit=crop&q=80'
    ],
    'prod_2': [ // Vista Chronograph Smartwatch
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=700&auto=format&fit=crop&q=80'
    ],
    'prod_3': [ // Ergo Mechanical Keyboard
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541140111813-8222e9d90981?w=700&auto=format&fit=crop&q=80'
    ],
    'prod_4': [ // Seamless Merino Wool Hoodie
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=700&auto=format&fit=crop&q=80'
    ],
    'prod_5': [ // Commuter Field Backpack
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1575844810159-f831206f3630?w=700&auto=format&fit=crop&q=80'
    ],
    'prod_6': [ // Classic Trucker Jacket
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=700&auto=format&fit=crop&q=80'
    ]
  };

  if (fallbackGalleries[prod.id]) {
    return fallbackGalleries[prod.id];
  }

  // Fallback category mapping for newly added products in Admin Panel
  const lowerCat = prod.category.toLowerCase();
  const baseImg = prod.image;

  if (lowerCat.includes('tech') || lowerCat.includes('electronics')) {
    return [
      baseImg,
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=700&auto=format&fit=crop&q=80'
    ];
  } else if (lowerCat.includes('apparel') || lowerCat.includes('fashion') || lowerCat.includes('cloth')) {
    return [
      baseImg,
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&auto=format&fit=crop&q=80'
    ];
  } else if (lowerCat.includes('wellness') || lowerCat.includes('home') || lowerCat.includes('living')) {
    return [
      baseImg,
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700&auto=format&fit=crop&q=80'
    ];
  } else if (lowerCat.includes('sports') || lowerCat.includes('gear') || lowerCat.includes('fit')) {
    return [
      baseImg,
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=700&auto=format&fit=crop&q=80'
    ];
  } else if (lowerCat.includes('grocery') || lowerCat.includes('organic') || lowerCat.includes('beverage') || lowerCat.includes('pantry')) {
    return [
      baseImg,
      'https://images.unsplash.com/photo-1610832958506-ee5633619144?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=700&auto=format&fit=crop&q=80'
    ];
  } else {
    return [
      baseImg,
      'https://images.unsplash.com/photo-1531346878377-a5ec20888e57?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=700&auto=format&fit=crop&q=80'
    ];
  }
};

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color?: string, size?: string) => void;
  onQuickBuy?: (product: Product, color?: string, size?: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  products?: Product[];
  onViewProduct?: (product: Product) => void;
  currentUser?: UserType | null;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onQuickBuy,
  isWishlisted = false,
  onToggleWishlist,
  products: productsProp,
  onViewProduct,
  currentUser,
}: ProductDetailModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false);
  const [viewedHistory, setViewedHistory] = useState<Product[]>([]);
  const { formatPrice } = useCurrency();

  const handleGoBack = () => {
    if (viewedHistory.length === 0) return;
    const previous = viewedHistory[viewedHistory.length - 1];
    setViewedHistory((prev) => prev.slice(0, -1));
    if (onViewProduct) {
      onViewProduct(previous);
    }
  };

  useEffect(() => {
    if (!product) {
      setViewedHistory([]);
    }
  }, [product]);

  const unitValueText = product
    ? product.netWeightGram
      ? `${formatPrice(product.price / product.netWeightGram)}/g`
      : product.unitCount
      ? `${formatPrice(product.price / product.unitCount)}/${product.unitName || 'unit'}`
      : ''
    : '';

  // Image carousel states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseStartX, setMouseStartX] = useState<number | null>(null);

  const imagesToDisplay = getProductGallery(product);

  const handleNextImage = () => {
    if (imagesToDisplay.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % imagesToDisplay.length);
  };

  const handlePrevImage = () => {
    if (imagesToDisplay.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + imagesToDisplay.length) % imagesToDisplay.length);
  };

  // Keyboard arrow keys for image sliding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!product || imagesToDisplay.length <= 1) return;
      if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, imagesToDisplay.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 40;
    if (distance > minSwipeDistance) {
      handleNextImage();
    } else if (distance < -minSwipeDistance) {
      handlePrevImage();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setMouseStartX(e.clientX);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown || mouseStartX === null) return;
    const distance = mouseStartX - e.clientX;
    const minDragDistance = 40;
    if (distance > minDragDistance) {
      handleNextImage();
    } else if (distance < -minDragDistance) {
      handlePrevImage();
    }
    setIsMouseDown(false);
    setMouseStartX(null);
  };

  // Reviews integration states
  const [reviewsList, setReviewsList] = useState<ProductReview[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>(() => currentUser?.name || '');
  const [isSubmitSuccess, setIsSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser?.name) {
      setNewUserName(currentUser.name);
    }
  }, [currentUser]);

  const loadReviews = () => {
    if (!product) return;
    
    const defaultReviews = productReviews.filter((r) => r.productId === product.id);
    
    let customReviews: ProductReview[] = [];
    try {
      const stored = localStorage.getItem('aura_custom_reviews');
      if (stored) {
        const allCustom: ProductReview[] = JSON.parse(stored);
        customReviews = allCustom.filter((r) => r.productId === product.id);
      }
    } catch (e) {
      console.error('Error reading custom reviews:', e);
    }
    
    const combined = [...customReviews, ...defaultReviews];
    const uniqueMap = new Map<string, ProductReview>();
    combined.forEach((rev) => {
      if (rev && rev.id && !uniqueMap.has(rev.id)) {
        uniqueMap.set(rev.id, rev);
      }
    });
    setReviewsList(Array.from(uniqueMap.values()));
  };

  // Sync state with product reviews
  useEffect(() => {
    if (!product) return;
    loadReviews();
    setNewRating(5);
    setNewComment('');
    setNewUserName('');
    setIsSubmitSuccess(false);
  }, [product]);

  useEffect(() => {
    window.addEventListener('aura-rating-updated', loadReviews);
    return () => {
      window.removeEventListener('aura-rating-updated', loadReviews);
    };
  }, [product]);

  const currentReviewsCount = reviewsList.length;
  const currentAverageRating = currentReviewsCount > 0
    ? Number((reviewsList.reduce((sum, r) => sum + r.rating, 0) / currentReviewsCount).toFixed(1))
    : product?.rating || 0;

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!newUserName.trim() || !newComment.trim()) return;

    const newReview: ProductReview = {
      id: `rev_custom_${Date.now()}`,
      productId: product.id,
      userName: newUserName.trim(),
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    try {
      const stored = localStorage.getItem('aura_custom_reviews');
      const allCustom: ProductReview[] = stored ? JSON.parse(stored) : [];
      allCustom.push(newReview);
      localStorage.setItem('aura_custom_reviews', JSON.stringify(allCustom));
    } catch (err) {
      console.error('Failed to save user review:', err);
    }

    setReviewsList((prev) => [newReview, ...prev]);
    setNewComment('');
    setNewUserName('');
    setIsSubmitSuccess(true);

    // Trigger global update to refresh ratings across the app
    window.dispatchEvent(new CustomEvent('aura-rating-updated'));

    setTimeout(() => {
      setIsSubmitSuccess(false);
    }, 4500);
  };

  const [isCopied, setIsCopied] = useState(false);

  // Material inspection zoom states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsZoomed(!isZoomed);
  };

  // Reset zoom when image slide changes
  useEffect(() => {
    setIsZoomed(false);
  }, [currentImageIndex]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }).catch((err) => {
      console.error('Failed to copy product link:', err);
    });
  };

  const handleShare = () => {
    if (!product) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: shareUrl,
      }).catch((err) => {
        console.log('Share cancelled or failed, falling back to clipboard copy', err);
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  // Initialize selected options when product changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : '');
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
      setIsAdded(false);
      setCurrentImageIndex(0);
    }
  }, [product]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [email, setEmail] = useState('didaspabro@gmail.com');
  const [isAlertSubscribed, setIsAlertSubscribed] = useState(false);
  const [isAlertSubmitting, setIsAlertSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (product) {
      const saved = localStorage.getItem('price_alerts');
      if (saved) {
        try {
          const alerts: any[] = JSON.parse(saved);
          const exists = alerts.some((a) => a.productId === product.id);
          setIsAlertSubscribed(exists);
          if (exists) {
            const found = alerts.find((a) => a.productId === product.id);
            if (found) setEmail(found.email);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setIsAlertSubscribed(false);
      }
    }
  }, [product]);

  // Similar Products Calculation and Carousel Ref
  const carouselRef = React.useRef<HTMLDivElement>(null);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, selectedColor || undefined, selectedSize || undefined);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleQuickBuy = () => {
    if (onQuickBuy) {
      onQuickBuy(product, selectedColor || undefined, selectedSize || undefined);
    }
  };

  const handleSubscribeAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setAlertMessage('Please enter a valid email address.');
      return;
    }
    
    setIsAlertSubmitting(true);
    
    setTimeout(() => {
      const saved = localStorage.getItem('price_alerts');
      let alerts: any[] = [];
      if (saved) {
        try {
          alerts = JSON.parse(saved);
        } catch (e) {}
      }
      
      alerts = alerts.filter((a) => a.productId !== product.id);
      alerts.push({
        productId: product.id,
        productName: product.name,
        email: email,
        initialPrice: product.price,
        subscribedAt: new Date().toISOString()
      });
      
      localStorage.setItem('price_alerts', JSON.stringify(alerts));
      setIsAlertSubscribed(true);
      setIsAlertSubmitting(false);
      setAlertMessage(`Alert set successfully! We'll notify you at ${email} when the price drops.`);
      setTimeout(() => setAlertMessage(''), 4000);
    }, 800);
  };

  const handleUnsubscribeAlert = () => {
    const saved = localStorage.getItem('price_alerts');
    if (saved) {
      try {
        let alerts: any[] = JSON.parse(saved);
        alerts = alerts.filter((a) => a.productId !== product.id);
        localStorage.setItem('price_alerts', JSON.stringify(alerts));
      } catch (e) {}
    }
    setIsAlertSubscribed(false);
    setAlertMessage('You have unsubscribed from price alerts.');
    setTimeout(() => setAlertMessage(''), 4000);
  };

  const allProductsList = productsProp || (() => {
    try {
      const stored = localStorage.getItem('aura_shop_products');
      if (stored) return JSON.parse(stored) as Product[];
    } catch (e) {}
    return defaultProducts;
  })();

  const similarProducts = allProductsList.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 220; // card size + gap
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="product-detail-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs md:p-6"
        onClick={onClose}
      >
        <motion.div
          id="product-detail-modal"
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-2xl transition-colors duration-200"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Back button */}
          <button
            id="modal-header-back-btn"
            type="button"
            onClick={viewedHistory.length > 0 ? handleGoBack : onClose}
            className="absolute top-4 left-4 z-10 flex h-10 px-4 items-center gap-1.5 rounded-full bg-white/80 dark:bg-slate-950/80 text-slate-750 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800 shadow-sm backdrop-blur-xs transition-transform hover:scale-105 active:scale-95 hover:bg-white dark:hover:bg-slate-850 cursor-pointer text-xs font-bold"
            title={viewedHistory.length > 0 ? "Back to previous product" : "Back to catalog"}
          >
            <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>{viewedHistory.length > 0 ? "Back" : "Back to Catalog"}</span>
          </button>

          {/* Share button */}
          <button
            id="modal-header-share-btn"
            type="button"
            onClick={handleShare}
            className="absolute top-4 right-16 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-xs transition-transform hover:scale-105 active:scale-95 hover:bg-white dark:hover:bg-slate-850 cursor-pointer"
            title="Share this product"
          >
            {isCopied ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          </button>

          <AnimatePresence>
            {isCopied && (
              <motion.span
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 44, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute top-10 right-16 bg-slate-950 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg pointer-events-none whitespace-nowrap shadow-md z-20 flex items-center gap-1 border border-slate-800"
              >
                <Check className="h-3 w-3 text-emerald-400" />
                Link Copied!
              </motion.span>
            )}
          </AnimatePresence>

          {/* Close button */}
          <button
            id="modal-close-btn"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-xs transition-transform hover:scale-105 active:scale-95 hover:bg-white dark:hover:bg-slate-850"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image side with Carousel */}
            <div id="modal-image-panel" className="relative bg-slate-50 dark:bg-slate-950/60 p-6 md:p-8 flex flex-col gap-4 items-center justify-center">
              {/* Active Image Stage with Animated Carousel */}
              <div 
                id="image-carousel-stage"
                className={`relative aspect-auto md:aspect-4/3 w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800/80 shadow-xs group transition-all duration-300 ${
                  isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleImageClick}
              >
                {/* Premium Material Detail Zoom Indicator */}
                <div className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/75 text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-sm pointer-events-none transition-opacity duration-300 ${
                  isZoomed ? 'opacity-0' : 'opacity-100'
                }`}>
                  <ZoomIn className="h-3 w-3 text-orange-400" />
                  <span>Inspect Materials</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={imagesToDisplay[currentImageIndex] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80'}
                    alt={`${product.name} perspective ${currentImageIndex + 1}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full w-full object-cover object-center select-none aspect-4/3"
                    style={{
                      transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                      transformOrigin: isZoomed ? `${zoomPos.x}% ${zoomPos.y}%` : 'center center',
                      transition: isZoomed ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out'
                    }}
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

                {/* Left Arrow button */}
                {imagesToDisplay.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm hover:bg-white active:scale-90 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}

                {/* Right Arrow button */}
                {imagesToDisplay.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm hover:bg-white active:scale-90 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}

                {/* Dots indicator at the bottom edge */}
                {imagesToDisplay.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-slate-900/40 px-2 py-1 rounded-full backdrop-blur-xs">
                    {imagesToDisplay.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(i);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          i === currentImageIndex 
                            ? 'w-3.5 bg-white' 
                            : 'w-1.5 bg-white/50 hover:bg-white/85'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails strip below */}
              {imagesToDisplay.length > 1 && (
                <div id="carousel-thumbnails-strip" className="flex items-center justify-center w-full gap-2 overflow-x-auto py-1 scrollbar-none">
                  {imagesToDisplay.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentImageIndex(i)}
                      className={`relative aspect-4/3 w-14 md:w-16 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border-2 cursor-pointer transition-all hover:scale-[1.03] shrink-0 ${
                        i === currentImageIndex 
                          ? 'border-orange-505 shadow-xs ring-2 ring-orange-500/10' 
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${product.name} thumb ${i + 1}`}
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
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content side */}
            <div id="modal-content-panel" className="flex flex-col p-6 md:p-8 max-h-[85vh] overflow-y-auto">
              <button
                id="content-back-btn"
                type="button"
                onClick={viewedHistory.length > 0 ? handleGoBack : onClose}
                className="self-start mb-4 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>{viewedHistory.length > 0 ? "Back to previous product" : "Back to catalog"}</span>
              </button>

              <span id="modal-category" className="self-start rounded-full bg-orange-50 dark:bg-orange-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 border border-orange-100/60 dark:border-orange-900/30">
                {product.category}
              </span>

              <h2 id="modal-title" className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                {product.name}
              </h2>

              {/* Reviews */}
              <div id="modal-reviews" className="mt-2.5 flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(currentAverageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{currentAverageRating}</span>
                <span className="text-xs text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('product-reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:underline transition-colors focus:outline-none"
                >
                  {currentReviewsCount} customer {currentReviewsCount === 1 ? 'review' : 'reviews'}
                </button>
              </div>

              {/* Price */}
              <div id="modal-price" className="mt-5 flex items-center flex-wrap gap-2.5">
                <span className="text-3xl font-extrabold text-slate-950 dark:text-white">{formatPrice(product.price)}</span>
                <span className="text-lg font-medium text-rose-500 line-through opacity-85">{formatPrice(Math.round(product.price * 1.25))}</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-rose-500 px-2.5 py-0.5 rounded-full shadow-xs">
                  20% OFF DISCOUNT
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-sm">In Stock</span>
                {unitValueText && (
                  <span id="modal-value-per-unit-badge" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-full border border-indigo-150 dark:border-indigo-900/35">
                    Value: {unitValueText}
                  </span>
                )}
                
                {/* Notify Me on Price Drop button */}
                <button
                  id="fast-notify-price-drop-btn"
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('price-drop-alert-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 dark:hover:bg-orange-500/5 flex items-center gap-1.5 transition-all focus:outline-none cursor-pointer border border-orange-200 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20 px-3 py-1.5 rounded-full shadow-xs"
                >
                  <Bell className="h-3.5 w-3.5 animate-pulse text-orange-500" />
                  Notify Me on Price Drop
                </button>
              </div>

              {/* Short explanation */}
              <p id="modal-long-desc" className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {product.description}
              </p>

              {/* Color selector */}
              {product.colors && product.colors.length > 0 && (
                <div id="modal-color-selector" className="mt-6 font-sans">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Selected Color: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedColor}</span>
                  </span>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold border transition-all ${
                          selectedColor === color
                            ? 'bg-slate-950 dark:bg-orange-600 text-white border-slate-950 dark:border-orange-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-705 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div id="modal-size-selector" className="mt-5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Selected Size: <span className="font-medium text-slate-800">{selectedSize}</span>
                  </span>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold border transition-all ${
                          selectedSize === size
                            ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical features list */}
              <div id="modal-features-list" className="mt-6 border-t border-slate-100 pt-5">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Product Highlights</span>
                <ul className="mt-3 space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-orange-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Drop Alert Section */}
              <div id="price-drop-alert-section" className="mt-6 border-t border-slate-100 pt-5">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Price Drop Alert</span>
                  </div>
                  
                  {isAlertSubscribed ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600">
                        You're set! We will email <b className="text-slate-800 font-semibold">{email}</b> if the price drops below <span className="font-bold text-slate-900">{formatPrice(product.price)}</span>.
                      </p>
                      <button
                        type="button"
                        onClick={handleUnsubscribeAlert}
                        className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1"
                      >
                        Cancel Notification Alert
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribeAlert} className="space-y-3">
                      <p className="text-xs text-slate-500">
                        Never miss a sale! Enter your email to be notified instantly when this item is discounted.
                      </p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <Mail className="h-3.5 w-3.5" />
                          </span>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 focus:outline-none transition-colors"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isAlertSubmitting}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 shrink-0 disabled:opacity-75 cursor-pointer"
                        >
                          {isAlertSubmitting ? (
                            <span>Subscribing...</span>
                          ) : (
                            <>
                              <Bell className="h-3.5 w-3.5" />
                              <span>Notify Me</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                  
                  <AnimatePresence>
                    {alertMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mt-2 text-[10px] text-center font-bold text-orange-500"
                      >
                        {alertMessage}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Product User Reviews Segment */}
              <div id="product-reviews-section" className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Customer Feedbacks</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Real opinions from verified shoppers</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-slate-800">{currentAverageRating}</span>
                    <span className="text-[10px] text-slate-400 block">based on {currentReviewsCount} ratings</span>
                  </div>
                </div>

                {/* Stars Breakdown */}
                <div className="grid grid-cols-5 gap-1.5 items-center bg-slate-50/60 rounded-xl p-3 border border-slate-100 mb-5">
                  <div className="col-span-2 text-center border-r border-slate-200/60 pr-2">
                    <div className="flex items-center justify-center text-amber-400 gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3.5 w-3.5 ${star <= Math.round(currentAverageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-500">Average Rating</span>
                  </div>
                  <div className="col-span-3 text-[11px] text-slate-500 pl-2 space-y-1">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviewsList.filter(r => r.rating === stars).length;
                      const percentage = currentReviewsCount > 0 ? (count / currentReviewsCount) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-1.5">
                          <span className="w-3 text-right font-semibold">{stars}★</span>
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="w-4 text-slate-400 text-[10px]">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1.5 mb-6 scrollbar-thin">
                  {reviewsList.length === 0 ? (
                    <div id="reviews-empty-state" className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                      <p className="text-xs text-slate-400">No reviews yet. Be the first to tell us what you think!</p>
                    </div>
                  ) : (
                    reviewsList.map((rev, idx) => (
                      <div key={rev.id ? `${rev.id}_${idx}` : `rev-${idx}`} id={`review-card-${rev.id || idx}`} className="p-3.5 bg-white rounded-2xl border border-slate-100/80 shadow-xs">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-[10px] font-bold text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40 uppercase">
                              {rev.userName.charAt(0)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 block leading-tight">{rev.userName}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((sVal) => (
                              <Star key={sVal} className={`h-3 w-3 ${sVal <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs leading-normal text-slate-600 italic pl-1.5 border-l-2 border-orange-200 dark:border-orange-800 bg-slate-50/20 py-1 rounded-r-md">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-orange-500" />
                    Share Your Feedback
                  </h4>

                  {isSubmitSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-xl bg-emerald-50 border border-emerald-150 p-3 text-center"
                    >
                      <p className="text-xs font-semibold text-emerald-800">🎉 Thank you! Your review was successfully published.</p>
                      <p className="text-[10px] text-emerald-600 mt-1">Your feedback helps our community of minimalist aficionados.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleAddReviewSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Your Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Alaba S."
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Review Score</label>
                          <div className="flex items-center gap-1.5 h-9 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setNewRating(value)}
                                className="focus:outline-none hover:scale-110 active:scale-95 transition-transform"
                                title={`Rate ${value} out of 5 stars`}
                              >
                                <Star
                                  className={`h-4.5 w-4.5 ${
                                    value <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold text-slate-500 ml-1.5">{newRating}/5</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Your Opinion / Comment</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="How was your experience using this product? What do you like best?"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex h-10 items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-slate-950 dark:text-white font-extrabold text-xs uppercase tracking-widest cursor-pointer transition-colors"
                      >
                        <Send className="h-3 w-3" />
                        Submit My Product Feedback
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Footer CTA */}
              <div id="modal-footer-cta" className="mt-8 border-t border-slate-100 pt-6 flex flex-col gap-3">
                {/* Primary Quick Buy Action */}
                <button
                  id="modal-quick-buy-btn"
                  type="button"
                  onClick={handleQuickBuy}
                  className="w-full flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold tracking-wide transition-all shadow-md bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98] cursor-pointer"
                >
                  <Zap className="h-4 w-4 fill-amber-300 text-amber-300 animate-pulse" />
                  <span>Quick Buy (Checkout Now)</span>
                </button>

                {/* Secondary Actions Row */}
                <div className="flex gap-3">
                  <button
                    id="modal-add-to-cart-btn"
                    type="button"
                    onClick={handleAddToCart}
                    className={`flex-1 flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-semibold tracking-wide transition-all shadow-xs ${
                      isAdded
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-950 text-white hover:bg-slate-800 active:scale-[0.98]'
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {isAdded ? 'Added to Shopping Bag!' : 'Add to Shopping Bag'}
                  </button>
                  <button
                    id="modal-wishlist-toggle-btn"
                    type="button"
                    onClick={() => onToggleWishlist?.(product.id)}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all shrink-0 ${
                      isWishlisted
                        ? 'border-rose-250 bg-rose-50 text-rose-500 hover:bg-rose-100'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                  <button
                    id="modal-share-btn"
                    type="button"
                    onClick={handleShare}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all relative shrink-0 ${
                      isCopied
                        ? 'border-emerald-250 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                    title="Copy direct product link to clipboard"
                  >
                    <AnimatePresence>
                      {isCopied && (
                        <motion.span
                          initial={{ opacity: 0, y: 10, scale: 0.9, x: '-50%' }}
                          animate={{ opacity: 1, y: -45, scale: 1, x: '-50%' }}
                          exit={{ opacity: 0, y: 10, scale: 0.9, x: '-50%' }}
                          className="absolute left-1/2 bg-slate-950 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg pointer-events-none whitespace-nowrap shadow-md z-20 flex items-center gap-1 border border-slate-800"
                        >
                          <Check className="h-3 w-3 text-emerald-400" />
                          Link Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                      {isCopied ? (
                        <motion.div
                          key="copied"
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.7, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Check className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="share"
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.7, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Share2 className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
                <p id="modal-cta-note" className="mt-2.5 text-center text-[10px] text-slate-400">
                  Delivery: UGX 7,000 for Kampala, UGX 3,000 for Entebbe. Lifetime returns supported.
                </p>
              </div>

              {/* Similar Products Carousel Segment */}
              {similarProducts.length > 0 && (
                <div id="similar-products-section" className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 font-sans">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5 matches-title">
                        <Sparkles className="h-4 w-4 text-orange-500 dark:text-orange-400 animate-pulse" />
                        Similar Products
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Explore matching items from the {product.category} collection</p>
                    </div>
                    {similarProducts.length > 1 && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => scrollCarousel('left')}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-705 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
                          aria-label="Previous similar product"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollCarousel('right')}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-705 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
                          aria-label="Next similar product"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div 
                    ref={carouselRef}
                    id="similar-products-carousel-track"
                    className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-none"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {similarProducts.map((p) => (
                      <div
                        key={p.id}
                        id={`similar-prod-${p.id}`}
                        onClick={() => {
                          if (product) {
                            setViewedHistory((prev) => [...prev, product]);
                          }
                          onViewProduct?.(p);
                          setCurrentImageIndex(0);
                        }}
                        className="flex-none w-[200px] snap-start group bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 shadow-3xs"
                      >
                        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-white dark:bg-slate-950 border border-slate-100/60 dark:border-slate-850">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80'}
                            alt={p.name}
                            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80';
                              if (target.src !== fallback) {
                                target.src = fallback;
                              }
                            }}
                          />
                          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-slate-950/70 dark:bg-slate-900/80 px-2 py-0.5 text-[9px] font-bold text-white select-none">
                            ★ {p.rating}
                          </span>
                        </div>
                        <h4 className="mt-2 text-xs font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
                          {p.name}
                        </h4>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-955 dark:text-orange-400">
                            {formatPrice(p.price)}
                          </span>
                          <span className="text-[9px] font-semibold text-orange-600 dark:text-orange-450 hover:underline uppercase block tracking-wider">
                            Explore
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
