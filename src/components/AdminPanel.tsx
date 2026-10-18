import React, { useState } from 'react';
import { Product, Order } from '../types';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  CheckCircle,
  Truck,
  Inbox,
  Sparkles,
  Smartphone,
  Banknote,
  Coins,
  CreditCard,
  X,
  FileSpreadsheet,
  Download,
  Settings,
  User,
  MapPin,
  Clock,
  AlertTriangle,
  UploadCloud,
  Image as ImageIcon,
  Tag,
  Ticket,
  MessageSquare,
  Phone,
  Bell,
  Volume2,
  VolumeX,
  ExternalLink,
  Printer
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { motion, AnimatePresence } from 'motion/react';
import { playAdminOrderChime } from '../lib/soundUtils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onUpdateProducts: (updated: Product[]) => void;
  onUpdateOrders: (updated: Order[]) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onEditCategory: (oldCategory: string, newCategory: string) => void;
  storeSettings?: {
    shopName: string;
    standardShipping: number;
    freeShippingThreshold: number;
    vatRate: number;
    bannerAnnouncement: string;
  };
  onUpdateSettings?: (updated: any) => void;
}

// Beautiful minimalist Unsplash preset images to populate new products easily
const PRESET_IMAGES = [
  {
    name: '🍀 Fresh Avocado',
    defaultTitle: 'Aura Premium Organic Avocado',
    defaultCategory: 'Organic Grocery',
    url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=700&auto=format&fit=crop&q=80',
    defaultDescription: 'Perfectly ripe, rich, and creamy organic avocados harvested straight from Ugandan smallholder highland orchards.',
    defaultPrice: 8000
  },
  {
    name: '🍓 Sweet Strawberries',
    defaultTitle: 'Highland Handpicked Strawberries',
    defaultCategory: 'Organic Grocery',
    url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=700&auto=format&fit=crop&q=80',
    defaultDescription: 'Luscious, sweet, premium grade fresh strawberries cultivated in the temperate volcanic soils of Mount Elgon.',
    defaultPrice: 15000
  },
  {
    name: '🌿 Raw Ginger Root',
    defaultTitle: 'Kampala Zingiber Ginger Root',
    defaultCategory: 'Organic Grocery',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=700&auto=format&fit=crop&q=80',
    defaultDescription: 'Incredibly aromatic and spicy fresh raw ginger, hand-washed and dried. Packed with wellness-enhancing properties.',
    defaultPrice: 6000
  },
  {
    name: '🍫 Dark Chocolate',
    defaultTitle: 'Sempiri Forest 80% Dark Chocolate',
    defaultCategory: 'Beverages & Pantry',
    url: 'https://images.unsplash.com/photo-1549007994-cb92ca8a3a77?w=700&auto=format&fit=crop&q=80',
    defaultDescription: 'Rich single-origin craft dark chocolate made with organic cocoa beans from the Sempiri forest boundary.',
    defaultPrice: 12000
  },
  {
    name: '☕ Sipi Falls Coffee',
    defaultTitle: 'Sipi Reserve Arabica Roast',
    defaultCategory: 'Beverages & Pantry',
    url: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=700&auto=format&fit=crop&q=80',
    defaultDescription: 'Delicious freshly roasted whole bean Arabica harvested from coffee cooperatives surrounding the beautiful Sipi Falls.',
    defaultPrice: 48000
  },
  {
    name: '🍯 Wild Mountain Honey',
    defaultTitle: 'Kigezi Wild Flower Raw Honey',
    defaultCategory: 'Organic Grocery',
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=700&auto=format&fit=crop&q=80',
    defaultDescription: 'Golden raw wildflower honey harvested sustainably from natural beehives in the Western Ugandan mountain slopes.',
    defaultPrice: 32000
  },
  {
    name: '📖 Suede Notebook',
    defaultTitle: 'Aesthetic Suede Bullet Journal',
    defaultCategory: 'Books & Stationery',
    url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=700&auto=format&fit=crop&q=80',
    defaultDescription: 'Bound book with smooth premium acid-free paper, flat lay binding, and durable suede texture hardcover.',
    defaultPrice: 35000
  },
  {
    name: '🖥️ Walnut Desk Shelf',
    defaultTitle: 'Minimalist Walnut Desk Shelf',
    defaultCategory: 'Minimalist Tech',
    url: 'https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=700&auto=format&fit=crop&q=80',
    defaultDescription: 'Handcrafted solid walnut desk organizer with clean steel legs designed to elevate monitor and storage space.',
    defaultPrice: 280000
  }
];

