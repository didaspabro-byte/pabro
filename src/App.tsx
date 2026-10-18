/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { products } from './data';
import { Product, CartItem, Order, Category, FilterPreset, User as UserType } from './types';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import ProductCompareModal from './components/ProductCompareModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderHistory from './components/OrderHistory';
import WishlistPage from './components/WishlistPage';
import FaqSection from './components/FaqSection';
import AdminPanel from './components/AdminPanel';
import AdminOrderNotificationBar from './components/AdminOrderNotificationBar';
import ManagePresetsModal from './components/ManagePresetsModal';
import OrderTrackingLookupModal from './components/OrderTrackingLookupModal';
import AiShoppingAssistant from './components/AiShoppingAssistant';
import SupportChatWidget from './components/SupportChatWidget';
import ContactHelpModal from './components/ContactHelpModal';
const AuthModal = React.lazy(() => import('./components/AuthModal'));
const UserProfileSettings = React.lazy(() => import('./components/UserProfileSettings'));
import { ShoppingBag, Search, SlidersHorizontal, Archive, Sparkles, Check, ChevronDown, Heart, Timer, X, Crown, ShieldCheck, Sun, Moon, Mail, ArrowRight, Bell, ArrowLeftRight, Mic, MicOff, Settings, Undo, RotateCcw, Save, Tag, ArrowUp, LogIn, LogOut, User, Lock, ShieldAlert, Shield, Truck, Headphones, MessageSquare, Building2, MapPin, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from './context/CurrencyContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { auth } from './lib/firebase';
import { playAdminOrderChime } from './lib/soundUtils';
import { 
  seedDatabaseIfEmpty, 
  getFirestoreProducts, 
  addFirestoreProduct, 
  deleteFirestoreProduct, 
  getFirestoreCategories, 
  saveFirestoreCategories, 
  getFirestoreOrders, 
  saveFirestoreOrder, 
  deleteFirestoreOrder,
  updateFirestoreOrderStatus, 
  getFirestoreReviews, 
  addFirestoreReview, 
  getFirestoreUserProfile, 
  saveFirestoreUserProfile 
} from './lib/db';

export function ShopCornerIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <div className="relative group flex items-center justify-center">
      <svg
        className={`${className} transition-transform duration-300 group-hover:scale-110`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="100%" stopColor="#ffedd5" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        
        {/* Sleek soft orange background for geometric contrast */}
        <rect x="15" y="15" width="70" height="70" rx="20" fill="url(#iconGradient)" className="opacity-80 dark:opacity-20" />
        <rect x="15" y="15" width="70" height="70" rx="20" stroke="currentColor" strokeWidth="2.5" className="text-slate-200 dark:text-slate-800" />
        
        {/* Elegant shopping bag handle */}
        <path d="M38 38C38 31.37 43.37 26 50 26C56.63 26 62 31.37 62 38" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" className="text-slate-800 dark:text-slate-100" />
        
        {/* Main bag structural container with precise alignments */}
        <path d="M30 42H70V72C70 75.31 67.31 78 64 78H36C32.69 78 30 75.31 30 72V42Z" fill="currentColor" className="text-white dark:text-slate-900" />
        <path d="M30 42H70V72C70 75.31 67.31 78 64 78H36C32.69 78 30 75.31 30 72V42Z" stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round" className="text-slate-800 dark:text-slate-100" />
        
        {/* Highlighted diagonal corner segment in rich brand-orange */}
        <path d="M54 42H70V58" stroke="url(#accentGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M70 72C70 75.31 67.31 78 64 78H50" stroke="url(#accentGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Spark dot of minimalist excellence */}
        <circle cx="78" cy="22" r="5" fill="url(#accentGradient)" />
      </svg>
      {/* Decorative ambient ring glow for subtle depth */}
      <span className="absolute -inset-1 rounded-full bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
    </div>
  );
}

const getFallbackStock = (id: string): number => {
  const stockMap: Record<string, number> = {
    'prod_1': 15,
    'prod_2': 3,  // Low Stock
    'prod_3': 24,
    'prod_4': 0,  // Out of Stock
    'prod_5': 5,  // Low Stock (Threshold <= 5)
    'prod_6': 32,
    'prod_7': 1,  // Low Stock
    'prod_8': 18,
    'prod_9': 4,  // Low Stock
    'prod_10': 11,
    'prod_11': 22,
    'prod_12': 2, // Low Stock
    'prod_13': 8,
    'prod_14': 40,
    'prod_15': 14,
    'prod_16': 0, // Out of Stock
    'prod_17': 19,
    'prod_18': 7,
  };
  if (stockMap[id] !== undefined) return stockMap[id];
  return 12;
};

const mergeCarts = (localCart: CartItem[], remoteCart: CartItem[]): CartItem[] => {
  const merged = [...localCart];
  for (const remoteItem of remoteCart) {
    const existingIndex = merged.findIndex(
      (localItem) =>
        localItem.product.id === remoteItem.product.id &&
        localItem.selectedColor === remoteItem.selectedColor &&
        localItem.selectedSize === remoteItem.selectedSize
    );
    if (existingIndex > -1) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        quantity: merged[existingIndex].quantity + remoteItem.quantity
      };
    } else {
      merged.push(remoteItem);
    }
  }
  return merged;
};

export default function App() {
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('aura_shop_theme');
      if (stored === 'dark' || stored === 'light') return stored;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('aura_shop_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to apply theme:', e);
    }
  }, [theme]);

  // Navigation & Page Layout
  const [activeTab, setActiveTab] = useState<'store' | 'wishlist' | 'history' | 'admin' | 'profile'>('store');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Live Admin Order Alert Notifications
  const [adminOrderAlert, setAdminOrderAlert] = useState<Order | null>(null);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('aura_admin_sound_alert') !== 'false';
  });
  const [unreadAdminOrdersCount, setUnreadAdminOrdersCount] = useState<number>(0);

  const handleToggleSound = () => {
    const next = !soundAlertsEnabled;
    setSoundAlertsEnabled(next);
    localStorage.setItem('aura_admin_sound_alert', String(next));
    if (next) {
      playAdminOrderChime();
    }
  };

  // User Authentication states
  const [currentUser, setCurrentUser] = useLocalStorage<UserType | null>('aura_shop_user', null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Handle Session Persistence check for local/fallback sessions
  useEffect(() => {
    const isRemembered = localStorage.getItem('aura_remember_me') !== 'false';
    const hasSessionActive = sessionStorage.getItem('aura_session_active') === 'true';
    
    if (!isRemembered && !hasSessionActive) {
      localStorage.removeItem('aura_shop_user');
      setCurrentUser(null);
    }
    
    sessionStorage.setItem('aura_session_active', 'true');
  }, [setCurrentUser]);

  // Subscribe to Firebase Auth state changes with deferred/lazy module loading
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let active = true;

    import('firebase/auth')
      .then(({ onAuthStateChanged }) => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            try {
              const profile = await getFirestoreUserProfile(fbUser.uid);
              if (profile) {
                setCurrentUser(profile);
              } else {
                // Profile fallback
                const isAdmin = fbUser.email?.toLowerCase() === 'admin@aura.com' || fbUser.email?.toLowerCase().includes('admin') || fbUser.email?.toLowerCase() === 'didaspabro@gmail.com';
                const role = isAdmin ? 'Admin' : 'Customer';
                const defaultProfile: UserType = {
                  id: fbUser.uid,
                  name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Aura Member',
                  email: fbUser.email || '',
                  role: role,
                  isAdmin: isAdmin,
                  shippingAddress: {
                    fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Aura Member',
                    email: fbUser.email || '',
                    address: '',
                    city: '',
                    postalCode: '',
                    country: 'Uganda'
                  }
                };
                await saveFirestoreUserProfile(fbUser.uid, defaultProfile);
                setCurrentUser(defaultProfile);
              }
            } catch (e) {
              console.error('[Firebase] Error synchronizing Auth with Firestore profile:', e);
            }
          } else {
            // Keep active fallback sessions alive; only clear standard Firebase user sessions
            const stored = localStorage.getItem('aura_shop_user');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (parsed && (parsed.isFallback || parsed.id?.startsWith('fb_') || parsed.id?.startsWith('user-'))) {
                  // It's a fallback user, keep them logged in!
                  return;
                }
              } catch (e) {}
            }
            setCurrentUser(null);
          }
        });
      })
      .catch((err) => {
        console.error('[Firebase] Failed to load auth module deferred:', err);
      });

    return () => {
      active = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setCurrentUser]);

  const handleLoginSuccess = useCallback((user: UserType) => {
    setCurrentUser(user);
    setVoiceNotification(`Welcome back, ${user.name}! Enjoy your Aura session.`);
    setTimeout(() => setVoiceNotification(null), 5000);
  }, [setCurrentUser]);

  const handleLogout = useCallback(async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (e) {
      console.warn('[Firebase] Sign out error:', e);
    }
    try {
      localStorage.removeItem('aura_shop_user');
    } catch {}
    setCurrentUser(null);
    setUserDropdownOpen(false);
    setVoiceNotification('Signed out of Aura membership securely.');
    setTimeout(() => setVoiceNotification(null), 4000);
    if (activeTab === 'admin') {
      setActiveTab('store');
    }
  }, [setCurrentUser, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Storage and Shopping Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartSyncStatus, setCartSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const lastSyncUserIdRef = useRef<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load and merge cart from Firestore when user logs in or shifts accounts
  useEffect(() => {
    if (!currentUser) {
      lastSyncUserIdRef.current = null;
      return;
    }

    if (lastSyncUserIdRef.current === currentUser.id) {
      return; // Already loaded/merged for this user
    }

    async function loadAndMergeUserCart() {
      try {
        console.log('[Firebase] Fetching user profile from cloud to synchronize shopping cart...');
        const latestProfile = await getFirestoreUserProfile(currentUser.id);
        if (latestProfile) {
          if (latestProfile.cart && latestProfile.cart.length > 0) {
            setCart((currentLocalCart) => {
              const merged = mergeCarts(currentLocalCart, latestProfile.cart || []);
              localStorage.setItem('aura_shop_cart', JSON.stringify(merged));
              return merged;
            });
          }
          // Also sync the local currentUser profile state with any remote profile properties
          setCurrentUser(latestProfile);
        }
        lastSyncUserIdRef.current = currentUser.id;
      } catch (e) {
        console.error('[Firebase] Failed to load & merge cart on user login:', e);
      }
    }

    loadAndMergeUserCart();
  }, [currentUser?.id, setCurrentUser]);

  // Periodic/debounced auto-save shopping cart to user's Firestore profile
  const cartSerialized = JSON.stringify(cart);
  const currentUserId = currentUser?.id;

  useEffect(() => {
    if (!currentUserId) {
      setCartSyncStatus('idle');
      return;
    }

    // Skip the first update immediately after mount/user-shift if the cart hasn't been synced/loaded yet
    if (lastSyncUserIdRef.current !== currentUserId) {
      return;
    }

    setCartSyncStatus('syncing');

    const timer = setTimeout(async () => {
      try {
        const latestCart = JSON.parse(cartSerialized);
        const latestProfile = await getFirestoreUserProfile(currentUserId);
        if (latestProfile) {
          const updatedProfile = {
            ...latestProfile,
            cart: latestCart
          };
          await saveFirestoreUserProfile(currentUserId, updatedProfile);
          setCurrentUser(updatedProfile);
          setCartSyncStatus('synced');
        } else {
          setCartSyncStatus('error');
        }
      } catch (error) {
        console.error('[Firebase] Failed to auto-save cart:', error);
        setCartSyncStatus('error');
      }
    }, 2500); // 2.5 seconds debounce

    return () => {
      clearTimeout(timer);
    };
  }, [cartSerialized, currentUserId, setCurrentUser]);

  // Product image & data sanitizer
  const sanitizeProductImage = (p: any): Product => {
    const DEFAULT_FALLBACK_URL = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80';
    const cleanImage = (p.image && typeof p.image === 'string' && p.image.trim() !== '') ? p.image.trim() : DEFAULT_FALLBACK_URL;
    let cleanImages: string[] = [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      cleanImages = p.images.filter((img: any) => typeof img === 'string' && img.trim() !== '');
    }
    if (cleanImages.length === 0) {
      cleanImages = [cleanImage];
    } else if (!cleanImages.includes(cleanImage)) {
      cleanImages = [cleanImage, ...cleanImages];
    }

    return {
      ...p,
      image: cleanImage,
      images: cleanImages,
      stock: p.stock !== undefined ? p.stock : getFallbackStock(p.id)
    };
  };

  // Premium Products Inventory State
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('aura_shop_products');
      const loaded = stored ? JSON.parse(stored) : products;
      return loaded.map((p: any) => sanitizeProductImage(p));
    } catch (e) {
      console.error('Failed to read products from localStorage:', e);
      return products.map((p) => sanitizeProductImage(p));
    }
  });

  // Persistent Product syncing
  useEffect(() => {
    try {
      localStorage.setItem('aura_shop_products', JSON.stringify(allProducts));
    } catch (e) {
      console.error('Failed to write products to localStorage:', e);
    }
  }, [allProducts]);

  // Synchronize allProducts ratings with any custom reviews
  const syncProductRatings = () => {
    setAllProducts((prevProducts) => {
      const stored = localStorage.getItem('aura_custom_reviews');
      let customReviews: any[] = [];
      try {
        if (stored) customReviews = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }

      return prevProducts.map((p) => {
        // Find baseline product from original list to avoid accumulating edits
        const original = products.find((orig) => orig.id === p.id);
        const baseRating = original?.rating || p.rating || 0;
        const baseCount = original?.reviewsCount || p.reviewsCount || 0;

        const prodReviews = customReviews.filter((r) => r.productId === p.id);
        const totalCount = baseCount + prodReviews.length;
        const totalSum = (baseRating * baseCount) + prodReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalCount > 0 ? Number((totalSum / totalCount).toFixed(1)) : 0;

        // Only return new object if values actually changed to avoid infinite renders
        if (p.rating === averageRating && p.reviewsCount === totalCount) {
          return p;
        }
        return {
          ...p,
          rating: averageRating,
          reviewsCount: totalCount
        };
      });
    });
  };

  useEffect(() => {
    // Run initial sync to pull ratings from localStorage on mount
    syncProductRatings();

    const handleRatingUpdated = async () => {
      syncProductRatings();
      
      // Also push local reviews to Firestore!
      try {
        const stored = localStorage.getItem('aura_custom_reviews');
        if (stored) {
          const customReviews: any[] = JSON.parse(stored);
          for (const rev of customReviews) {
            await addFirestoreReview(rev);
          }
        }
      } catch (err) {
        console.error('[Firebase] Error syncing custom reviews to Firestore:', err);
      }
    };

    window.addEventListener('aura-rating-updated', handleRatingUpdated);
    return () => {
      window.removeEventListener('aura-rating-updated', handleRatingUpdated);
    };
  }, []);

  // Dynamic categories state
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aura_shop_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      'Minimalist Tech',
      'Premium Apparel',
      'Home & Wellness',
      'Sports & Gear',
      'Organic Grocery',
      'Beverages & Pantry',
      'Books & Stationery'
    ];
  });

  const handleAddCategory = async (newCategory: string) => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    try {
      localStorage.setItem('aura_shop_categories', JSON.stringify(updated));
      await saveFirestoreCategories(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveCategory = async (categoryToRemove: string) => {
    const updated = categories.filter((c) => c !== categoryToRemove);
    setCategories(updated);
    try {
      localStorage.setItem('aura_shop_categories', JSON.stringify(updated));
      await saveFirestoreCategories(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditCategory = async (oldCategory: string, newCategory: string) => {
    const trimmedOld = oldCategory.trim();
    const trimmedNew = newCategory.trim();
    if (!trimmedNew || trimmedOld === trimmedNew) return;
    if (categories.some((c) => c.toLowerCase() === trimmedNew.toLowerCase() && c !== trimmedOld)) {
      alert('A category with that name already exists.');
      return;
    }

    const updatedCats = categories.map((c) => (c === trimmedOld ? trimmedNew : c));
    setCategories(updatedCats);
    try {
      localStorage.setItem('aura_shop_categories', JSON.stringify(updatedCats));
      await saveFirestoreCategories(updatedCats);
    } catch (e) {
      console.error(e);
    }

    // Also update all products associated with this category
    const updatedProds = allProducts.map((p) => {
      if (p.category === trimmedOld) {
        return { ...p, category: trimmedNew };
      }
      return p;
    });
    setAllProducts(updatedProds);

    try {
      for (const p of updatedProds) {
        if (p.category === trimmedNew) {
          await addFirestoreProduct(p);
        }
      }
    } catch (e) {
      console.error('[Firebase] Failed to update products after category edit:', e);
    }
  };

  const handleUpdateProducts = async (updatedProducts: Product[]) => {
    setAllProducts(updatedProducts);
    
    // Check for deleted products
    const currentIds = updatedProducts.map(p => p.id);
    const deletedProducts = allProducts.filter(p => !currentIds.includes(p.id));
    
    try {
      // Handle deletions
      for (const p of deletedProducts) {
        await deleteFirestoreProduct(p.id);
      }
      // Handle additions/updates
      for (const p of updatedProducts) {
        await addFirestoreProduct(p);
      }
    } catch (e) {
      console.error('[Firebase] Failed to sync products update to Firestore:', e);
    }
  };

  const handleUpdateOrders = async (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    
    // Check for deleted orders
    const currentIds = updatedOrders.map(o => o.id);
    const deletedOrders = orders.filter(o => !currentIds.includes(o.id));

    try {
      localStorage.setItem('aura_shop_orders', JSON.stringify(updatedOrders));
      
      // Delete removed orders from Firestore
      for (const order of deletedOrders) {
        await deleteFirestoreOrder(order.id);
      }
      
      // Save remaining/updated orders
      for (const order of updatedOrders) {
        await saveFirestoreOrder(order);
      }
    } catch (e) {
      console.error('[Firebase] Failed to sync orders update to Firestore:', e);
    }
  };

  const [storeSettings, setStoreSettings] = useState(() => {
    const defaultSettings = {
      shopName: 'PrimeStockUG',
      standardShipping: 7000,
      vatRate: 0,
      bannerAnnouncement: 'Enjoy quick shipping to all regions across Uganda!'
    };
    try {
      const stored = localStorage.getItem('aura_store_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.bannerAnnouncement && parsed.bannerAnnouncement.includes('free standard')) {
          parsed.bannerAnnouncement = parsed.bannerAnnouncement.replace('free standard', 'quick');
        }
        if (!parsed.shopName || parsed.shopName.toLowerCase() === 'shop corner') {
          parsed.shopName = 'PrimeStockUG';
        }
        parsed.vatRate = 0;
        localStorage.setItem('aura_store_settings', JSON.stringify(parsed));
        return { ...defaultSettings, ...parsed, shopName: parsed.shopName || 'PrimeStockUG', vatRate: 0 };
      }
    } catch (e) {
      console.error(e);
    }
    return defaultSettings;
  });

  // Price drop live notification toast state
  const [priceDropToast, setPriceDropToast] = useState<{
    id: string;
    productName: string;
    productId: string;
    previousPrice: number;
    currentPrice: number;
    email: string;
  } | null>(null);

  // Voice Search states
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unsupported'>('prompt');
  const [voiceNotification, setVoiceNotification] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Monitor and query microphone permissions
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      try {
        navigator.permissions.query({ name: 'microphone' as any })
          .then((status) => {
            setMicPermissionState(status.state as 'granted' | 'denied' | 'prompt');
            status.onchange = () => {
              setMicPermissionState(status.state as 'granted' | 'denied' | 'prompt');
            };
          })
          .catch(() => {
            // Permission querying directly for mic might not be supported in some browser/iframe environments
          });
      } catch (e) {
        // Ignored
      }
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setMicPermissionState('granted');
        setVoiceNotification('Listening for product name...');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermissionState('denied');
          setVoiceNotification('Microphone permission not allowed in browser or iframe. Please type your search query.');
        } else if (event.error === 'no-speech') {
          setVoiceNotification('No speech detected. Please try again.');
        } else if (event.error === 'audio-capture') {
          setMicPermissionState('denied');
          setVoiceNotification('No microphone hardware detected.');
        } else if (event.error === 'aborted') {
          // Intentionally stopped or cancelled
          setVoiceNotification(null);
          return;
        } else {
          setVoiceNotification(`Voice search unavailable (${event.error}).`);
        }
        setTimeout(() => setVoiceNotification(null), 4000);
      };

      rec.onresult = (event: any) => {
        setMicPermissionState('granted');
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const cleanedText = transcript.trim().replace(/\.$/, '');
          setSearchQuery(cleanedText);
          setActiveTab('store');
          setVoiceNotification(`Searching for: "${cleanedText}"`);
          setTimeout(() => setVoiceNotification(null), 3500);
        }
      };

      setRecognition(rec);
    } else {
      setMicPermissionState('unsupported');
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      setVoiceNotification('Speech recognition not supported in this browser.');
      setTimeout(() => setVoiceNotification(null), 3000);
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }
  };

  // Check for price drop alerts in saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('price_alerts');
      if (!saved) return;
      const alerts: any[] = JSON.parse(saved);
      let updatedAlerts = [...alerts];
      let didUpdate = false;
      let toastTriggered = false;

      alerts.forEach((alert, idx) => {
        // Find corresponding product in inventory
        const currentProd = allProducts.find((p) => p.id === alert.productId);
        if (currentProd) {
          // If baseline initialPrice is missing, save it now so we have a comparison baseline
          if (alert.initialPrice === undefined) {
            updatedAlerts[idx].initialPrice = currentProd.price;
            didUpdate = true;
          }

          const thresholdPrice = alert.initialPrice !== undefined ? alert.initialPrice : currentProd.price;

          // If current price is lower than our baseline threshold price
          if (currentProd.price < thresholdPrice) {
            if (!toastTriggered) {
              setPriceDropToast({
                id: `drop_${Date.now()}_${currentProd.id}`,
                productName: currentProd.name,
                productId: currentProd.id,
                previousPrice: thresholdPrice,
                currentPrice: currentProd.price,
                email: alert.email,
              });
              toastTriggered = true;
            }
            // Update the baseline so we don't spam, and mark as notified
            updatedAlerts[idx].initialPrice = currentProd.price;
            updatedAlerts[idx].notified = true;
            didUpdate = true;
          }
        }
      });

      if (didUpdate) {
        localStorage.setItem('price_alerts', JSON.stringify(updatedAlerts));
      }
    } catch (e) {
      console.error('Error checking price drops:', e);
    }
  }, [allProducts]);

  // Filtering, Searching and Sorting lists
  const [selectedCategory, setSelectedCategory] = useLocalStorage<Category>('aura_shop_selected_category', 'All');
  const [searchQuery, setSearchQuery] = useLocalStorage<string>('aura_shop_search_query', '');

  const [searchInputVal, setSearchInputVal] = useState<string>(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [focusedSuggestionIdx, setFocusedSuggestionIdx] = useState<number | null>(null);

  // Synchronize input value when searchQuery is changed programmatically from outside (presets, URL, voice search, etc.)
  useEffect(() => {
    setSearchInputVal(searchQuery);
  }, [searchQuery]);

  // Debounced effect to commit typed search query to state for filtering, reducing redundant list recalculations
  useEffect(() => {
    if (searchInputVal === searchQuery) return;
    const timer = setTimeout(() => {
      setSearchQuery(searchInputVal);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInputVal, searchQuery, setSearchQuery]);

  // Extract available categories and product tags dynamically for intelligent search completion suggestions
  const availableTagsAndCategories = useMemo(() => {
    const tagsSet = new Set<string>();
    const productNamesSet = new Set<string>();

    // Seed some high-quality tags to make sure we always have excellent fallback suggestions
    const seedTags = [
      'wireless', 'headphones', 'bluetooth', 'smartwatch', 'keyboard',
      'mechanical', 'wool', 'hoodie', 'backpack', 'waterproof',
      'battery', 'display', 'leather', 'charger', 'sound',
      'audio', 'sensor', 'travel', 'active', 'pantry', 'organic',
      'stationery', 'wellness', 'tea', 'protein', 'fitness', 'ergonomic',
      'premium', 'light', 'unibody', 'noise', 'analog', 'digital'
    ];
    seedTags.forEach((tag) => tagsSet.add(tag.toLowerCase()));

    allProducts.forEach((p) => {
      productNamesSet.add(p.name);
      
      // Split product names into words to use as searchable tags
      p.name.split(/\s+/).forEach((word) => {
        const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (clean.length > 3) {
          tagsSet.add(clean);
        }
      });

      // Split features into words to extract tags
      p.features.forEach((feat) => {
        feat.split(/\s+/).forEach((word) => {
          const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
          const stopWords = ['with', 'from', 'your', 'features', 'high', 'ultra', 'dual', 'system', 'more', 'less', 'under', 'their', 'very', 'than'];
          if (clean.length > 4 && !stopWords.includes(clean)) {
            tagsSet.add(clean);
          }
        });
      });
    });

    return {
      categories: categories.filter(c => c !== 'All'),
      tags: Array.from(tagsSet).sort(),
      productNames: Array.from(productNamesSet).sort()
    };
  }, [allProducts, categories]);

  // Compute live search suggestions based on the current input value
  const searchSuggestions = useMemo(() => {
    const query = searchInputVal.toLowerCase().trim();

    // If query is empty, offer "Explore Categories" & "Popular Keywords" as fallbacks
    if (!query) {
      const trendingCategories = availableTagsAndCategories.categories.slice(0, 3).map(cat => ({
        type: 'category' as const,
        text: cat,
        label: `Category: ${cat}`
      }));
      const popularTags = availableTagsAndCategories.tags.slice(0, 4).map(tag => ({
        type: 'tag' as const,
        text: tag,
        label: `Tag: ${tag}`
      }));
      return [...trendingCategories, ...popularTags];
    }

    const matchedSuggestions: { type: 'category' | 'tag' | 'product'; text: string; label: string }[] = [];

    // 1. Matches on Categories
    availableTagsAndCategories.categories.forEach((cat) => {
      if (cat.toLowerCase().includes(query)) {
        matchedSuggestions.push({
          type: 'category',
          text: cat,
          label: `Category: ${cat}`
        });
      }
    });

    // 2. Matches on Tags/Keywords
    availableTagsAndCategories.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(query) && !matchedSuggestions.some((s) => s.text.toLowerCase() === tag.toLowerCase())) {
        matchedSuggestions.push({
          type: 'tag',
          text: tag,
          label: `Tag: ${tag}`
        });
      }
    });

    // 3. Matches on Product Names
    availableTagsAndCategories.productNames.forEach((name) => {
      if (name.toLowerCase().includes(query) && !matchedSuggestions.some((s) => s.text.toLowerCase() === name.toLowerCase())) {
        matchedSuggestions.push({
          type: 'product',
          text: name,
          label: name
        });
      }
    });

    // Limit suggestions to max 6 items for optimal visual density
    return matchedSuggestions.slice(0, 6);
  }, [searchInputVal, availableTagsAndCategories]);

  // Apply chosen search suggestion
  const handleApplySuggestion = (suggestion: { type: 'category' | 'tag' | 'product'; text: string }) => {
    if (suggestion.type === 'category') {
      setSelectedCategory(suggestion.text);
      setSearchInputVal('');
      setSearchQuery('');
    } else {
      // Automatically switch to 'All' category when searching for specific products or keyword tags
      setSelectedCategory('All');
      setSearchInputVal(suggestion.text);
      setSearchQuery(suggestion.text);
    }
    setFocusedSuggestionIdx(null);
    setIsSearchFocused(false);
  };

  const [sortBy, setSortBy] = useState<'featured' | 'low-high' | 'high-low' | 'rating'>('featured');
  const [presets, setPresets] = useLocalStorage<FilterPreset[]>('aura_shop_filter_presets', []);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [isManagePresetsOpen, setIsManagePresetsOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isSupportWidgetOpen, setIsSupportWidgetOpen] = useState(false);
  const [isContactHelpOpen, setIsContactHelpOpen] = useState(false);
  const [activePresetId, setActivePresetId] = useLocalStorage<string | null>('aura_shop_active_preset_id', null);

  // Synchronize active preset ID with current filter criteria
  useEffect(() => {
    const matchingPreset = presets.find(p => p.category === selectedCategory && p.search === searchQuery);
    if (matchingPreset) {
      setActivePresetId(matchingPreset.id);
    } else {
      // If the currently activePresetId doesn't exist in the presets list, clear it
      if (activePresetId && !presets.some(p => p.id === activePresetId)) {
        setActivePresetId(null);
      }
    }
  }, [selectedCategory, searchQuery, presets, activePresetId, setActivePresetId]);

  // Filter history stack for the 'Undo' feature
  const [filterHistory, setFilterHistory] = useState<{ category: Category; search: string }[]>([]);
  const [highlightSearch, setHighlightSearch] = useState(false);
  const isUndoingRef = useRef(false);
  const prevFiltersRef = useRef({ category: selectedCategory, search: searchQuery });

  // Clear search highlight indicator after a delay
  useEffect(() => {
    if (highlightSearch) {
      const timer = setTimeout(() => {
        setHighlightSearch(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightSearch]);

  // Update previous reference on initial load or if states are changed directly on mount
  useEffect(() => {
    prevFiltersRef.current = { category: selectedCategory, search: searchQuery };
  }, []);

  // Debounced effect to track filter/search changes and push previous states to undo history stack
  useEffect(() => {
    if (isUndoingRef.current) {
      isUndoingRef.current = false;
      prevFiltersRef.current = { category: selectedCategory, search: searchQuery };
      return;
    }

    const timer = setTimeout(() => {
      const prev = prevFiltersRef.current;
      if (prev.category !== selectedCategory || prev.search !== searchQuery) {
        setFilterHistory((prevHistory) => {
          // Check if previous state is identical to the last item in history to avoid redundant history states
          const lastIndex = prevHistory.length - 1;
          if (lastIndex >= 0 && prevHistory[lastIndex].category === prev.category && prevHistory[lastIndex].search === prev.search) {
            return prevHistory;
          }
          const updated = [...prevHistory, prev];
          // Limit stack to 25 items
          if (updated.length > 25) {
            updated.shift();
          }
          return updated;
        });
        prevFiltersRef.current = { category: selectedCategory, search: searchQuery };
      }
    }, 450); // 450ms debounce to bundle typing keystrokes

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const handleUndo = () => {
    if (filterHistory.length === 0) return;
    setFilterHistory((prevHistory) => {
      const updated = [...prevHistory];
      const previousState = updated.pop();
      if (previousState) {
        isUndoingRef.current = true;
        setSelectedCategory(previousState.category);
        setSearchQuery(previousState.search);
        if (previousState.search !== searchQuery) {
          setHighlightSearch(true);
        }
      }
      return updated;
    });
  };

  // Synchronize state with URL search parameters on mount and back/forward browser navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCategory = params.get('category');
    const urlSearch = params.get('search');

    // If URL parameters exist on mount, override localStorage/default state values
    if (urlCategory !== null) {
      setSelectedCategory(urlCategory || 'All');
    }
    if (urlSearch !== null) {
      setSearchQuery(urlSearch || '');
    }

    // Handle standard browser back/forward history navigation
    const handlePopState = () => {
      const popParams = new URLSearchParams(window.location.search);
      setSelectedCategory(popParams.get('category') || 'All');
      setSearchQuery(popParams.get('search') || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setSelectedCategory, setSearchQuery]);

  // Synchronize active filters/search state to URL query parameters on state changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentCategoryInUrl = params.get('category') || 'All';
    const currentSearchInUrl = params.get('search') || '';

    // Only update search string if there are actual state updates to prevent redundant replaceState calls
    if (
      selectedCategory !== currentCategoryInUrl ||
      searchQuery !== currentSearchInUrl
    ) {
      const newParams = new URLSearchParams(window.location.search);
      
      if (selectedCategory !== 'All') {
        newParams.set('category', selectedCategory);
      } else {
        newParams.delete('category');
      }

      if (searchQuery) {
        newParams.set('search', searchQuery);
      } else {
        newParams.delete('search');
      }

      const newSearchStr = newParams.toString();
      const newUrl = `${window.location.pathname}${newSearchStr ? '?' + newSearchStr : ''}`;
      
      // Use replaceState to keep history clean of every search typing character
      window.history.replaceState(null, '', newUrl);
    }
  }, [selectedCategory, searchQuery]);

  // Modals Visibility
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Product Comparison state
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);

  const handleToggleCompare = useCallback((product: Product) => {
    setComparedProductIds((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      }
      if (prev.length >= 4) {
        alert("You can compare a maximum of 4 products at the same time.");
        return prev;
      }
      return [...prev, product.id];
    });
  }, []);

  const handleRemoveFromCompare = (productId: string) => {
    setComparedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const handleClearCompare = () => {
    setComparedProductIds([]);
  };

  // Promo Banner state and logic
  const [timeLeft, setTimeLeft] = useState<number>(24 * 60 * 60 * 1000);
  const [showPromo, setShowPromo] = useState<boolean>(true);

  // Newsletter Form State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterError('');
    
    const emailValue = newsletterEmail.trim();
    if (!emailValue) {
      setNewsletterError('Please enter your email address.');
      return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
      setNewsletterError('Please provide a valid email structure.');
      return;
    }
    
    try {
      const storedLeads = localStorage.getItem('step_in_ug_leads');
      const leadsList = storedLeads ? JSON.parse(storedLeads) : [];
      if (!leadsList.includes(emailValue)) {
        leadsList.push(emailValue);
        localStorage.setItem('step_in_ug_leads', JSON.stringify(leadsList));
      }
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch (err) {
      console.error('Failed to save newsletter lead:', err);
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    }
  };

  useEffect(() => {
    // Check if dismissed before
    try {
      const dismissed = localStorage.getItem('aura_shop_promo_dismissed');
      if (dismissed === 'true') {
        setShowPromo(false);
      }

      // Check custom target countdown end
      let expiry = localStorage.getItem('aura_shop_promo_expiry');
      if (!expiry) {
        // Create a 24h target time from now
        const newExpiry = (Date.now() + 24 * 60 * 60 * 1000).toString();
        localStorage.setItem('aura_shop_promo_expiry', newExpiry);
        expiry = newExpiry;
      }

      const targetDate = parseInt(expiry, 10);

      const updateTimer = () => {
        const now = Date.now();
        const diff = targetDate - now;
        if (diff <= 0) {
          setTimeLeft(0);
        } else {
          setTimeLeft(diff);
        }
      };

      updateTimer();
      const intervalId = setInterval(updateTimer, 1000);
      return () => clearInterval(intervalId);
    } catch (e) {
      console.error('Promo banner init failed:', e);
    }
  }, []);

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSecs = Math.floor(ms / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDismissPromo = () => {
    setShowPromo(false);
    try {
      localStorage.setItem('aura_shop_promo_dismissed', 'true');
    } catch (e) {
      console.error('Failed to dismiss promo banner:', e);
    }
  };

  // Load cart, orders, and wishlist from localStorage on mount, and sync with Firestore!
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  useEffect(() => {
    async function initFirestoreData() {
      try {
        console.log('[Firebase] Initializing data from Firestore...');
        
        // Seed database if empty
        const defaultCategories = [
          'Minimalist Tech',
          'Premium Apparel',
          'Home & Wellness',
          'Sports & Gear',
          'Organic Grocery',
          'Beverages & Pantry',
          'Books & Stationery'
        ];
        const { productReviews } = await import('./data');
        await seedDatabaseIfEmpty(products, productReviews, defaultCategories);

        // Fetch categories
        const fbCategories = await getFirestoreCategories();
        if (fbCategories.length > 0) {
          setCategories(fbCategories);
          localStorage.setItem('aura_shop_categories', JSON.stringify(fbCategories));
        }

        // Fetch products
        const fbProducts = await getFirestoreProducts();
        if (fbProducts.length > 0) {
          const normalized = fbProducts.map((p) => sanitizeProductImage(p));
          setAllProducts(normalized);
          localStorage.setItem('aura_shop_products', JSON.stringify(normalized));
        }

        // Fetch orders
        const fbOrders = await getFirestoreOrders();
        if (fbOrders.length > 0) {
          setOrders(fbOrders);
          localStorage.setItem('aura_shop_orders', JSON.stringify(fbOrders));
        }

        // Fetch reviews and store them in localStorage
        const fbReviews = await getFirestoreReviews();
        if (fbReviews.length > 0) {
          localStorage.setItem('aura_custom_reviews', JSON.stringify(fbReviews));
          syncProductRatings();
        }
      } catch (error) {
        console.warn('[Firebase] Database sync deferred or offline:', error);
      } finally {
        setIsFirebaseLoading(false);
      }
    }

    try {
      const storedCart = localStorage.getItem('aura_shop_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      const storedOrders = localStorage.getItem('aura_shop_orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
      const storedWishlist = localStorage.getItem('aura_shop_wishlist');
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }

      // Automatically open shared product modal if found in URL search params
      const params = new URLSearchParams(window.location.search);
      const productParamId = params.get('product');
      if (productParamId) {
        const foundProd = allProducts.find((p) => p.id === productParamId);
        if (foundProd) {
          setSelectedProduct(foundProd);
        }
      }
    } catch (e) {
      console.warn('Storage read failed gracefully:', e);
    }

    initFirestoreData();
  }, []);

  // Global keydown listener for '/' search input focus and Escape key closing fallback
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.getAttribute('contenteditable') === 'true')
        ) {
          return;
        }

        e.preventDefault();
        const searchInput = document.getElementById('search-input-field');
        if (searchInput) {
          setActiveTab('store');
          setTimeout(() => {
            searchInput.focus();
          }, 50);
        }
      } else if (e.key === 'Escape') {
        setSelectedProduct(null);
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
        setIsCompareOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const handleToggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const updated = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      try {
        localStorage.setItem('aura_shop_wishlist', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to write wishlist:', e);
      }
      return updated;
    });
  }, []);

  // Save cart to localStorage on changes
  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('aura_shop_cart', JSON.stringify(newCart));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  };

  // Add Item to Shopping Cart
  const handleAddToCart = useCallback((product: Product, color?: string, size?: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === color &&
          item.selectedSize === size
      );

      let updatedCart: CartItem[];
      if (existingIndex > -1) {
        updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1
        };
      } else {
        updatedCart = [...prevCart, { product, quantity: 1, selectedColor: color, selectedSize: size }];
      }

      try {
        localStorage.setItem('aura_shop_cart', JSON.stringify(updatedCart));
      } catch (e) {
        console.error('Failed to write to localStorage:', e);
      }
      return updatedCart;
    });
  }, []);

  const handleQuickBuy = useCallback((product: Product, color?: string, size?: string) => {
    handleAddToCart(product, color, size);
    setIsCheckoutOpen(true);
  }, [handleAddToCart]);

  // Adjust Quantity
  const handleUpdateQuantity = (productId: string, delta: number, color?: string, size?: string) => {
    const updatedCart = cart
      .map((item) => {
        if (
          item.product.id === productId &&
          item.selectedColor === color &&
          item.selectedSize === size
        ) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    saveCartToStorage(updatedCart);
  };

  // Remove single line item completely from cart
  const handleRemoveItem = (productId: string, color?: string, size?: string) => {
    const updatedCart = cart.filter(
      (item) =>
        !(
          item.product.id === productId &&
          item.selectedColor === color &&
          item.selectedSize === size
        )
    );
    saveCartToStorage(updatedCart);
  };

  // Order Complete Receipt & Admin Notification Trigger
  const handleOrderPlaced = async (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    // Trigger Admin Live Order Notification
    setAdminOrderAlert(newOrder);
    setUnreadAdminOrdersCount((prev) => prev + 1);
    if (soundAlertsEnabled) {
      playAdminOrderChime();
    }

    try {
      localStorage.setItem('aura_shop_orders', JSON.stringify(updatedOrders));
      await saveFirestoreOrder(newOrder);
    } catch (e) {
      console.error('Failed to save order history:', e);
    }

    // Clear cart both in state and storage
    saveCartToStorage([]);
  };

  // Quick Dispatch Order from Notification Bar
  const handleQuickMarkOrderShipped = async (orderId: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: 'Shipped' as const };
      }
      return o;
    });
    setOrders(updated);
    if (adminOrderAlert?.id === orderId) {
      setAdminOrderAlert({ ...adminOrderAlert, status: 'Shipped' });
    }
    try {
      localStorage.setItem('aura_shop_orders', JSON.stringify(updated));
      await updateFirestoreOrderStatus(orderId, 'Shipped');
    } catch (e) {
      console.error('Failed to save orders history after mark shipped:', e);
    }
  };

  // Re-order products from past orders
  const handleReorder = (order: Order) => {
    saveCartToStorage(order.items);
    setIsCartOpen(true);
  };

  // Cancel an existing order
  const handleCancelOrder = async (orderId: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: 'Cancelled' as const };
      }
      return o;
    });
    setOrders(updated);
    try {
      localStorage.setItem('aura_shop_orders', JSON.stringify(updated));
      await updateFirestoreOrderStatus(orderId, 'Cancelled');
    } catch (e) {
      console.error('Failed to save orders history after cancel:', e);
    }
  };

  // Permanently delete a single order
  const handleDeleteOrder = async (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    if (adminOrderAlert?.id === orderId) {
      setAdminOrderAlert(null);
    }
    try {
      localStorage.setItem('aura_shop_orders', JSON.stringify(updated));
      await deleteFirestoreOrder(orderId);
    } catch (e) {
      console.error('Failed to delete order from storage:', e);
    }
  };

  // Permanently clear all cancelled orders
  const handleClearCancelledOrders = async () => {
    const isCancelled = (status?: string) => {
      const s = (status || '').toLowerCase().trim();
      return s === 'cancelled' || s === 'canceled';
    };
    const cancelledOrders = orders.filter((o) => isCancelled(o.status));
    const updated = orders.filter((o) => !isCancelled(o.status));
    setOrders(updated);
    if (adminOrderAlert && isCancelled(adminOrderAlert.status)) {
      setAdminOrderAlert(null);
    }
    try {
      localStorage.setItem('aura_shop_orders', JSON.stringify(updated));
      for (const ord of cancelledOrders) {
        await deleteFirestoreOrder(ord.id);
      }
    } catch (e) {
      console.error('Failed to clear cancelled orders from storage:', e);
    }
  };

  // Save current filters and search query as a preset
  const handleSavePreset = () => {
    const nameToUse = newPresetName.trim() || `${selectedCategory !== 'All' ? selectedCategory : ''}${searchQuery ? (selectedCategory !== 'All' ? ' + ' : '') + `"${searchQuery}"` : ''}` || 'Default Filter';
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: nameToUse,
      category: selectedCategory,
      search: searchQuery,
    };
    setPresets([...presets, newPreset]);
    setNewPresetName('');
    setIsSavingPreset(false);
  };

  // Products filtering calculations
  const searchTerms = useMemo(() => {
    return searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
  }, [searchQuery]);

  const matchesGlobalCount = useMemo(() => {
    if (searchTerms.length === 0) return 0;
    return allProducts.filter((prod) =>
      searchTerms.every((term) =>
        prod.name.toLowerCase().includes(term) ||
        prod.description.toLowerCase().includes(term) ||
        prod.category.toLowerCase().includes(term) ||
        prod.features.some((f) => f.toLowerCase().includes(term))
      )
    ).length;
  }, [allProducts, searchTerms]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allProducts.length };
    categories.forEach((cat) => {
      counts[cat] = allProducts.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [allProducts, categories]);

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((prod) => {
        const matchCategory = selectedCategory === 'All' || prod.category === selectedCategory;
        const matchSearch =
          searchTerms.length === 0 ||
          searchTerms.every((term) =>
            prod.name.toLowerCase().includes(term) ||
            prod.description.toLowerCase().includes(term) ||
            prod.category.toLowerCase().includes(term) ||
            prod.features.some((f) => f.toLowerCase().includes(term))
          );
        return matchCategory && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'low-high') return a.price - b.price;
        if (sortBy === 'high-low') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // 'featured' keeps original list sorting
      });
  }, [allProducts, selectedCategory, searchTerms, sortBy]);

  const cartTotalQty = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-orange-100/80 transition-colors duration-200">
      {/* Promotional Countdown Banner */}
      <AnimatePresence initial={false}>
        {showPromo && (
          <motion.div
            id="limited-time-promo-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white text-xs font-semibold py-2.5 px-12 shadow-sm relative flex flex-col sm:flex-row items-center justify-center gap-2 select-none text-center"
          >
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-md text-[10px] tracking-wider uppercase animate-pulse">
                Limited Time Offer
              </span>
              <span className="text-orange-50 font-medium">
                Use code <b className="font-extrabold tracking-wide text-white bg-slate-950/15 px-1.5 py-0.5 rounded-sm">AURA20</b> for an extra 20% off minimalist designs!
              </span>
              <div className="flex items-center gap-1 ml-0 sm:ml-2 bg-slate-950/20 px-2.5 py-1 rounded-full border border-white/10 text-[11px]">
                <Timer className="h-3.5 w-3.5 text-orange-200" />
                <span>Expires in:</span>
                <span className="font-mono text-[11px] font-bold tabular-nums tracking-wide text-white">{formatCountdown(timeLeft)}</span>
              </div>
            </div>
            
            <button
              id="dismiss-promo-btn"
              type="button"
              onClick={handleDismissPromo}
              className="absolute right-4 p-1 hover:bg-white/15 rounded-lg transition-colors focus:outline-none flex items-center justify-center"
              title="Dismiss Offer"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Area */}
      <div className="bg-slate-950 text-white text-[11px] font-black tracking-widest text-center py-2 px-4 flex items-center justify-center gap-1.5 uppercase shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
        {storeSettings.bannerAnnouncement}
      </div>

      {/* LIVE ADMIN ORDER NOTIFICATION BAR (Shown when an order is placed) */}
      <AdminOrderNotificationBar
        order={adminOrderAlert}
        onViewInAdmin={(orderId) => {
          setActiveTab('admin');
          setUnreadAdminOrdersCount(0);
        }}
        onDismiss={() => setAdminOrderAlert(null)}
        onMarkShipped={handleQuickMarkOrderShipped}
        soundEnabled={soundAlertsEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Navigation Header */}
      <header id="main-header" className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/80 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span
              id="header-app-logo"
              className="text-lg font-black tracking-tight text-slate-950 dark:text-white cursor-pointer flex items-center gap-2.5 select-none"
              onClick={() => {
                setActiveTab('store');
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              <ShopCornerIcon className="h-6 w-6" />
              <div className="flex items-center">
                {storeSettings.shopName === 'PrimeStockUG' ? (
                  <span className="flex items-center tracking-tight">
                    <span className="text-orange-500 dark:text-orange-400 font-black text-base">
                      PrimeStock
                    </span>
                    <span className="text-slate-900 dark:text-white font-black text-base">
                      UG
                    </span>
                  </span>
                ) : storeSettings.shopName.includes(' ') ? (
                  <>
                    <span className="text-orange-500 dark:text-orange-400 font-extrabold mr-1">
                      {storeSettings.shopName.split(' ')[0]}
                    </span>
                    <span className="text-slate-900 dark:text-white font-black">
                      {storeSettings.shopName.split(' ').slice(1).join(' ')}
                    </span>
                  </>
                ) : (
                  <span className="text-orange-500 dark:text-orange-400 font-extrabold">
                    {storeSettings.shopName}
                  </span>
                )}
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-orange-500 shadow-sm animate-pulse" />
              </div>
            </span>

            {/* Desktop Tabs */}
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                id="tab-btn-catalog"
                type="button"
                onClick={() => setActiveTab('store')}
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'store'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                Catalog
              </button>
              <button
                id="tab-btn-wishlist"
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                  activeTab === 'wishlist'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                Wishlist
                {wishlist.length > 0 && (
                  <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white leading-none">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                id="tab-btn-orders"
                type="button"
                onClick={() => setActiveTab('history')}
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                Your Order Activity
                {orders.length > 0 && (
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                )}
              </button>
              <button
                id="tab-btn-track-package"
                type="button"
                onClick={() => setIsTrackingModalOpen(true)}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100/60 dark:border-indigo-900/40 cursor-pointer shadow-2xs"
                title="Track any package with your Order ID or Tracking Code"
              >
                <Truck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Track Order</span>
              </button>
              <button
                id="tab-btn-contact-help"
                type="button"
                onClick={() => setIsContactHelpOpen(true)}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer shadow-2xs"
                title="View physical store location, WhatsApp, and submit inquiries"
              >
                <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Contact & Store</span>
              </button>
              <button
                id="tab-btn-support-chat"
                type="button"
                onClick={() => setIsSupportWidgetOpen(true)}
                className="rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/40 cursor-pointer shadow-2xs"
                title="Connect via WhatsApp or direct support ticket"
              >
                <Headphones className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp Support</span>
              </button>
              <button
                id="tab-btn-ai-assistant"
                type="button"
                onClick={() => setIsAiAssistantOpen(true)}
                className="rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 shadow-md hover:shadow-indigo-500/25 cursor-pointer active:scale-95"
                title="Ask Aura AI for recommendations, gift guides, and advice"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-200 animate-pulse" />
                <span>Ask AI Assistant</span>
              </button>
              {currentUser?.isAdmin && (
                <button
                  id="tab-btn-admin"
                  type="button"
                  onClick={() => {
                    setActiveTab('admin');
                    setUnreadAdminOrdersCount(0);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 relative ${
                    activeTab === 'admin'
                      ? 'bg-slate-950 dark:bg-indigo-600 text-white dark:hover:bg-indigo-700 shadow-xs'
                      : 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 hover:text-indigo-900 dark:hover:text-indigo-200 border border-indigo-100/40 dark:border-indigo-900/40'
                  }`}
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span>Admin Panel</span>
                  {unreadAdminOrdersCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white leading-none shadow-xs animate-pulse">
                      {unreadAdminOrdersCount}
                    </span>
                  )}
                </button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Currency Toggle Switch */}
            <div id="currency-header-selector" className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-xs select-none transition-colors duration-200">
              <button
                id="currency-toggle-ugx"
                type="button"
                onClick={() => setCurrency('UGX')}
                className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  currency === 'UGX'
                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Switch to Uganda Shillings (UGX)"
              >
                UGX
              </button>
              <button
                id="currency-toggle-usd"
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  currency === 'USD'
                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Switch to US Dollars (USD)"
              >
                USD
              </button>
            </div>

            {/* Visual Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-505/20"
              aria-label="Toggle visual theme"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-4.5 w-4.5 text-slate-700" />
              ) : (
                <Sun className="h-4.5 w-4.5 text-amber-400 animate-spin-once" />
              )}
            </button>

            {/* Bag Button with pulsing counter badge */}
            <button
              id="trigger-cart-drawer-btn"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-305 shadow-xs transition-transform hover:scale-105 active:scale-95 focus:outline-none"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <AnimatePresence>
                {cartTotalQty > 0 && (
                  <motion.span
                    id="cart-total-badge"
                    key="badge"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 dark:bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900"
                  >
                    {cartTotalQty}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* User Account Sign In / Profile Dropdown Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-menu-trigger"
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none select-none cursor-pointer"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/40 text-[11px] font-black border border-orange-200 dark:border-orange-850">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline max-w-[90px] truncate">{currentUser.name}</span>
                  <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <>
                      {/* Click outside backdrop */}
                      <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
                      <motion.div
                        id="user-profile-dropdown"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2.5 z-20 overflow-hidden font-sans"
                      >
                        <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-xs">
                              {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-black text-slate-900 dark:text-white block truncate leading-none mb-1">
                                {currentUser.name}
                              </span>
                              <span className="text-[10px] text-slate-450 dark:text-slate-500 truncate block font-medium">
                                {currentUser.email.endsWith('@phone.aura.com') ? currentUser.email.split('@')[0] : currentUser.email}
                              </span>
                            </div>
                          </div>
                          {currentUser.role && (
                            <span className="inline-block mt-2 text-[8px] font-black uppercase tracking-wider bg-orange-50 dark:bg-orange-950/45 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded-md">
                              Aura {currentUser.role} Member
                            </span>
                          )}
                        </div>

                        <div className="px-1.5 py-1.5 space-y-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('history');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                            Purchase History
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('wishlist');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Heart className="h-3.5 w-3.5 text-slate-400" />
                            My Wishlist
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('profile');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Shield className="h-3.5 w-3.5 text-slate-400" />
                            Profile &amp; Security (2FA)
                          </button>
                          {currentUser.isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('admin');
                                setUserDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/25 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                            >
                              <Crown className="h-3.5 w-3.5 animate-pulse" />
                              Admin Console
                            </button>
                          )}
                        </div>

                        <div className="border-t border-slate-50 dark:border-slate-800/80 px-1.5 pt-1.5">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                id="header-sign-in-btn"
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-xs font-bold text-slate-900 dark:text-white shadow-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
              >
                <LogIn className="h-4 w-4 text-orange-500" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-8">
        
        {/* Mobile Navigation Tabs */}
        <div id="mobile-navigation" className="md:hidden flex gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <button
            id="mobile-tab-catalog"
            type="button"
            onClick={() => setActiveTab('store')}
            className={`flex-1 text-center py-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'store'
                ? 'border-slate-900 dark:border-white text-slate-950 dark:text-white'
                : 'border-transparent text-slate-400 dark:text-slate-550'
            }`}
          >
            Catalog
          </button>
          <button
            id="mobile-tab-wishlist"
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`flex-1 text-center py-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'wishlist'
                ? 'border-slate-900 dark:border-white text-slate-950 dark:text-white'
                : 'border-transparent text-slate-400 dark:text-slate-550'
            }`}
          >
            Wishlist
            {wishlist.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-1 leading-none">
                {wishlist.length}
              </span>
            )}
          </button>
          <button
            id="mobile-tab-orders"
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 text-center py-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-slate-900 dark:border-white text-slate-950 dark:text-white'
                : 'border-transparent text-slate-400 dark:text-slate-550'
            }`}
          >
            Activity
            {orders.length > 0 && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
            )}
          </button>
          {currentUser?.isAdmin && (
            <button
              id="mobile-tab-admin"
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setUnreadAdminOrdersCount(0);
              }}
              className={`flex-1 text-center py-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 dark:text-slate-550'
              }`}
            >
              <span>Admin 👑</span>
              {unreadAdminOrdersCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white leading-none shadow-xs animate-pulse">
                  {unreadAdminOrdersCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Content Tabs Switcher */}
        {activeTab === 'store' ? (
          <div id="shop-main-view">
            {/* Elegant Hero Segment */}
            <section id="hero-segment" className="mb-10 text-center md:text-left">
              <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl leading-relaxed">
                <span className="bg-orange-500 dark:bg-orange-600 text-white px-4 py-1.5 rounded-2xl inline-block shadow-sm transform -rotate-1 hover:rotate-0 transition-all duration-300">Curated Minimalist Goods</span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
                Explore an elegant selection of professional tools and lifestyle necessities designed for efficiency, durability, and timeless visual poise.
              </p>
            </section>

            {/* Intelligent Search Segment */}
            <section id="search-segment" className="mb-8 font-sans">
              <div className="relative max-w-2xl">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
                    <Search className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="product-search-input"
                    type="text"
                    value={searchInputVal}
                    onChange={(e) => setSearchInputVal(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setFocusedSuggestionIdx((prev) => {
                          if (prev === null) return 0;
                          return Math.min(prev + 1, searchSuggestions.length - 1);
                        });
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setFocusedSuggestionIdx((prev) => {
                          if (prev === null || prev === 0) return null;
                          return prev - 1;
                        });
                      } else if (e.key === 'Enter') {
                        if (focusedSuggestionIdx !== null && searchSuggestions[focusedSuggestionIdx]) {
                          e.preventDefault();
                          handleApplySuggestion(searchSuggestions[focusedSuggestionIdx]);
                        }
                      } else if (e.key === 'Escape') {
                        setIsSearchFocused(false);
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    placeholder="Search premium products, categories, features..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 rounded-2xl py-3.5 pl-11 pr-32 sm:pr-40 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all duration-250 shadow-xs"
                  />
                  
                  {/* Action Buttons & Microphone Access Indicator Inside/Next to Input */}
                  <div className="absolute right-3 flex items-center gap-1.5 sm:gap-2">
                    {/* Visual Microphone Access Indicator */}
                    {voiceSupported && (
                      <button
                        id="mic-permission-indicator"
                        type="button"
                        onClick={() => {
                          if (micPermissionState === 'denied') {
                            setVoiceNotification('Microphone access is blocked. Please allow microphone permission in your browser or site settings.');
                            setTimeout(() => setVoiceNotification(null), 4500);
                          } else {
                            toggleListening();
                          }
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer select-none ${
                          micPermissionState === 'granted'
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            : micPermissionState === 'denied'
                            ? 'bg-red-500/10 dark:bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                        }`}
                        title={
                          micPermissionState === 'granted'
                            ? 'Microphone access: Granted (Ready for voice search)'
                            : micPermissionState === 'denied'
                            ? 'Microphone access: Denied / Blocked (Click for help)'
                            : 'Microphone access: Click to allow voice search'
                        }
                      >
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            micPermissionState === 'granted'
                              ? 'bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse'
                              : micPermissionState === 'denied'
                              ? 'bg-red-500 ring-2 ring-red-500/30'
                              : 'bg-amber-400 dark:bg-amber-500 ring-2 ring-amber-400/30'
                          }`}
                        />
                        <span className="hidden sm:inline font-mono tracking-tight text-[9px] uppercase font-extrabold">
                          {micPermissionState === 'granted'
                            ? 'Mic OK'
                            : micPermissionState === 'denied'
                            ? 'Mic Off'
                            : 'Mic Ready'}
                        </span>
                      </button>
                    )}

                    {searchInputVal && (
                      <button
                        id="clear-search-btn"
                        type="button"
                        onClick={() => {
                          setSearchInputVal('');
                          setSearchQuery('');
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    
                    {voiceSupported && (
                      <button
                        id="voice-search-btn"
                        type="button"
                        onClick={toggleListening}
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          isListening
                            ? 'bg-red-500 text-white animate-pulse shadow-md'
                            : micPermissionState === 'granted'
                            ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={isListening ? 'Stop listening' : 'Voice Search'}
                      >
                        {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Voice Search Notification Toast / Alert */}
                {voiceNotification && (
                  <div className="absolute z-25 top-full left-0 right-0 mt-2 p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/30 text-xs font-semibold text-orange-800 dark:text-orange-400 animate-in fade-in slide-in-from-top-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping shrink-0" />
                    <span>{voiceNotification}</span>
                  </div>
                )}

                {/* Suggestions Dropdown list with animation */}
                <AnimatePresence>
                  {isSearchFocused && searchSuggestions.length > 0 && (
                    <motion.div
                      id="search-suggestions-dropdown"
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-30 mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden py-1.5"
                    >
                      <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-800/80 mb-1">
                        Recommended Matches
                      </div>
                      <div className="max-h-64 overflow-y-auto no-scrollbar">
                        {searchSuggestions.map((suggestion, index) => {
                          const isFocused = focusedSuggestionIdx === index;
                          return (
                            <button
                              key={`${suggestion.type}-${suggestion.text}-${index}`}
                              id={`search-suggestion-item-${index}`}
                              type="button"
                              onClick={() => handleApplySuggestion(suggestion)}
                              onMouseEnter={() => setFocusedSuggestionIdx(index)}
                              className={`w-full text-left px-3.5 py-2.5 text-xs font-medium flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                                isFocused
                                  ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-900 dark:text-orange-300'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`p-1 rounded-lg ${
                                  suggestion.type === 'category'
                                    ? 'bg-amber-50 dark:bg-amber-950/35 text-amber-600 dark:text-amber-400'
                                    : suggestion.type === 'tag'
                                    ? 'bg-teal-50 dark:bg-teal-950/35 text-teal-600 dark:text-teal-400'
                                    : 'bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600 dark:text-indigo-400'
                                }`}>
                                  {suggestion.type === 'category' ? (
                                    <Archive className="h-3.5 w-3.5" />
                                  ) : suggestion.type === 'tag' ? (
                                    <Tag className="h-3.5 w-3.5" />
                                  ) : (
                                    <Search className="h-3.5 w-3.5" />
                                  )}
                                </span>
                                <span className="truncate font-semibold">{suggestion.label}</span>
                              </div>
                              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                                {suggestion.type}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Sort and Category Filters Segment */}
            <section id="catalog-controls" className="mb-8 space-y-4 font-sans">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                {/* Horizontal Category Pill Scrollbar */}
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                    Browse Categories
                  </span>
                  <div id="category-pills-list" className="flex overflow-x-auto pb-1.5 lg:pb-0 gap-1.5 no-scrollbar max-w-full">
                    {['All', ...categories].map((cat) => {
                      const isActive = selectedCategory === cat;
                      const count = categoryCounts[cat] || 0;
                      return (
                        <button
                          key={cat}
                          id={`category-pill-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all border cursor-pointer flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-slate-950 dark:bg-orange-600 text-white border-slate-950 dark:border-orange-600 shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort selector */}
                <div className="flex flex-col gap-1.5 shrink-0 self-end lg:self-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5 self-end">
                    Sort By
                  </span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </span>
                    <select
                      id="sort-select-field"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-8 pr-7 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all focus:border-slate-400 dark:focus:border-slate-600 focus:outline-hidden appearance-none"
                    >
                      <option value="featured">Featured Favorites</option>
                      <option value="low-high">Price: Low to High</option>
                      <option value="high-low">Price: High to Low</option>
                      <option value="rating">Top Rated Products</option>
                    </select>
                    <span className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 pointer-events-none">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Zero State Filter view */}
            {filteredProducts.length === 0 ? (
              <div id="products-empty-view" className="py-24 text-center border border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-8 transition-colors">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-450 dark:text-slate-500 mb-4 animate-bounce">
                  <Archive className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">No catalog matches discovered</h3>
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  Adjust your search terms or verify another category filter path above to access premium products.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    id="reset-filters-btn"
                    type="button"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="rounded-xl bg-slate-950 dark:bg-indigo-600 dark:hover:bg-indigo-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 cursor-pointer"
                  >
                    Reset Filtering Elements
                  </button>
                </div>

                {selectedCategory !== 'All' && matchesGlobalCount > 0 && (
                  <div className="mt-8 p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/25 border border-indigo-100/30 dark:border-indigo-900/30 max-w-sm mx-auto text-center animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium leading-relaxed">
                      We discovered <strong className="font-extrabold text-indigo-900 dark:text-indigo-300">{matchesGlobalCount} {matchesGlobalCount === 1 ? 'match' : 'matches'}</strong> in other categories for your query.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('All')}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
                    >
                      Search All Categories
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Products Display Grid container */
              <div id="products-grid-container" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onViewDetails={setSelectedProduct}
                    onAddToCart={handleAddToCart}
                    onQuickBuy={handleQuickBuy}
                    isWishlisted={wishlist.includes(prod.id)}
                    onToggleWishlist={handleToggleWishlist}
                    isCompared={comparedProductIds.includes(prod.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            )}

            {/* Elegant Newsletter Signup Box */}
            <div id="newsletter-signup-box" className="mt-16 rounded-3xl bg-slate-900 border border-slate-850 dark:bg-slate-950/40 dark:border-orange-950/45 p-8 sm:p-12 relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-orange-600/10 dark:bg-orange-600/5 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-72 w-72 rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-3xl pointer-events-none" />

              <div className="relative max-w-2xl mx-auto text-center flex flex-col items-center font-sans">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mb-6 border border-orange-500/25 shadow-2xs animate-bounce">
                  <Mail className="h-5 w-5" />
                </div>
                
                <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                  Join the <span className="text-orange-500 dark:text-orange-400 font-extrabold">PrimeStockUG</span> Circle
                </h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-lg">
                  Subscribe to receive weekly drops, high-precision designs, and exclusive Ugandan shipping updates directly in your inbox.
                </p>

                <div className="w-full mt-8">
                  {newsletterSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl bg-orange-500/10 border border-orange-500/30 p-6 text-center max-w-md mx-auto"
                    >
                      <p className="text-sm font-bold text-orange-400 flex items-center justify-center gap-1.5">
                        <Check className="h-4 w-4 bg-orange-500 text-slate-950 rounded-full p-0.5" />
                        Subscription successful!
                      </p>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        Thank you for stepping into the circle. Keep an eye on your inbox!
                      </p>
                      <button
                        type="button"
                        onClick={() => setNewsletterSuccess(false)}
                        className="mt-4 text-[10px] font-extrabold text-orange-500 hover:text-orange-400 hover:underline uppercase tracking-widest cursor-pointer"
                      >
                        Sign Up another email
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
                      <div className="flex-1 relative">
                        <input
                          id="newsletter-email-input"
                          type="email"
                          required
                          value={newsletterEmail}
                          onChange={(e) => {
                            setNewsletterEmail(e.target.value);
                            if (newsletterError) setNewsletterError('');
                          }}
                          placeholder="Enter your email address"
                          className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200"
                        />
                      </div>
                      <button
                        id="newsletter-submit-btn"
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 focus:ring-4 focus:ring-orange-500/20 text-slate-950 font-extrabold text-xs uppercase tracking-widest rounded-2xl px-6 py-3 transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0"
                      >
                        Subscribe
                        <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    </form>
                  )}

                  {newsletterError && (
                    <p className="mt-3 text-xs text-red-500 font-medium">
                      ⚠️ {newsletterError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'wishlist' ? (
          /* Wishlist Saved Items page view */
          <WishlistPage
            wishlist={wishlist}
            products={allProducts}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onViewDetails={(p) => setSelectedProduct(p)}
            onBrowseStore={() => setActiveTab('store')}
          />
        ) : activeTab === 'admin' ? (
          currentUser?.isAdmin ? (
            /* Interactive Admin & Inventory Dashboard panel */
            <AdminPanel
              products={allProducts}
              orders={orders}
              onUpdateProducts={handleUpdateProducts}
              onUpdateOrders={handleUpdateOrders}
              categories={categories}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
              onEditCategory={handleEditCategory}
              storeSettings={storeSettings}
              onUpdateSettings={setStoreSettings}
            />
          ) : (
            /* Access Denied Auth Guard Shield */
            <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-3xl text-center space-y-5 shadow-xs animate-fadeIn">
              <div className="h-14 w-14 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                <ShieldAlert className="h-6 w-6 stroke-[2]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Admin Authentication Required</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  The control center is locked down securely with real-time Firebase Auth Guards. You must be authenticated as an administrator to enter.
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-850 text-white font-extrabold text-xs uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Sign In to Admin
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('store')}
                  className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer"
                >
                  Back to Store Front
                </button>
              </div>
            </div>
          )
        ) : activeTab === 'profile' ? (
          currentUser ? (
            <React.Suspense fallback={
              <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-3xl text-center space-y-5 shadow-xs animate-pulse">
                <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mx-auto" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mx-auto" />
              </div>
            }>
              <UserProfileSettings
                currentUser={currentUser}
                onUpdateProfile={(updated) => setCurrentUser(updated)}
                onBrowseStore={() => setActiveTab('store')}
              />
            </React.Suspense>
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-3xl text-center space-y-5 shadow-xs">
              <div className="h-14 w-14 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="h-6 w-6 stroke-[2]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Sign In Required</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Please sign in to access your profile settings and secure your account with Two-Factor Authentication.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                Sign In
              </button>
            </div>
          )
        ) : (
          /* Order Activity History page view */
          <OrderHistory
            orders={orders}
            onBrowseStore={() => setActiveTab('store')}
            onReorder={handleReorder}
            onCancelOrder={handleCancelOrder}
            onDeleteOrder={handleDeleteOrder}
            onClearCancelledOrders={handleClearCancelledOrders}
          />
        )}
      </main>

      {/* Frequently Asked Questions section */}
      <FaqSection />

      {/* Styled Footer block */}
      <footer id="main-footer" className="mt-auto border-t border-slate-150 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-10 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white tracking-wide select-none">
              {storeSettings.shopName}
            </p>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Plot 14 Acacia Avenue, Kololo, Kampala &bull; Official WhatsApp: +256 756 351 236
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsContactHelpOpen(true)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Building2 className="h-3 w-3" />
                <span>Contact & Flagship Store</span>
              </button>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <button
                type="button"
                onClick={() => setIsSupportWidgetOpen(true)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <MessageSquare className="h-3 me-0.5 w-3" />
                <span>WhatsApp Concierge</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            {/* Accepted checkout cards graphic representation */}
            <div id="cards-accepted-strip" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
              <span>Accepting Demo Cards</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">
              &copy; {new Date().getFullYear()} Demo Platform Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* App Modals & Drawer Overlays rendering */}
      
      {/* Product Detailed Spec Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onQuickBuy={(prod, color, size) => {
          handleAddToCart(prod, color, size);
          setSelectedProduct(null);
          setIsCheckoutOpen(true);
        }}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        products={allProducts}
        onViewProduct={(p) => setSelectedProduct(p)}
        currentUser={currentUser}
      />

      {/* Cart Sliding Drawer Panel */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        currentUser={currentUser}
        syncStatus={cartSyncStatus}
      />

      {/* Checkout Multi-Step Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        onOrderPlaced={handleOrderPlaced}
        currentUser={currentUser}
      />

      {/* User Authentication Modal */}
      <React.Suspense fallback={null}>
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </React.Suspense>

      {/* Manage saved filter presets modal */}
      <ManagePresetsModal
        isOpen={isManagePresetsOpen}
        onClose={() => setIsManagePresetsOpen(false)}
        presets={presets}
        setPresets={setPresets}
      />

      {/* Product Comparison side-by-side spec modal */}
      <ProductCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        comparedProducts={allProducts.filter((p) => comparedProductIds.includes(p.id))}
        onRemoveFromCompare={handleRemoveFromCompare}
        onAddToCart={handleAddToCart}
      />

      {/* Floating Comparison Tray */}
      <AnimatePresence>
        {comparedProductIds.length > 0 && (
          <motion.div
            id="comparison-tray"
            initial={{ y: 100, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 22, opacity: { duration: 0.25 } }}
            className="fixed bottom-6 left-1/2 z-40 w-[90%] max-w-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-800 text-white rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 overflow-auto">
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-wider uppercase text-slate-400">Compare Tray</span>
                <span className="text-[10px] text-indigo-400 font-bold">{comparedProductIds.length} of 4 selected</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-800" />
              <div className="flex items-center gap-2">
                {comparedProductIds.map((id) => {
                  const prod = allProducts.find((p) => p.id === id);
                  if (!prod) return null;
                  return (
                    <div key={id} className="relative group h-12 w-12 rounded-xl bg-white p-1 border border-slate-700 flex items-center justify-center shrink-0">
                      <img
                        src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80'}
                        alt={prod.name}
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
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCompare(id)}
                        className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow-sm transition-all active:scale-90 cursor-pointer"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleClearCompare}
                className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setIsCompareOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Compare Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Tracking Lookup Modal */}
      <OrderTrackingLookupModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        orders={orders}
      />

      {/* Support & WhatsApp Chat Widget Modal */}
      <SupportChatWidget
        isOpen={isSupportWidgetOpen}
        onClose={() => setIsSupportWidgetOpen(false)}
        currentUser={currentUser}
      />

      {/* Contact & Flagship Store Help Modal */}
      <ContactHelpModal
        isOpen={isContactHelpOpen}
        onClose={() => setIsContactHelpOpen(false)}
        currentUser={currentUser}
      />

      {/* Floating WhatsApp / Support Launcher Button (Bottom-Left) */}
      <AnimatePresence>
        {!isSupportWidgetOpen && (
          <motion.button
            id="floating-whatsapp-support-btn"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsSupportWidgetOpen(true)}
            className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl hover:shadow-emerald-500/40 border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="relative">
              <MessageSquare className="h-5 w-5 text-white group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-300 animate-ping" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-300" />
            </div>
            <span className="text-xs font-black tracking-wide pr-1">WhatsApp & Support</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Shopping Assistant Drawer */}
      <AiShoppingAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        products={allProducts}
        cart={cart}
        onAddToCart={handleAddToCart}
        onQuickView={(product) => setSelectedProduct(product)}
        onOpenTrackOrder={() => {
          setIsAiAssistantOpen(false);
          setIsTrackingModalOpen(true);
        }}
      />

      {/* Floating AI Shopping Assistant Launcher Button */}
      <AnimatePresence>
        {!isAiAssistantOpen && (
          <motion.button
            id="floating-ai-assistant-btn"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsAiAssistantOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white shadow-2xl hover:shadow-indigo-500/40 border border-indigo-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="relative">
              <Sparkles className="h-5 w-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-black tracking-wide pr-1">Aura AI Stylist</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Price Drop Toast Notification */}
      <AnimatePresence>
        {priceDropToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            id="price-drop-floating-toast"
            className="fixed bottom-6 right-6 z-[60] max-w-sm w-80 sm:w-96 bg-slate-900 border border-slate-800 dark:border-orange-500/30 text-white rounded-2xl p-5 shadow-2xl flex gap-3.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white tracking-tight">Price Drop Notification!</h4>
                <button
                  type="button"
                  onClick={() => setPriceDropToast(null)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                The price of <b className="font-bold text-white">{priceDropToast.productName}</b> decreased from <span className="line-through text-slate-400">{formatPrice(priceDropToast.previousPrice)}</span> to <span className="font-extrabold text-orange-400">{formatPrice(priceDropToast.currentPrice)}</span>!
              </p>
              <p className="mt-2 text-[10px] text-slate-400 italic">
                Email notification preferences saved for {priceDropToast.email}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const match = allProducts.find((p) => p.id === priceDropToast.productId);
                    if (match) setSelectedProduct(match);
                    setPriceDropToast(null);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 font-extrabold text-[10px] uppercase tracking-widest text-slate-950 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => setPriceDropToast(null)}
                  className="bg-slate-800 hover:bg-slate-705 font-bold text-[10px] text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top floating button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            id="back-to-top-btn"
            type="button"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 border border-slate-200 dark:border-slate-800/80 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Back to Top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