export default function AdminPanel({
  products,
  orders,
  onUpdateProducts,
  onUpdateOrders,
  categories,
  onAddCategory,
  onRemoveCategory,
  onEditCategory,
  storeSettings,
  onUpdateSettings
}: AdminPanelProps) {
  const { formatPrice } = useCurrency();
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'orders' | 'inventory' | 'categories' | 'coupons' | 'reviews' | 'settings'>('dashboard');

  // Live Admin Order Notifications state
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('aura_admin_sound_alert') !== 'false';
  });
  const [dismissedAlertOrderIds, setDismissedAlertOrderIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('aura_admin_dismissed_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showNotificationStreamHistory, setShowNotificationStreamHistory] = useState(false);
  const prevOrdersCountRef = React.useRef(orders.length);

  // Toggle sound setting
  const handleToggleSound = () => {
    const next = !soundAlertsEnabled;
    setSoundAlertsEnabled(next);
    localStorage.setItem('aura_admin_sound_alert', String(next));
    if (next) {
      playAdminOrderChime();
    }
  };

  // Dismiss a specific order notification
  const handleDismissOrderAlert = (orderId: string) => {
    const updated = [...dismissedAlertOrderIds, orderId];
    setDismissedAlertOrderIds(updated);
    try {
      sessionStorage.setItem('aura_admin_dismissed_alerts', JSON.stringify(updated));
    } catch {
      // Ignore sessionStorage errors
    }
  };

  // Play audio chime and trigger alert when a new order arrives
  React.useEffect(() => {
    if (orders.length > prevOrdersCountRef.current) {
      // New order detected!
      if (soundAlertsEnabled) {
        playAdminOrderChime();
      }
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders.length, soundAlertsEnabled]);

  // Find latest unprocessed or newest active order for live notification display
  const activeAlertOrder = React.useMemo(() => {
    if (orders.length === 0) return null;
    // Prefer the first order that hasn't been dismissed yet
    const notDismissed = orders.find((o) => !dismissedAlertOrderIds.includes(o.id));
    return notDismissed || null;
  }, [orders, dismissedAlertOrderIds]);

  // Product Form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(100000); // Uganda shillings defaults
  const [formCategory, setFormCategory] = useState(categories[0] || 'Minimalist Tech');
  const [formImages, setFormImages] = useState<string[]>([PRESET_IMAGES[0].url, '', '']);
  const formImage = formImages[0] || '';
  const [formFeatures, setFormFeatures] = useState('');
  const [formColors, setFormColors] = useState('Obsidian, White-Alabaster, Sage');
  const [formStock, setFormStock] = useState<number>(12);
  const [formNetWeightGram, setFormNetWeightGram] = useState<string>('');
  const [formUnitCount, setFormUnitCount] = useState<string>('');
  const [formUnitName, setFormUnitName] = useState<string>('');
  const [draggingOverSlot, setDraggingOverSlot] = useState<number | null>(null);

  // New Category states
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingNewCategoryInline, setIsAddingNewCategoryInline] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState<string>('');

  const setFormImageSlot = (slotIndex: number, val: string) => {
    setFormImages((prev) => {
      const next = [...prev];
      while (next.length < 3) next.push('');
      next[slotIndex] = val;
      return next;
    });
  };

  const handleImageFile = (file: File, slotIndex = 0) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, etc.).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress as JPEG with 0.7 quality to keep it very small (~20KB-40KB)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setFormImageSlot(slotIndex, compressedBase64);
          } else {
            setFormImageSlot(slotIndex, e.target.result as string);
          }
        };
        img.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Search filter
  const [inventorySearch, setInventorySearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'>('All');

  // Inline Price Edit state
  const [inlinePriceEditId, setInlinePriceEditId] = useState<string | null>(null);
  const [inlinePriceValue, setInlinePriceValue] = useState<number>(0);

  // Inline Stock Edit state
  const [inlineStockEditId, setInlineStockEditId] = useState<string | null>(null);
  const [inlineStockValue, setInlineStockValue] = useState<number>(0);

  // Deletion & Action Confirmation States
  const [isConfirmingClearCanceled, setIsConfirmingClearCanceled] = useState(false);
  const [confirmRemoveOrderId, setConfirmRemoveOrderId] = useState<string | null>(null);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);
  const [isConfirmingResetCatalog, setIsConfirmingResetCatalog] = useState(false);

  // Bulk Product Management states
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Hoisted Coupons Subtab States
  const [couponsList, setCouponsList] = useState<{ code: string; discount: number }[]>(() => {
    const defaultCoupons = [
      { code: 'AURA20', discount: 20 },
      { code: 'KAMPALA30', discount: 30 },
      { code: 'UGANDA10', discount: 10 },
      { code: 'FREE50', discount: 50 }
    ];
    try {
      const stored = localStorage.getItem('aura_coupons');
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return defaultCoupons;
  });
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState<number>(10);

  // Hoisted Reviews Subtab States
  const [customReviewsList, setCustomReviewsList] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('aura_custom_reviews');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedProdForReview, setSelectedProdForReview] = useState(products[0]?.id || '');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Hoisted Settings Subtab States
  const [settingsObj, setSettingsObj] = useState(() => {
    const defaultSettings = {
      shopName: 'shop corner',
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
        parsed.vatRate = 0;
        localStorage.setItem('aura_store_settings', JSON.stringify(parsed));
        return { ...defaultSettings, ...parsed, vatRate: 0 };
      }
    } catch {
      // Fallback
    }
    return defaultSettings;
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && typeof event.target.result === 'string') {
            setBulkInput(event.target.result);
          }
        };
        reader.readAsText(file);
      } else {
        alert('Please drop a valid .json file.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setBulkInput(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportProductsJSON = () => {
    if (products.length === 0) return;
    const jsonContent = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aura_Products_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  interface ProposedUpdate {
    productId: string;
    productName: string;
    isNew: boolean;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    isValid: boolean;
    error?: string;
  }

  const analyzeJSON = (jsonStr: string): {
    success: boolean;
    error?: string;
    updates: ProposedUpdate[];
    parsedData: any;
  } => {
    if (!jsonStr.trim()) {
      return { success: false, updates: [], parsedData: null };
    }
    try {
      const parsed = JSON.parse(jsonStr);
      let itemsToProcess: any[] = [];
      
      if (Array.isArray(parsed)) {
        itemsToProcess = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        const keys = Object.keys(parsed);
        const isMap = keys.every(key => typeof parsed[key] === 'object' && parsed[key] !== null);
        if (isMap) {
          itemsToProcess = keys.map(key => ({
            id: key,
            ...parsed[key]
          }));
        } else {
          itemsToProcess = [parsed];
        }
      } else {
        return { success: false, error: 'JSON must be an Array of product objects, or a Map of product IDs to fields.', updates: [], parsedData: null };
      }

      const proposed: ProposedUpdate[] = [];

      itemsToProcess.forEach((item, index) => {
        if (typeof item !== 'object' || item === null) {
          return;
        }

        const id = item.id;
        const existing = products.find(p => p.id === id);

        if (existing) {
          const changes: ProposedUpdate['changes'] = [];
          const allowedFields = [
            'name', 'description', 'price', 'category', 'rating', 'reviewsCount',
            'image', 'images', 'features', 'colors', 'sizes', 'stock',
            'netWeightGram', 'unitCount', 'unitName'
          ];

          allowedFields.forEach(field => {
            if (item[field] !== undefined) {
              const oldVal = (existing as any)[field];
              const newVal = item[field];
              
              let isDifferent = false;
              if (Array.isArray(oldVal) && Array.isArray(newVal)) {
                isDifferent = JSON.stringify(oldVal) !== JSON.stringify(newVal);
              } else {
                isDifferent = oldVal !== newVal;
              }

              if (isDifferent) {
                changes.push({
                  field,
                  oldValue: oldVal,
                  newValue: newVal
                });
              }
            }
          });

          proposed.push({
            productId: existing.id,
            productName: existing.name,
            isNew: false,
            changes,
            isValid: true
          });
        } else {
          const errors: string[] = [];
          if (!item.name) errors.push('Missing "name"');
          if (item.price === undefined) errors.push('Missing "price"');
          if (!item.category) errors.push('Missing "category"');

          const changes: ProposedUpdate['changes'] = [];
          Object.keys(item).forEach(k => {
            if (k !== 'id') {
              changes.push({
                field: k,
                oldValue: undefined,
                newValue: item[k]
              });
            }
          });

          proposed.push({
            productId: id || `prod_custom_${Date.now()}_${index}`,
            productName: item.name || `Unnamed Item #${index + 1}`,
            isNew: true,
            changes,
            isValid: errors.length === 0,
            error: errors.length > 0 ? errors.join(', ') : undefined
          });
        }
      });

      return {
        success: true,
        updates: proposed,
        parsedData: itemsToProcess
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Invalid JSON syntax.',
        updates: [],
        parsedData: null
      };
    }
  };

  const handleApplyBulkUpdates = (parsedData: any[]) => {
    const updatedProducts = [...products];
    const newProducts: Product[] = [];

    parsedData.forEach((item) => {
      const existingIndex = updatedProducts.findIndex((p) => p.id === item.id);
      if (existingIndex > -1) {
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          ...item
        };
      } else {
        if (item.name && item.price !== undefined && item.category) {
          const newProd: Product = {
            id: item.id || `prod_custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            description: item.description || 'No description provided.',
            price: Number(item.price),
            category: item.category,
            rating: item.rating !== undefined ? Number(item.rating) : 4.8,
            reviewsCount: item.reviewsCount !== undefined ? Number(item.reviewsCount) : 1,
            image: item.image || PRESET_IMAGES[0].url,
            stock: item.stock !== undefined ? Number(item.stock) : 12,
            features: Array.isArray(item.features) ? item.features : ['Certified minimalist build'],
            colors: Array.isArray(item.colors) ? item.colors : ['Selected Slate', 'Alabaster White'],
            sizes: Array.isArray(item.sizes) ? item.sizes : undefined,
            netWeightGram: item.netWeightGram !== undefined ? Number(item.netWeightGram) : undefined,
            unitCount: item.unitCount !== undefined ? Number(item.unitCount) : undefined,
            unitName: item.unitName || undefined
          };
          newProducts.push(newProd);
        }
      }
    });

    onUpdateProducts([...newProducts, ...updatedProducts]);
    setIsBulkOpen(false);
    setBulkInput('');
    alert(`Bulk updates processed! Applied changes to existing SKU lines and created ${newProducts.length} new product configurations.`);
  };

  const saveInlineStock = (id: string, value: number) => {
    const updated = products.map((prod) => {
      if (prod.id === id) {
        return { ...prod, stock: Math.max(0, value) };
      }
      return prod;
    });
    onUpdateProducts(updated);
    setInlineStockEditId(null);
  };

  const handleQuickRestock = (id: string, overrideValue?: number) => {
    const updated = products.map((prod) => {
      if (prod.id === id) {
        const currentStock = prod.stock !== undefined ? prod.stock : 12;
        const finalStock = overrideValue !== undefined ? overrideValue : currentStock + 10;
        return { ...prod, stock: Math.max(0, finalStock) };
      }
      return prod;
    });
    onUpdateProducts(updated);
  };

  const saveInlinePrice = (id: string) => {
    const updated = products.map((prod) => {
      if (prod.id === id) {
        return { ...prod, price: inlinePriceValue };
      }
      return prod;
    });
    onUpdateProducts(updated);
    setInlinePriceEditId(null);
  };

  // Top product sales data state & derivation
  const [chartMetric, setChartMetric] = useState<'quantity' | 'revenue'>('quantity');

  const chartData = React.useMemo(() => {
    const soldCounts: { [productId: string]: { name: string; quantity: number; revenue: number; category: string } } = {};
    
    // Sum real sales from orders
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const prodId = item.product.id;
        const qty = item.quantity;
        const price = item.product.price;
        const name = item.product.name;
        const cat = item.product.category;
        
        if (!soldCounts[prodId]) {
          soldCounts[prodId] = { name, quantity: 0, revenue: 0, category: cat };
        }
        soldCounts[prodId].quantity += qty;
        soldCounts[prodId].revenue += qty * price;
      });
    });

    const processedData = Object.entries(soldCounts).map(([id, info]) => ({
      id,
      name: info.name.length > 18 ? info.name.substring(0, 18) + '...' : info.name,
      fullName: info.name,
      quantity: info.quantity,
      revenue: info.revenue,
      category: info.category,
      isMock: false,
    }));

    if (processedData.length === 0) {
      // Return beautiful baseline statistics when no orders exist in local storage yet
      return products.slice(0, 6).map((prod, index) => {
        const mockQty = [28, 22, 19, 14, 11, 8][index] || 5;
        return {
          id: prod.id,
          name: prod.name.length > 18 ? prod.name.substring(0, 18) + '...' : prod.name,
          fullName: prod.name,
          quantity: mockQty,
          revenue: mockQty * prod.price,
          category: prod.category,
          isMock: true,
        };
      });
    }

    // Sort descending depending on selected metric
    return processedData.sort((a, b) => b[chartMetric] - a[chartMetric]).slice(0, 6);
  }, [orders, products, chartMetric]);

  // Daily Revenue Trends Data derivation
  const dailyRevenueData = React.useMemo(() => {
    const revenueByDate: { [date: string]: number } = {};

    orders.forEach((order) => {
      let dateLabel = 'Unknown';
      try {
        const d = new Date(order.date);
        if (!isNaN(d.getTime())) {
          // Format as "Jun 16"
          dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
          dateLabel = order.date.substring(0, 10);
        }
      } catch (e) {
        dateLabel = order.date;
      }
      revenueByDate[dateLabel] = (revenueByDate[dateLabel] || 0) + order.total;
    });

    const processed = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
      isMock: false
    }));

    if (processed.length === 0) {
      // 7-day clean visual baseline when sandbox order logs are empty
      const mockList = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const factor = [1.2, 0.8, 1.5, 1.1, 1.4, 0.9, 1.7][i % 7];
        mockList.push({
          date: label,
          revenue: Math.round(450000 * factor),
          isMock: true
        });
      }
      return mockList;
    }

    return processed.sort((a, b) => {
      try {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } catch {
        return 0;
      }
    });
  }, [orders]);

  // Metrics calculation
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'Processing').length;
  const shippedOrders = orders.filter((o) => o.status === 'Shipped').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const isOrderCancelled = (status?: string) => {
    const s = (status || '').toLowerCase().trim();
    return s === 'cancelled' || s === 'canceled';
  };
  const cancelledOrdersCount = orders.filter((o) => isOrderCancelled(o.status)).length;

  const handleResetCatalog = () => {
    localStorage.removeItem('aura_shop_products');
    window.location.reload();
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) {
      alert('Please fill out product name and description.');
      return;
    }

    const featuresArray = formFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const colorsArray = formColors
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const cleanImages = formImages.map((img) => img.trim()).filter(Boolean);
    const primaryImage = cleanImages[0] || PRESET_IMAGES[0].url;

    if (editingId) {
      // Edit mode
      const updated = products.map((prod) => {
        if (prod.id === editingId) {
          return {
            ...prod,
            name: formName,
            description: formDescription,
            price: formPrice,
            category: formCategory,
            image: primaryImage,
            images: cleanImages.length > 0 ? cleanImages : [primaryImage],
            stock: formStock,
            features: featuresArray.length > 0 ? featuresArray : prod.features,
            colors: colorsArray.length > 0 ? colorsArray : prod.colors,
            netWeightGram: formNetWeightGram ? parseFloat(formNetWeightGram) : undefined,
            unitCount: formUnitCount ? parseInt(formUnitCount, 10) : undefined,
            unitName: formUnitName || undefined
          };
        }
        return prod;
      });
      onUpdateProducts(updated);
      setEditingId(null);
    } else {
      // Create mode
      const newProduct: Product = {
        id: `prod_custom_${Date.now()}`,
        name: formName,
        description: formDescription,
        price: formPrice,
        category: formCategory,
        rating: 4.8,
        reviewsCount: 1,
        image: primaryImage,
        images: cleanImages.length > 0 ? cleanImages : [primaryImage],
        stock: formStock,
        features: featuresArray.length > 0 ? featuresArray : ['Certified minimalist build', 'Eco-friendly local materials', 'Durable high-performance construction'],
        colors: colorsArray.length > 0 ? colorsArray : ['Selected Slate', 'Alabaster White'],
        netWeightGram: formNetWeightGram ? parseFloat(formNetWeightGram) : undefined,
        unitCount: formUnitCount ? parseInt(formUnitCount, 10) : undefined,
        unitName: formUnitName || undefined
      };
      onUpdateProducts([newProduct, ...products]);
      setIsAdding(false);
    }

    // Reset Form fields
    resetForm();
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPrice(100000);
    setFormCategory(categories[0] || 'Minimalist Tech');
    setFormImages([PRESET_IMAGES[0].url, '', '']);
    setFormFeatures('');
    setFormColors('Obsidian, White-Alabaster, Sage');
    setFormStock(12);
    setFormNetWeightGram('');
    setFormUnitCount('');
    setFormUnitName('');
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormName(product.name);
    setFormDescription(product.description);
    setFormPrice(product.price);
    setFormCategory(product.category);

    let existing: string[] = [];
    if (product.images && product.images.length > 0) {
      existing = [...product.images];
    } else if (product.image) {
      existing = [product.image];
    }
    setFormImages([
      existing[0] || product.image || '',
      existing[1] || '',
      existing[2] || ''
    ]);

    setFormFeatures(product.features.join('\n'));
    setFormColors(product.colors ? product.colors.join(', ') : '');
    setFormStock(product.stock !== undefined ? product.stock : 12);
    setFormNetWeightGram(product.netWeightGram !== undefined ? product.netWeightGram.toString() : '');
    setFormUnitCount(product.unitCount !== undefined ? product.unitCount.toString() : '');
    setFormUnitName(product.unitName || '');
    setIsAdding(true);
  };

  const handleDeleteProduct = (id: string) => {
    onUpdateProducts(products.filter((p) => p.id !== id));
    setConfirmDeleteProductId(null);
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
         return { ...o, status };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  const handleRemoveOrder = (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    onUpdateOrders(updated);
    setConfirmRemoveOrderId(null);
  };

  const handleBulkRemoveCanceled = () => {
    const updated = orders.filter((o) => !isOrderCancelled(o.status));
    onUpdateOrders(updated);
    setIsConfirmingClearCanceled(false);
  };

  const handleCreateMockOrder = () => {
    // Generate a beautiful simulated local order from Kampala or Gulu to test the live pipelines
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const chosenMockCity = ['Kampala', 'Entebbe', 'Jinja', 'Gulu'][Math.floor(Math.random() * 4)];
    const mockShippingFee = chosenMockCity === 'Entebbe' ? 3000 : chosenMockCity === 'Kampala' ? 7000 : 10000;
    const mockOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: [{ product: randomProduct, quantity: 1, selectedColor: randomProduct.colors?.[0] }],
      shippingDetails: {
        fullName: ['Mark Ssebunya', 'Diana Kembabazi', 'Arthur Mpagi', 'Naomi Amumpaire'][Math.floor(Math.random() * 4)],
        email: 'customer@gmail.com',
        phone: ['+256 772 123 456', '+256 701 987 654', '+256 788 345 678', '+256 755 234 567'][Math.floor(Math.random() * 4)],
        address: ['Plot 14 Akii Bua Road, Nakasero', 'Plot 45 Ggaba Road, Kabalagala', 'Kanjokya Street, Kamwokya', 'Main Mosque Road, Gulu City'][Math.floor(Math.random() * 4)],
        city: chosenMockCity,
        postalCode: '+256',
        country: 'Uganda'
      },
      subtotal: randomProduct.price,
      shipping: mockShippingFee,
      tax: 0, // VAT excluded per policy
      total: randomProduct.price + mockShippingFee,
      status: 'Processing',
      paymentMethod: ['MTN MoMo', 'Airtel Money', 'Cash on Delivery'][Math.floor(Math.random() * 3)],
      paymentDetails: 'Simulated sandbox transfer authorized'
    };

    onUpdateOrders([mockOrder, ...orders]);
  };

  const handleExportOrdersToCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone / WhatsApp',
      'Email',
      'Country',
      'City',
      'Address',
      'Payment Method',
      'Subtotal',
      'Tax',
      'Shipping',
      'Total',
      'Status'
    ];

    const escaped = (val: string) => {
      if (val === undefined || val === null) return '""';
      const clean = val.replace(/"/g, '""');
      return `"${clean}"`;
    };

    const csvRows = [headers.join(',')];

    orders.forEach((o) => {
      const row = [
        escaped(o.id),
        escaped(o.date),
        escaped(o.shippingDetails.fullName),
        escaped(o.shippingDetails.phone || 'N/A'),
        escaped(o.shippingDetails.email),
        escaped(o.shippingDetails.country),
        escaped(o.shippingDetails.city),
        escaped(o.shippingDetails.address),
        escaped(o.paymentMethod || 'N/A'),
        o.subtotal.toString(),
        o.tax.toString(),
        o.shipping.toString(),
        o.total.toString(),
        escaped(o.status)
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aura_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInventory = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(inventorySearch.toLowerCase());
    if (inventoryFilter === 'low') {
      const stock = p.stock !== undefined ? p.stock : 12;
      return matchesSearch && stock <= 5;
    }
    return matchesSearch;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.shippingDetails.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.shippingDetails.city.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Recharts Custom Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 text-white p-3.5 rounded-xl shadow-xl text-xs max-w-[240px]">
          <p className="font-extrabold text-slate-100 mb-1.5">{data.fullName}</p>
          <div className="space-y-0.5 text-[11px] text-slate-350">
            <div>Category: <span className="text-slate-200 font-bold">{data.category}</span></div>
            <div>Units Sold: <span className="text-indigo-400 font-extrabold">{data.quantity} units</span></div>
            <div>Total Revenue: <span className="text-emerald-400 font-extrabold">{formatPrice(data.revenue)}</span></div>
          </div>
          {data.isMock && (
            <p className="text-amber-505/95 text-[10px] font-black mt-2 pt-1 border-t border-slate-800/80">
              ★ Sandbox Baseline Value
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="admin-panel-layout" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800 p-6 md:p-8 shadow-xs transition-colors duration-200">
      {/* Upper Badge & Admin Session Details */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-6 mb-8 gap-4 font-sans">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 dark:bg-slate-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white dark:text-slate-205">
              👑 Owner & Admin Access
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-305 border border-indigo-150/40 dark:border-indigo-800/40 animate-pulse">
              Uganda Delivery Active 🇺🇬
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
            Welcome, Administrator: <span className="underline select-all text-slate-900 dark:text-slate-300 font-extrabold">didaspabro@gmail.com</span>
          </p>
        </div>

        {/* System action controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="admin-reset-catalog-btn"
            type="button"
            onClick={handleResetCatalog}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50/40 dark:bg-rose-950/20 px-3 py-2 text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 transition-all cursor-pointer font-sans"
            title="Restore default product inventory"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Restore Factory Goods
          </button>
          
          <button
            id="admin-mock-order-btn"
            type="button"
            onClick={handleCreateMockOrder}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 px-3 py-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40 transition-all cursor-pointer font-sans"
            title="Sinks a mock Uganda client order"
          >
            <Plus className="h-3.5 w-3.5" />
            Simulate Uganda Order
          </button>
        </div>
      </div>

      {/* ADMIN LIVE INCOMING ORDER NOTIFICATION FIELD / BANNER */}
      <div id="admin-live-order-notification-field" className="mb-8 font-sans">
        {activeAlertOrder ? (
          <div className="rounded-2xl border-2 border-orange-500/80 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-950/40 dark:via-amber-950/20 dark:to-slate-950 p-5 shadow-md relative overflow-hidden transition-all animate-fadeIn">
            {/* Top Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-orange-200/60 dark:border-orange-900/40">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-600" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400 animate-bounce" />
                  Live Order Dispatch Alert
                </span>
                <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Order #{activeAlertOrder.id}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  • {activeAlertOrder.date}
                </span>
              </div>

              {/* Top Right Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    soundAlertsEnabled
                      ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                  title={soundAlertsEnabled ? 'Sound alert chime is active' : 'Sound alert is muted'}
                >
                  {soundAlertsEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  <span>{soundAlertsEnabled ? 'Chime ON' : 'Chime Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNotificationStreamHistory(!showNotificationStreamHistory)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                  title="Toggle recent incoming orders log"
                >
                  Stream History ({orders.length})
                </button>

                <button
                  type="button"
                  onClick={() => handleDismissOrderAlert(activeAlertOrder.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  title="Dismiss this notification alert"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
              {/* Customer Contact */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Customer &amp; Contact
                </span>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <User className="h-4 w-4 text-orange-500 shrink-0" />
                  {activeAlertOrder.shippingDetails.fullName}
                </p>
                {activeAlertOrder.shippingDetails.phone ? (
                  <div className="space-y-1 pt-1">
                    <p className="text-xs font-black text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {activeAlertOrder.shippingDetails.phone}
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <a
                        href={`https://wa.me/${activeAlertOrder.shippingDetails.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${activeAlertOrder.shippingDetails.fullName}, confirming your Shop Corner order #${activeAlertOrder.id}...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black shadow-2xs"
                      >
                        <MessageSquare className="h-3 w-3" />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${activeAlertOrder.shippingDetails.phone}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-bold"
                      >
                        <Phone className="h-3 w-3" />
                        Call
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No phone provided</p>
                )}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {activeAlertOrder.shippingDetails.email}
                </p>
              </div>

              {/* Delivery Location */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Delivery Destination
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-start gap-1">
                  <MapPin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    {activeAlertOrder.shippingDetails.address}, {activeAlertOrder.shippingDetails.city}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-5">
                  {activeAlertOrder.shippingDetails.country} • Postal {activeAlertOrder.shippingDetails.postalCode}
                </p>
                {activeAlertOrder.shippingDetails.distance && (
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold pl-5">
                    Rider Distance: ~{activeAlertOrder.shippingDetails.distance} km
                  </p>
                )}
              </div>

              {/* Items & Payment */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Purchased Items ({activeAlertOrder.items.length})
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1 no-scrollbar">
                  {activeAlertOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 gap-2">
                      <span className="truncate font-semibold">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white shrink-0">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">Payment:</span>
                  <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    {activeAlertOrder.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Order Total & Quick Actions */}
              <div className="space-y-2 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-slate-800 md:pl-4 pt-3 md:pt-0">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Total Settle Amount
                  </span>
                  <div className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
                    {formatPrice(activeAlertOrder.total)}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mt-1 ${
                    activeAlertOrder.status === 'Processing'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                      : activeAlertOrder.status === 'Shipped'
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                      : activeAlertOrder.status === 'Delivered'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                  }`}>
                    {activeAlertOrder.status === 'Processing' ? '⚡ Pending Dispatch' : activeAlertOrder.status}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  {activeAlertOrder.status === 'Processing' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(activeAlertOrder.id, 'Shipped')}
                      className="w-full py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Dispatch Rider (Mark Shipped)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubTab('orders');
                      setOrderSearch(activeAlertOrder.id);
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-750 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Inspect in Orders Pipeline</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  Live Dispatch Notification Gateway
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  All incoming orders acknowledged • Ready for instant alerts when a customer places an order.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSound}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  soundAlertsEnabled
                    ? 'bg-slate-900 dark:bg-slate-800 text-white'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500'
                }`}
                title={soundAlertsEnabled ? 'Sound alert is active' : 'Sound alert is muted'}
              >
                {soundAlertsEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span>{soundAlertsEnabled ? 'Sound Alert: ON' : 'Sound Alert: OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowNotificationStreamHistory(!showNotificationStreamHistory)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Recent Activity Log ({orders.length})
              </button>
            </div>
          </div>
        )}

        {/* Expandable Stream History Dropdown */}
        {showNotificationStreamHistory && (
          <div className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                Recent Order Stream History (Last 5 Incoming)
              </span>
              <button
                type="button"
                onClick={() => setDismissedAlertOrderIds([])}
                className="text-[11px] font-bold text-orange-600 hover:underline cursor-pointer"
              >
                Restore All Dismissed Alerts
              </button>
            </div>
            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No orders recorded in current database.</p>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map((ord) => (
                  <div
                    key={ord.id}
                    className="flex flex-wrap items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900 dark:text-white">#{ord.id}</span>
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">{ord.shippingDetails.fullName}</span>
                      {ord.shippingDetails.phone && (
                        <span className="text-[11px] text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {ord.shippingDetails.phone}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">({ord.shippingDetails.city})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-950 dark:text-white">{formatPrice(ord.total)}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ord.status === 'Processing'
                          ? 'bg-amber-100 text-amber-700'
                          : ord.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {ord.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubTab('orders');
                          setOrderSearch(ord.id);
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Subtabs navigation */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 mb-8 overflow-x-auto gap-4 no-scrollbar font-sans">
        {[
          { id: 'dashboard', label: 'Dashboard & Revenue Status', icon: TrendingUp },
          { id: 'orders', label: `Active Delivery Pipeline (${orders.length})`, icon: ShoppingBag },
          { id: 'inventory', label: `Inventory Master (${products.length})`, icon: Package },
          { id: 'categories', label: `Category Manager (${categories.length})`, icon: Tag },
          { id: 'coupons', label: 'Promo / Coupon Manager', icon: Ticket },
          { id: 'reviews', label: 'Reviews Moderator', icon: MessageSquare },
          { id: 'settings', label: 'Global Shop Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setIsAdding(false);
                setEditingId(null);
              }}
              className={`pb-3.5 text-xs font-black tracking-wide border-b-2 text-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'border-slate-900 dark:border-white text-slate-955 dark:text-white font-black'
                  : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Subtab Contents render */}
      <div id="admin-viewports">
        {/* SUBTAB 1: ANALYTICS DASHBOARD */}
        {activeSubTab === 'dashboard' && (
          <div id="admin-viewport-dashboard" className="space-y-8 animate-fadeIn">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-xs transition-colors duration-200">
                <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Gross Simulated Revenue</span>
                  <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
                </div>
                <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white tracking-tight font-sans">
                  {formatPrice(totalRevenue || 12400000)}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-1 block font-sans">
                  ★ 100% Delivery settlement rate
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-xs transition-colors duration-200">
                <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Uganda Pipeline Orders</span>
                  <ShoppingBag className="h-4.5 w-4.5 text-indigo-500" />
                </div>
                <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white tracking-tight font-sans">
                  {orders.length}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 block font-sans">
                  {pendingOrders} processing • {shippedOrders} dispatched
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-xs transition-colors duration-200">
                <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Catalog SKUs</span>
                  <Package className="h-4.5 w-4.5 text-amber-500" />
                </div>
                <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white tracking-tight font-sans">
                  {products.length}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 block font-sans">
                  Across 5 premium categories
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-xs transition-colors duration-200">
                <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Average Order (AOV)</span>
                  <Sparkles className="h-4.5 w-4.5 text-violet-500" />
                </div>
                <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white tracking-tight font-sans">
                  {formatPrice(orders.length > 0 ? Math.round(totalRevenue / orders.length) : 480000)}
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1 block font-sans">
                  High-ticket minimalist goods
                </span>
              </div>
            </div>

            {/* Hub gateways indicators */}
            <div className="rounded-2xl border border-indigo-100 dark:border-slate-800 bg-indigo-50/30 dark:bg-slate-955/40 p-5 font-sans">
              <h3 className="text-xs font-black uppercase text-indigo-950 dark:text-indigo-300 tracking-wider mb-3 animate-pulse">Live Uganda Gateway Statuses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold font-sans">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-150 dark:border-slate-800 shadow-2xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span>Airtel Money API: <span className="text-emerald-600 dark:text-emerald-400">Online</span></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-150 dark:border-slate-800 shadow-2xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span>MTN MoMo API: <span className="text-emerald-600 dark:text-emerald-400">Synced</span></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-150 dark:border-slate-800 shadow-2xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 shrink-0" />
                  <span>Kampala HUB Dispatch: <span className="text-indigo-600 dark:text-indigo-400">Active</span></span>
                </div>
              </div>
            </div>

            {/* Recharts Grid Section: Catalog Performance & Daily Revenue Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 font-sans">
              {/* Chart 1: Catalog Performance */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-955 dark:text-white uppercase tracking-widest">Catalog Performance Insights</h3>
                        {chartData[0]?.isMock && (
                          <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60 uppercase animate-pulse">
                            Sandbox Estimates
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Top-performing products analytics based on customer transactions.</p>
                    </div>

                    {/* Metric Selector Toggle Buttons */}
                    <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 p-1 border border-slate-100 dark:border-slate-800 self-start sm:self-center font-sans">
                      <button
                        type="button"
                        onClick={() => setChartMetric('quantity')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          chartMetric === 'quantity'
                            ? 'bg-white dark:bg-slate-800 text-slate-955 dark:text-white shadow-2xs font-extrabold'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                      >
                        Units Sold
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartMetric('revenue')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          chartMetric === 'revenue'
                            ? 'bg-white dark:bg-slate-800 text-slate-955 dark:text-white shadow-2xs font-extrabold'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                      >
                        Est. Revenue
                      </button>
                    </div>
                  </div>

                  {/* Bar Chart Container */}
                  <div className="h-[280px] w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={(val) => {
                            if (chartMetric === 'revenue') {
                              if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                              if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                              return val.toString();
                            }
                            return val.toString();
                          }}
                          dx={-10}
                        />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                        <Bar
                          dataKey={chartMetric === 'quantity' ? 'quantity' : 'revenue'}
                          radius={[6, 6, 0, 0]}
                          maxBarSize={48}
                        >
                          {chartData.map((entry, index) => {
                            const colors = ['#6366f1', '#4F46E5', '#4338CA', '#3730A3', '#312E81', '#1E1B4B'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {chartData[0]?.isMock && (
                  <div id="recharts-mock-notice-1" className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-[10px] font-medium text-slate-500 flex items-start gap-1.5">
                    <span className="text-slate-400 font-bold shrink-0">ℹ</span>
                    <p>No settled orders: showing simulated baseline statistics of master goods.</p>
                  </div>
                )}
              </div>

              {/* Chart 2: Daily Revenue Progress (Recharts AreaChart) */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Daily Revenue Insights</h3>
                        {dailyRevenueData[0]?.isMock && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-100 uppercase animate-pulse">
                            Sandbox Baseline
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Chronological summary of daily generated revenue.</p>
                    </div>
                  </div>

                  {/* Area Chart Container */}
                  <div className="h-[280px] w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dailyRevenueData}
                        margin={{ top: 10, right: 15, left: 10, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={(val) => {
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                            if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                            return val.toString();
                          }}
                          dx={-10}
                        />
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-slate-950 border border-slate-800 text-white p-3.5 rounded-xl shadow-xl text-xs">
                                  <p className="font-extrabold text-slate-200">{d.date}</p>
                                  <p className="text-emerald-400 font-black text-[13px] mt-1.5">
                                    {formatPrice(d.revenue)}
                                  </p>
                                  {d.isMock && (
                                    <p className="text-slate-400 text-[9px] mt-1">★ Sandbox Baseline Trend</p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#4f46e5"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#revenueGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {dailyRevenueData[0]?.isMock && (
                  <div id="recharts-mock-notice-2" className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 text-[10px] font-medium text-slate-550 flex items-start gap-1.5 font-sans">
                    <span className="text-slate-400 font-bold shrink-0">ℹ</span>
                    <p>No settled orders: showing simulated 7-day chronological billing baseline.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-955 dark:text-white uppercase tracking-widest font-sans">Recent Activity Streams</h3>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('orders')}
                  className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Manage active pipeline →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Inbox className="h-8 w-8 text-slate-350 dark:text-slate-650 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">No client orders recorded inside the local sandbox yet.</p>
                  <button
                    type="button"
                    onClick={handleCreateMockOrder}
                    className="mt-3 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Click to simulate a custom order in Uganda
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-100 dark:border-slate-800">
                        <th className="p-3.5">Order ID</th>
                        <th className="p-3.5">Customer details</th>
                        <th className="p-3.5">Destination Hub</th>
                        <th className="p-3.5 text-right">Settlement Total</th>
                        <th className="p-3.5">Method</th>
                        <th className="p-3.5 text-center">Pipeline State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 font-medium">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                          <td className="p-3.5 font-bold text-slate-900 dark:text-slate-300">{ord.id}</td>
                          <td className="p-3.5">
                            <span className="block font-bold text-slate-950 dark:text-white">{ord.shippingDetails.fullName}</span>
                            {ord.shippingDetails.phone && (
                              <span className="block text-[10px] font-bold text-orange-600 dark:text-orange-400">
                                📞 {ord.shippingDetails.phone}
                              </span>
                            )}
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500">{ord.shippingDetails.email}</span>
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-450">{ord.shippingDetails.city}, Uganda</td>
                          <td className="p-3.5 text-right font-black text-slate-950 dark:text-white">{formatPrice(ord.total)}</td>
                          <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400 text-[10px] uppercase">{ord.paymentMethod}</td>
                          <td className="p-3.5 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${
                              ord.status === 'Processing' ? 'bg-amber-100 text-amber-800 dark:bg-amber-955/40 dark:text-amber-300' :
                              ord.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-955/40 dark:text-indigo-300' :
                              ord.status === 'Cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-955/40 dark:text-rose-300' :
                              'bg-emerald-100 text-emerald-800 dark:bg-emerald-955/40 dark:text-emerald-300'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: ORDER PIPELINE MANAGEMENT */}
        {activeSubTab === 'orders' && (
          <div id="admin-viewport-orders" className="space-y-6 animate-fadeIn font-sans">
            {/* Search filter and Export actions for orders */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  id="order-search-input"
                  type="text"
                  placeholder="Search orders by ID, name, city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white py-2.5 pl-9 pr-4 text-xs transition-all focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {cancelledOrdersCount > 0 && (
                  !isConfirmingClearCanceled ? (
                    <button
                      id="btn-clear-canceled-orders"
                      type="button"
                      onClick={() => setIsConfirmingClearCanceled(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-xs font-bold rounded-xl shadow-2xs transition-all shrink-0 cursor-pointer"
                      title="Remove all canceled orders from history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear Canceled ({cancelledOrdersCount})</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 rounded-xl shadow-xs animate-fadeIn">
                      <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                        Permanently clear all {cancelledOrdersCount} canceled {cancelledOrdersCount === 1 ? 'order' : 'orders'}?
                      </span>
                      <button
                        id="btn-confirm-clear-canceled-orders"
                        type="button"
                        onClick={handleBulkRemoveCanceled}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        Yes, Delete All
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingClearCanceled(false)}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )
                )}

                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportOrdersToCSV}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-950 dark:bg-indigo-650 leading-none text-white hover:bg-slate-900 dark:hover:bg-indigo-600 text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Orders (CSV)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Status Segmented Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-2xl w-fit">
              {(['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((status) => {
                const count = status === 'All' 
                  ? orders.length 
                  : orders.filter((o) => o.status === status).length;
                const isSelected = orderStatusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-xs font-black'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>{status === 'Shipped' ? 'Dispatched 🚚' : status === 'Processing' ? 'Processing ⏳' : status === 'Delivered' ? 'Delivered ✅' : status === 'Cancelled' ? 'Cancelled ❌' : 'All Orders 📦'}</span>
                    <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-black ${
                      isSelected 
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-20 text-center rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/20 px-6">
                <Inbox className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300">
                  {orderStatusFilter === 'Cancelled' ? 'No Canceled Orders Found' : 'No Matching Orders Found'}
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                  {orderStatusFilter === 'Cancelled' 
                    ? "There are currently no canceled orders. You can cancel active orders from the user 'My Purchases' section, or select 'All Orders' above and change any order's Dispatch Status to 'Cancelled ❌' using the dropdown selector to instantly trigger the permanent remove options."
                    : "Try refining your search keyword or clearing filters."}
                </p>
                {orderStatusFilter === 'Cancelled' && (
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('All')}
                    className="mt-4 px-3.5 py-2 bg-slate-950 dark:bg-slate-850 hover:bg-slate-900 dark:hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    View All Active Pipeline
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    id={`order-mgmt-card-${ord.id}`}
                    className="p-5 border border-slate-150 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1">
                      {/* Top info */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-950 dark:text-white select-all">{ord.id}</span>
                        <span className="text-slate-350 dark:text-slate-600 text-[10px] font-bold">•</span>
                        <div className="flex items-center gap-1 text-slate-405 dark:text-slate-400 text-[10px] font-bold">
                           <Clock className="h-3 w-3" />
                          <span>Placed: {ord.date}</span>
                        </div>
                        <span className="text-slate-350 dark:text-slate-600 text-[10px] font-bold">•</span>
                        <span className="bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/40">
                          {ord.paymentMethod}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 pt-1">
                        <span className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-505 tracking-wider">Purchase breakdown</span>
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                            <span className="h-4.5 w-4.5 rounded bg-slate-100 dark:bg-slate-900 text-[10px] font-black text-slate-800 dark:text-slate-200 flex items-center justify-center">
                              {item.quantity}×
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{item.product.name}</span>
                            {item.selectedColor && (
                              <span className="text-[10px] bg-slate-50 dark:bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 dark:text-slate-300">
                                {item.selectedColor}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Shipping details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                        <div>
                          <span className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-505 tracking-wider mb-0.5">Receiving Customer</span>
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                            {ord.shippingDetails.fullName}
                          </span>
                          {ord.shippingDetails.phone && (
                            <span className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 text-[11px] mt-0.5">
                              <Phone className="h-3 w-3" />
                              {ord.shippingDetails.phone}
                            </span>
                          )}
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{ord.shippingDetails.email}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-505 tracking-wider mb-0.5">Uganda Address</span>
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span className="line-clamp-1">{ord.shippingDetails.address}</span>
                          </span>
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{ord.shippingDetails.city}, Ggaba Hub</span>
                        </div>
                      </div>

                      {/* Billing detail link */}
                      {ord.paymentDetails && (
                        <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <span className="font-bold text-slate-800 dark:text-slate-300">Authorization logs: </span> 
                          <span className="font-mono bg-slate-50 dark:bg-slate-900/40 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 dark:text-slate-300">{ord.paymentDetails}</span>
                        </div>
                      )}
                    </div>

                    {/* Right side: Amount + Status controls */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 lg:min-w-[190px] border-t lg:border-t-0 border-slate-105 dark:border-slate-800/80 pt-4 lg:pt-0">
                      <div className="text-left lg:text-right">
                        <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-widest">Amount Settled</span>
                        <span className="text-lg font-black text-slate-950 dark:text-white">{formatPrice(ord.total)}</span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          Delivery: {formatPrice(ord.shipping)}
                        </span>
                      </div>

                      <div className="space-y-1.5 w-full max-w-[150px]">
                        <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-505 tracking-wider lg:text-right">Dispatch Status</label>
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                          className={`w-full rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all focus:outline-hidden cursor-pointer ${
                            ord.status === 'Processing' ? 'bg-amber-50 dark:bg-amber-955/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-305' :
                            ord.status === 'Shipped' ? 'bg-indigo-50 dark:bg-indigo-955/20 border-indigo-200 dark:border-indigo-900/50 text-indigo-805 dark:text-indigo-305' :
                            ord.status === 'Cancelled' ? 'bg-rose-50 dark:bg-rose-955/20 border-rose-200 dark:border-rose-900/50 text-rose-805 dark:text-rose-305' :
                            'bg-emerald-50 dark:bg-emerald-955/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-305'
                          }`}
                        >
                          <option value="Processing" className="dark:bg-slate-900 dark:text-white">Processing ⏳</option>
                          <option value="Shipped" className="dark:bg-slate-900 dark:text-white">Dispatched 🚚</option>
                          <option value="Delivered" className="dark:bg-slate-900 dark:text-white">Delivered ✅</option>
                          <option value="Cancelled" className="dark:bg-slate-900 dark:text-white">Cancelled ❌</option>
                        </select>
                        {isOrderCancelled(ord.status) && (
                          confirmRemoveOrderId === ord.id ? (
                            <div className="w-full mt-2 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex flex-col gap-1.5 animate-fadeIn">
                              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 text-center">Permanently remove?</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOrder(ord.id)}
                                  className="flex-1 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-2xs transition-all"
                                >
                                  Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmRemoveOrderId(null)}
                                  className="flex-1 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                                >
                                  Keep
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmRemoveOrderId(ord.id)}
                              className="w-full mt-2 flex items-center justify-center gap-1 bg-rose-50/80 hover:bg-rose-150 dark:bg-rose-950/25 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-205 dark:border-rose-900/40 rounded-xl py-1.5 px-3 text-[11px] font-black transition-all duration-200 cursor-pointer"
                              title="Remove canceled order permanently"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Remove Order</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: INVENTORY HUB */}
        {activeSubTab === 'inventory' && (() => {
          const lowStockCount = products.filter((p) => (p.stock !== undefined ? p.stock : 12) <= 5).length;
          return (
            <div id="admin-viewport-inventory" className="space-y-6 animate-fadeIn">
              {/* Low-stock Notification Banner Alert */}
              {lowStockCount > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-amber-150 flex items-center justify-center text-amber-700 shrink-0">
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-amber-950 uppercase tracking-wide">Restock Alert: Supply Required</h4>
                      <p className="text-amber-700 font-medium">There are <strong className="underline">{lowStockCount} items</strong> running extremely low on inventory status. Please execute a quick restock on these SKU lines.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInventoryFilter('low')}
                    className="rounded-xl bg-amber-600 hover:bg-amber-750 text-white font-bold text-[10px] px-3.5 py-2 transition-all self-start sm:self-center uppercase tracking-wide"
                  >
                    View Low Items
                  </button>
                </div>
              )}

              {/* Header filters and Creator Button toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  <div className="relative max-w-sm flex-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      id="inventory-search-input"
                      type="text"
                      placeholder="Search products by SKU name or category..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white py-2 pl-9 pr-4 text-xs transition-all focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setInventoryFilter('all')}
                      className={`rounded-lg px-3 py-1.5 transition-all outline-hidden cursor-pointer ${
                        inventoryFilter === 'all'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                          : 'text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      All Items ({products.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryFilter('low')}
                      className={`rounded-lg px-3 py-1.5 flex items-center gap-1 transition-all outline-hidden cursor-pointer ${
                        inventoryFilter === 'low'
                          ? 'bg-rose-600 dark:bg-rose-700 text-white shadow-2xs font-extrabold'
                          : 'text-slate-500 dark:text-slate-450 hover:text-rose-600 dark:hover:text-rose-400'
                      }`}
                    >
                      Low Stock ({lowStockCount})
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    id="toggle-bulk-ops-btn"
                    type="button"
                    onClick={() => {
                      if (isBulkOpen) {
                        setIsBulkOpen(false);
                      } else {
                        setIsBulkOpen(true);
                        setIsAdding(false);
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl font-bold text-xs px-4 py-2.5 transition-all shadow-xs cursor-pointer ${
                      isBulkOpen
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-indigo-50 dark:bg-slate-800 text-indigo-750 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <RefreshCw className={`h-4 w-4 ${isBulkOpen ? 'animate-spin' : ''}`} />
                    {isBulkOpen ? 'Close Bulk Manager' : 'Bulk Import/Export'}
                  </button>

                  <button
                    id="toggle-add-product-btn"
                    type="button"
                    onClick={() => {
                      if (isAdding) {
                        setIsAdding(false);
                        setEditingId(null);
                        resetForm();
                      } else {
                        setIsAdding(true);
                        setIsBulkOpen(false);
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 dark:bg-indigo-650 hover:bg-slate-800 dark:hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 transition-all shadow-xs cursor-pointer"
                  >
                    {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isAdding ? 'Close Creator' : 'Create New Product'}
                  </button>
                </div>
              </div>

              {/* BULK PRODUCT MANAGEMENT SEGMENT */}
              {isBulkOpen && (
                <motion.div
                  id="bulk-product-panel"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 border border-amber-200 dark:border-amber-900/60 rounded-2xl bg-amber-50/10 dark:bg-amber-955/5 space-y-6 font-sans"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-slate-800">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <RefreshCw className="h-4.5 w-4.5 text-amber-650 dark:text-amber-400" />
                      Bulk Catalog management
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportProductsJSON}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-indigo-650 hover:bg-slate-800 dark:hover:bg-indigo-600 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                        title="Download JSON Catalog Export"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export Catalog (JSON)</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Export the current product registry as a structured file, or import an updated JSON array/mapping to perform live simultaneous field modifications (such as prices, stock, descriptions, and custom specifications).
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Area */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          JSON Import Input source
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Select file or paste below
                        </span>
                      </div>

                      {/* Drag & Drop File Zone */}
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-4.5 text-center transition-all ${
                          dragActive
                            ? 'border-indigo-500 bg-indigo-50/10'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <UploadCloud className="mx-auto h-7 w-7 text-slate-400 mb-1.5" />
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">
                          Drag & drop a `.json` catalog file here
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 mb-2">or select from file system</p>
                        <label className="inline-block rounded-lg border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-[10px] font-bold text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors">
                          Browse Files
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Textarea Paste */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Raw JSON Data Playground
                        </label>
                        <textarea
                          rows={6}
                          placeholder='[
  {
    "id": "prod_1",
    "price": 125000,
    "stock": 48
  }
]'
                          value={bulkInput}
                          onChange={(e) => setBulkInput(e.target.value)}
                          className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 text-xs transition-all focus:border-indigo-600 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    {/* Validation & Live Preview Area */}
                    <div className="space-y-3 flex flex-col h-full justify-between">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Interactive Changes Preview
                        </span>

                        {(() => {
                          const analysis = analyzeJSON(bulkInput);
                          if (!bulkInput.trim()) {
                            return (
                              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-10 text-center text-slate-400 dark:text-slate-500 text-xs">
                                Provide valid JSON content to view live updates, fields modified, and validation checks before applying changes.
                              </div>
                            );
                          }

                          if (!analysis.success) {
                            return (
                              <div className="rounded-xl border border-rose-200/60 bg-rose-50/10 dark:bg-rose-955/10 p-4 text-rose-600 dark:text-rose-400 text-xs font-mono space-y-1 animate-fadeIn">
                                <div className="font-bold flex items-center gap-1.5">
                                  <AlertTriangle className="h-4 w-4" />
                                  JSON Parsing Error
                                </div>
                                <p className="opacity-90">{analysis.error}</p>
                              </div>
                            );
                          }

                          const totalUpdates = analysis.updates.filter(u => !u.isNew).length;
                          const totalNew = analysis.updates.filter(u => u.isNew && u.isValid).length;
                          const totalErrors = analysis.updates.filter(u => !u.isValid).length;

                          return (
                            <div className="space-y-4 animate-fadeIn">
                              <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                                <span className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-955/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                                  ⚡ {totalUpdates} To Update
                                </span>
                                <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-955/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                                  ✦ {totalNew} To Create
                                </span>
                                {totalErrors > 0 && (
                                  <span className="px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                                    ⚠️ {totalErrors} Invalid Records
                                  </span>
                                )}
                              </div>

                              <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
                                <table className="w-full text-left border-collapse text-[11px]">
                                  <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                                      <th className="p-2">Target Product</th>
                                      <th className="p-2">Action / Status</th>
                                      <th className="p-2">Proposed Modifications</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {analysis.updates.map((update, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/30">
                                        <td className="p-2 font-bold text-slate-900 dark:text-white max-w-[140px] truncate">
                                          {update.productName}
                                          <span className="block text-[9px] text-slate-400 font-normal font-mono select-all">
                                            {update.productId}
                                          </span>
                                        </td>
                                        <td className="p-2">
                                          {update.isNew ? (
                                            update.isValid ? (
                                              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                                                CREATE ✦
                                              </span>
                                            ) : (
                                              <span className="text-rose-500 font-black" title={update.error}>
                                                INVALID ❌
                                              </span>
                                            )
                                          ) : (
                                            <span className="text-indigo-600 dark:text-indigo-400 font-black">
                                              UPDATE ⚡
                                            </span>
                                          )}
                                        </td>
                                        <td className="p-2 space-y-1">
                                          {update.changes.length === 0 ? (
                                            <span className="text-slate-400 italic">No fields modified (matches current values)</span>
                                          ) : (
                                            update.changes.map((change, cIdx) => (
                                              <div key={cIdx} className="text-[10px]">
                                                <span className="font-bold text-slate-500 uppercase tracking-wide text-[9px] mr-1">
                                                  {change.field}:
                                                </span>
                                                <span className="text-slate-400 line-through mr-1">
                                                  {typeof change.oldValue === 'object' ? JSON.stringify(change.oldValue) : String(change.oldValue)}
                                                </span>
                                                <span className="text-slate-850 dark:text-slate-200 font-bold bg-indigo-50/50 dark:bg-slate-850 px-1 py-0.5 rounded">
                                                  {typeof change.newValue === 'object' ? JSON.stringify(change.newValue) : String(change.newValue)}
                                                </span>
                                              </div>
                                            ))
                                          )}
                                          {update.error && (
                                            <div className="text-[9px] text-rose-500 font-semibold">
                                              Error: {update.error}
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => {
                            setIsBulkOpen(false);
                            setBulkInput('');
                          }}
                          className="rounded-xl border border-slate-250 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={
                            !bulkInput.trim() || !analyzeJSON(bulkInput).success || analyzeJSON(bulkInput).updates.length === 0 || analyzeJSON(bulkInput).updates.some(u => u.isNew && !u.isValid)
                          }
                          onClick={() => {
                            const analysis = analyzeJSON(bulkInput);
                            if (analysis.success && analysis.parsedData) {
                              handleApplyBulkUpdates(analysis.parsedData);
                            }
                          }}
                          className="rounded-xl bg-slate-950 dark:bg-indigo-650 hover:bg-slate-800 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-5 py-2 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Apply Bulk Updates
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CREATE / EDIT PRODUCT FORM SEGMENT */}
              {isAdding && (
                <motion.div
                  id="product-creator-panel"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 border border-indigo-150 dark:border-slate-800 rounded-2xl bg-indigo-50/15 dark:bg-slate-900/20 space-y-4 font-sans"
                >
                  <h3 className="text-sm font-black text-slate-955 dark:text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-indigo-100 dark:border-slate-800">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-650 dark:text-indigo-400" />
                    {editingId ? 'Modify Premium Product SKU' : 'Publish New Minimalist Product'}
                  </h3>

                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-650 dark:text-slate-400">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Minimalist Aluminum Mug"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-650 dark:text-slate-400">Category Bucket</label>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCategoryInline(!isAddingNewCategoryInline)}
                        className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {isAddingNewCategoryInline ? 'Select Existing' : '+ Add New Category'}
                      </button>
                    </div>

                    {isAddingNewCategoryInline ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type new category..."
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          className="flex-1 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = newCategoryInput.trim();
                            if (!val) return;
                            onAddCategory(val);
                            setFormCategory(val);
                            setNewCategoryInput('');
                            setIsAddingNewCategoryInline(false);
                          }}
                          className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden font-medium"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat} className="dark:bg-slate-900 dark:text-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-650 dark:text-slate-400">Price in UGX (Uganda Shillings)</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      placeholder="e.g. 150000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden font-bold"
                    />
                  </div>

                  {/* Stock Count */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-650 dark:text-slate-400">Initial Stock Inventory Count</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="e.g. 12"
                      value={formStock}
                      onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden font-bold"
                    />
                  </div>

                  {/* Value Assessment Metrics (Optional) */}
                  <div className="space-y-3 md:col-span-2 bg-indigo-50/25 dark:bg-indigo-950/15 rounded-2xl p-4 border border-indigo-100/30 dark:border-indigo-950/40">
                    <h4 className="text-xs font-black text-indigo-700 dark:text-indigo-400">Value Metrics (Optional)</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Configure weight (e.g. for grams/g) OR unit counts (e.g. for capsules, bands) to display the computed price per unit to shoppers.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Net Weight */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-650 dark:text-slate-400">Net Weight (Grams)</label>
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 150"
                          value={formNetWeightGram}
                          onChange={(e) => {
                            setFormNetWeightGram(e.target.value);
                            if (e.target.value) {
                              setFormUnitCount('');
                              setFormUnitName('');
                            }
                          }}
                          className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden"
                        />
                      </div>

                      {/* Unit Count */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-650 dark:text-slate-400">Unit/Piece Count</label>
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 10"
                          value={formUnitCount}
                          onChange={(e) => {
                            setFormUnitCount(e.target.value);
                            if (e.target.value) {
                              setFormNetWeightGram('');
                            }
                          }}
                          className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden"
                        />
                      </div>

                      {/* Unit Name */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-650 dark:text-slate-400">Unit Name (Label)</label>
                        <input
                          type="text"
                          placeholder="e.g. capsule, band, glass"
                          value={formUnitName}
                          onChange={(e) => {
                            setFormUnitName(e.target.value);
                            if (e.target.value) {
                              setFormNetWeightGram('');
                            }
                          }}
                          className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic Presets */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-650 dark:text-slate-400 mb-1">Aesthetic Preset Templates (Quick Selection & Auto-Fill)</label>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                      {PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormImageSlot(0, preset.url);
                            if (preset.defaultTitle) setFormName(preset.defaultTitle);
                            if (preset.defaultCategory) setFormCategory(preset.defaultCategory);
                            if (preset.defaultDescription) setFormDescription(preset.defaultDescription);
                            if (preset.defaultPrice) setFormPrice(preset.defaultPrice);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            formImages[0] === preset.url
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-black'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Images (Up to 3 Images) */}
                  <div className="space-y-3 md:col-span-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                          Product Images (Up to 3 Photos / Angles)
                        </label>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Add up to 3 images to allow buyers to browse multiple angles in the item details modal.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 rounded-full">
                        {formImages.filter((img) => img && img.trim() !== '').length} / 3 Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      {[0, 1, 2].map((slotIdx) => {
                        const imgVal = formImages[slotIdx] || '';
                        const isPrimary = slotIdx === 0;
                        const slotTitle = isPrimary ? 'Image 1 (Main / Cover)' : `Image ${slotIdx + 1} (Gallery Angle)`;
                        const isDragging = draggingOverSlot === slotIdx;

                        return (
                          <div
                            key={slotIdx}
                            className="flex flex-col justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                                {slotTitle}
                              </span>
                              {imgVal ? (
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                                  Loaded
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium text-slate-400">
                                  Optional
                                </span>
                              )}
                            </div>

                            {/* Image Preview or Dropzone */}
                            {imgVal ? (
                              <div className="relative w-full h-28 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center group border border-slate-200/80 dark:border-slate-800">
                                <img
                                  src={imgVal}
                                  alt={`Product angle ${slotIdx + 1}`}
                                  className="max-w-full max-h-full object-contain p-1"
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
                                  onClick={() => setFormImageSlot(slotIdx, '')}
                                  className="absolute top-1 right-1 rounded-full bg-rose-500 text-white p-1 shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
                                  title="Remove image"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDraggingOverSlot(slotIdx);
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDraggingOverSlot(null);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDraggingOverSlot(null);
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleImageFile(e.dataTransfer.files[0], slotIdx);
                                  }
                                }}
                                onClick={() => document.getElementById(`product-image-file-input-${slotIdx}`)?.click()}
                                className={`h-28 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-2 text-center cursor-pointer transition-all ${
                                  isDragging
                                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900'
                                }`}
                              >
                                <input
                                  id={`product-image-file-input-${slotIdx}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleImageFile(e.target.files[0], slotIdx);
                                    }
                                  }}
                                  className="hidden"
                                />
                                <UploadCloud className="h-5 w-5 text-slate-400 dark:text-slate-500 mb-1" />
                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                  Upload or Drag
                                </p>
                                <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5">
                                  PNG, JPG, WEBP
                                </p>
                              </div>
                            )}

                            {/* URL Input */}
                            <div>
                              <input
                                type="url"
                                placeholder={isPrimary ? "https://... (Main Image)" : "https://... (Angle URL)"}
                                value={imgVal && imgVal.startsWith('data:') ? '' : imgVal}
                                onChange={(e) => setFormImageSlot(slotIdx, e.target.value)}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-2.5 py-1.5 text-[11px] transition-all focus:border-indigo-600 focus:outline-hidden font-medium"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">Product Description</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Timeless details crafted meticulously..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  {/* Colors */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">Color Options (Comma separated list)</label>
                    <input
                      type="text"
                      placeholder="Obsidian Black, Chalk White, Slate Gray"
                      value={formColors}
                      onChange={(e) => setFormColors(e.target.value)}
                      className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  {/* Features */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 font-sans">Premium Specs (One feature per line)</label>
                    <textarea
                      rows={2}
                      placeholder="Double-wall vacuum protection&#10;Tactile aluminum framing&#10;Eco-certified local wool"
                      value={formFeatures}
                      onChange={(e) => setFormFeatures(e.target.value)}
                      className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex justify-end gap-2 md:col-span-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setEditingId(null);
                        resetForm();
                      }}
                      className="rounded-xl border border-slate-250 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-950 dark:bg-indigo-650 hover:bg-slate-800 dark:hover:bg-indigo-600 text-white font-bold text-xs px-5 py-2 transition-all shadow-xs cursor-pointer"
                    >
                      {editingId ? 'Apply SKU Changes' : 'Publish Product'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* INVENTORY TABLE SEGMENT */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3.5">SKU Image</th>
                    <th className="p-3.5">Product Title</th>
                    <th className="p-3.5">Category Bucket</th>
                    <th className="p-3.5 text-right">Standard Price</th>
                    <th className="p-3.5 text-center">Remaining Stock</th>
                    <th className="p-3.5 text-center">Reviews/Rating</th>
                    <th className="p-3.5 text-center">Inventory Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredInventory.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20">
                      <td className="p-3.5">
                        <img
                          src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80'}
                          alt={prod.name}
                          className="h-10 w-10 rounded-lg object-cover bg-slate-50 dark:bg-slate-905 border border-slate-100 dark:border-slate-800"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80';
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                      </td>
                      <td className="p-3.5">
                        <span className="block font-bold text-slate-950 dark:text-white leading-snug">{prod.name}</span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal line-clamp-1 max-w-[200px] mt-0.5">
                          {prod.description}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200/40 dark:border-slate-805/40">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-955 dark:text-white min-w-[180px]">
                        {inlinePriceEditId === prod.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-right text-xs font-black text-slate-950 dark:text-white focus:border-indigo-600 focus:outline-hidden"
                              value={inlinePriceValue}
                              onChange={(e) => setInlinePriceValue(parseInt(e.target.value, 10) || 0)}
                              autoFocus
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveInlinePrice(prod.id);
                                  } else if (e.key === 'Escape') {
                                    setInlinePriceEditId(null);
                                  }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => saveInlinePrice(prod.id)}
                              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 text-[10px] font-black transition-all cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setInlinePriceEditId(null)}
                              className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-300 px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 group select-none">
                            <div className="flex flex-col items-end">
                              <span className="font-extrabold text-slate-900 dark:text-white">{formatPrice(prod.price)}</span>
                              <span className="text-[10px] text-rose-500 line-through opacity-80">{formatPrice(Math.round(prod.price * 1.25))}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setInlinePriceEditId(prod.id);
                                setInlinePriceValue(prod.price);
                              }}
                              className="p-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/40 text-slate-400 dark:text-slate-500 hover:text-indigo-604 dark:hover:text-indigo-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 focus:outline-hidden transition-all duration-150 cursor-pointer"
                              title="Instant Price Adjuster"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-center min-w-[130px]">
                        {inlineStockEditId === prod.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              className="w-16 rounded-lg border border-slate-350 px-2 py-1 text-center text-xs font-black text-slate-950 focus:border-indigo-600 focus:outline-hidden"
                              value={inlineStockValue}
                              onChange={(e) => setInlineStockValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveInlineStock(prod.id, inlineStockValue);
                                } else if (e.key === 'Escape') {
                                  setInlineStockEditId(null);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => saveInlineStock(prod.id, inlineStockValue)}
                              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 text-[10px] font-black tracking-wide"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1.5 group select-none">
                            {(() => {
                              const stockVal = prod.stock !== undefined ? prod.stock : 12;
                              if (stockVal === 0) {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-[10px] font-extrabold text-red-700 dark:text-red-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                                    Out of Stock
                                  </span>
                                );
                              }
                              if (stockVal <= 5) {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/40 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-550 animate-pulse" />
                                    Low Stock ({stockVal})
                                  </span>
                                );
                              }
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-150 dark:border-emerald-900/30 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-550" />
                                  Available ({stockVal})
                                </span>
                              );
                            })()}
                            
                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  setInlineStockEditId(prod.id);
                                  setInlineStockValue(prod.stock !== undefined ? prod.stock : 12);
                                }}
                                className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-400 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickRestock(prod.id)}
                                className="text-[10px] px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-900 hover:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-slate-50 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 transition-colors font-bold cursor-pointer"
                                title="Add 10 SKU Restock"
                              >
                                +10
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-bold text-slate-850 dark:text-slate-200">★ {prod.rating}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">({prod.reviewsCount} logs)</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(prod)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                            title="Edit Product Details"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          {confirmDeleteProductId === prod.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black cursor-pointer shadow-2xs transition-all"
                                title="Confirm Delete Product"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteProductId(null)}
                                className="px-1.5 py-1 rounded-md bg-slate-150 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-pointer transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteProductId(prod.id)}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/55 bg-white dark:bg-slate-950 hover:border-rose-350 dark:hover:border-rose-700 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Product SKU"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )})()}

        {activeSubTab === 'categories' && (
          <div id="admin-viewport-categories" className="space-y-6 animate-fadeIn font-sans">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Manage Shop Categories
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                View, add, or prune product categories for your store catalog.
              </p>

              {/* Form to Add Category */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem('categoryName') as HTMLInputElement;
                  const name = input.value.trim();
                  if (name) {
                    onAddCategory(name);
                    input.value = '';
                  }
                }}
                className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md"
              >
                <div className="flex-1">
                  <input
                    name="categoryName"
                    required
                    type="text"
                    placeholder="e.g. Handmade Craft"
                    className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 dark:bg-indigo-600 text-white px-5 py-2.5 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer"
                >
                  Create Category
                </button>
              </form>
            </div>

            {/* List of Existing Categories */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm animate-fadeIn">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                <span className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Existing Categories ({categories.length})</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.map((cat) => {
                  const itemsInCat = products.filter((p) => p.category === cat).length;
                  const isEditing = editingCategory === cat;
                  return (
                    <div key={cat} className="flex items-center justify-between px-6 py-4 text-xs hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                      {isEditing ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const val = editingCategoryValue.trim();
                            if (val && val !== cat) {
                              onEditCategory(cat, val);
                            }
                            setEditingCategory(null);
                          }}
                          className="flex items-center gap-2 w-full max-w-lg"
                        >
                          <input
                            type="text"
                            value={editingCategoryValue}
                            onChange={(e) => setEditingCategoryValue(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-2.5 py-1.5 text-xs transition-all focus:border-indigo-600 focus:outline-hidden font-bold"
                            autoFocus
                            required
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-[10px] font-black text-white px-3 py-1.5 transition-all shadow-xs cursor-pointer uppercase tracking-wider"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 text-[10px] font-bold px-3 py-1.5 transition-all cursor-pointer uppercase tracking-wider"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{cat}</span>
                            <span className="ml-3 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">
                              {itemsInCat} {itemsInCat === 1 ? 'product' : 'products'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(cat);
                                setEditingCategoryValue(cat);
                              }}
                              className="rounded-lg p-1.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 transition-all cursor-pointer"
                              title="Rename Category"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (itemsInCat > 0) {
                                  alert(`Cannot remove category "${cat}" because it is currently assigned to ${itemsInCat} product(s). Please reassign or delete those products first.`);
                                  return;
                                }
                                onRemoveCategory(cat);
                              }}
                              className="rounded-lg p-1.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 transition-all cursor-pointer"
                              title="Remove Category"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: PROMO / COUPON MANAGER */}
        {activeSubTab === 'coupons' && (() => {
          const handleSaveCoupons = (newList: typeof couponsList) => {
            setCouponsList(newList);
            localStorage.setItem('aura_coupons', JSON.stringify(newList));
          };

          const handleAddCoupon = (e: React.FormEvent) => {
            e.preventDefault();
            const codeClean = newCode.trim().toUpperCase();
            if (!codeClean) return;
            if (couponsList.some((c) => c.code === codeClean)) {
              alert('This coupon code already exists!');
              return;
            }
            const updated = [...couponsList, { code: codeClean, discount: newDiscount }];
            handleSaveCoupons(updated);
            setNewCode('');
            setNewDiscount(10);
          };

          const handleDeleteCoupon = (code: string) => {
            const updated = couponsList.filter((c) => c.code !== code);
            handleSaveCoupons(updated);
          };

          return (
            <div id="admin-viewport-coupons" className="space-y-6 animate-fadeIn font-sans">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-indigo-650 dark:text-indigo-400" />
                  Promo & Coupon Code Manager
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Configure dynamic coupon codes that customers can enter at the checkout page to receive real discounts.
                </p>

                <form onSubmit={handleAddCoupon} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-lg items-end">
                  <div className="flex-1 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coupon Code</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. KAMPALA50"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden font-mono uppercase"
                    />
                  </div>
                  <div className="w-28 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discount (%)</label>
                    <input
                      required
                      type="number"
                      min={1}
                      max={100}
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs transition-all focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-950 dark:bg-indigo-650 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-600 transition-colors shrink-0 cursor-pointer h-[38px]"
                  >
                    Add Coupon
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Active Coupon Codes ({couponsList.length})</span>
                </div>
                {couponsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No active promo codes. Customers won't receive checkout discounts.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {couponsList.map((coupon) => (
                      <div key={coupon.code} className="flex items-center justify-between px-6 py-4 text-xs hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-slate-900 dark:text-white text-sm bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/40 uppercase">
                            {coupon.code}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                            -{coupon.discount}% Off Checkout Total
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon.code)}
                          className="rounded-lg p-1.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 transition-all cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* SUBTAB: REVIEWS MODERATOR */}
        {activeSubTab === 'reviews' && (() => {
          const handleSaveReviews = (newList: any[]) => {
            setCustomReviewsList(newList);
            localStorage.setItem('aura_custom_reviews', JSON.stringify(newList));
          };

          const handleAddReview = (e: React.FormEvent) => {
            e.preventDefault();
            if (!reviewerName.trim() || !reviewComment.trim() || !selectedProdForReview) return;
            
            const newReview = {
              id: 'rev_' + Math.floor(100000 + Math.random() * 900000),
              productId: selectedProdForReview,
              userName: reviewerName.trim(),
              rating: reviewRating,
              comment: reviewComment.trim(),
              date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            };

            const updated = [newReview, ...customReviewsList];
            handleSaveReviews(updated);
            setReviewerName('');
            setReviewComment('');
            setReviewRating(5);
            alert('Mock Review created and published successfully!');
          };

          const handleDeleteReview = (id: string) => {
            const updated = customReviewsList.filter((r) => r.id !== id);
            handleSaveReviews(updated);
          };

          return (
            <div id="admin-viewport-reviews" className="space-y-6 animate-fadeIn font-sans">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-650 dark:text-indigo-400" />
                  Product Reviews Moderator & Generator
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Manage client product reviews. Moderate spam content or inject custom mock reviews to drive customer confidence.
                </p>

                <form onSubmit={handleAddReview} className="mt-6 space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Product SKU</label>
                      <select
                        value={selectedProdForReview}
                        onChange={(e) => setSelectedProdForReview(e.target.value)}
                        className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reviewer Name</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Martha Namubiru"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rating (1 - 5 Stars)</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden font-bold"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                        <option value="3">⭐⭐⭐ (3 Stars)</option>
                        <option value="2">⭐⭐ (2 Stars)</option>
                        <option value="1">⭐ (1 Star)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Comment Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Type excellent testimonial/feedback here..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-slate-950 dark:bg-indigo-650 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-600 transition-colors cursor-pointer"
                  >
                    Inject Custom Review
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Moderated Custom Reviews ({customReviewsList.length})</span>
                </div>
                {customReviewsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No custom feedback injected yet. All current reviews on details pages are system defaults.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Array.from(new Map<string, any>(customReviewsList.map((r, i) => [r.id || `custom-${i}`, r])).values()).map((rev: any, idx: number) => {
                      const prod = products.find((p) => p.id === rev.productId);
                      return (
                        <div key={rev.id ? `${rev.id}_${idx}` : `admin-rev-${idx}`} className="p-6 text-xs hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors flex items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 dark:text-white">{rev.userName}</span>
                              <span className="text-slate-400 text-[10px]">{rev.date}</span>
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-650 dark:text-slate-300 font-medium font-sans">
                                SKU: {prod ? prod.name : rev.productId}
                              </span>
                            </div>
                            <div className="flex text-amber-400 text-[10px]">
                              {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                            </div>
                            <p className="text-slate-650 dark:text-slate-355 italic">"{rev.comment}"</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="rounded-lg p-1.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 transition-all cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* SUBTAB: SHOP SETTINGS */}
        {activeSubTab === 'settings' && (() => {
          const handleSaveSettings = (e: React.FormEvent) => {
            e.preventDefault();
            localStorage.setItem('aura_store_settings', JSON.stringify(settingsObj));
            if (onUpdateSettings) {
              onUpdateSettings(settingsObj);
            }
            alert('Store configuration successfully saved and synchronized across the shop layout!');
          };

          return (
            <div id="admin-viewport-settings" className="space-y-6 animate-fadeIn font-sans">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="h-4 w-4 text-indigo-650 dark:text-indigo-400" />
                  Global Store Configuration Settings
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Adjust general storefront details, delivery costs, tax calculations, and header banners.
                </p>

                <form onSubmit={handleSaveSettings} className="mt-6 space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Storefront Brand Name</label>
                      <input
                        required
                        type="text"
                        value={settingsObj.shopName}
                        onChange={(e) => setSettingsObj({ ...settingsObj, shopName: e.target.value })}
                        className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Header Announcement Banner</label>
                      <input
                        required
                        type="text"
                        value={settingsObj.bannerAnnouncement}
                        onChange={(e) => setSettingsObj({ ...settingsObj, bannerAnnouncement: e.target.value })}
                        className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Standard Delivery Rate (UGX)</label>
                      <input
                        required
                        type="number"
                        min={0}
                        value={settingsObj.standardShipping}
                        onChange={(e) => setSettingsObj({ ...settingsObj, standardShipping: Number(e.target.value) })}
                        className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivery Fee Policy</label>
                      <div className="w-full rounded-xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 px-3 py-2 text-xs font-bold truncate">
                        Kampala: UGX 7,000 • Entebbe: UGX 3,000
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">VAT / Tax Policy</label>
                      <div className="w-full rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 px-3 py-2 text-xs font-bold truncate">
                        VAT Excluded (0% Tax)
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-slate-950 dark:bg-indigo-650 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-600 transition-colors cursor-pointer"
                  >
                    Save Configuration Settings
                  </button>
                </form>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
