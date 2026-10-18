import React, { useState, useEffect } from 'react';
import { CartItem, ShippingDetails, Order, User as UserType } from '../types';
import { X, CreditCard, ChevronRight, CheckCircle2, ChevronLeft, ShoppingBag, ShieldCheck, Mail, User, MapPin, Sparkles, Banknote, Smartphone, Coins, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';
import OrderTrackingTimeline from './OrderTrackingTimeline';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderPlaced: (order: Order) => void;
  currentUser?: UserType | null;
}

type CheckoutStep = 'shipping' | 'payment' | 'completed';

export default function CheckoutModal({ isOpen, onClose, cartItems, onOrderPlaced, currentUser }: CheckoutModalProps) {
  const { formatPrice } = useCurrency();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [distance, setDistance] = useState<number>(5); // Default distance in km
  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Uganda'
  });

  // Auto-populate user's details if available when the modal opens or currentUser changes
  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        const userPhone = currentUser.shippingAddress?.phone || 
                          currentUser.linkedPhone || 
                          currentUser.mfaPhone || 
                          (currentUser.email && currentUser.email.endsWith('@phone.aura.com') ? currentUser.email.split('@')[0] : '');

        setShipping({
          fullName: currentUser.shippingAddress?.fullName || currentUser.name || '',
          email: (currentUser.shippingAddress?.email && !currentUser.shippingAddress.email.endsWith('@phone.aura.com'))
            ? currentUser.shippingAddress.email 
            : (currentUser.email && !currentUser.email.endsWith('@phone.aura.com')) 
              ? currentUser.email 
              : '',
          phone: userPhone || '',
          address: currentUser.shippingAddress?.address || '',
          city: currentUser.shippingAddress?.city || '',
          postalCode: currentUser.shippingAddress?.postalCode || '',
          country: currentUser.shippingAddress?.country || 'Uganda'
        });
        
        // Auto-detect distance based on city
        const cityLower = (currentUser.shippingAddress?.city || '').toLowerCase();
        if (cityLower.includes('jinja')) setDistance(82);
        else if (cityLower.includes('entebbe')) setDistance(42);
        else if (cityLower.includes('mukono')) setDistance(22);
        else if (cityLower.includes('kira')) setDistance(12);
        else if (cityLower.includes('wakiso')) setDistance(16);
        else if (cityLower.includes('nakasero')) setDistance(2);
        else if (cityLower.includes('kololo')) setDistance(3);
        else setDistance(5);
      } else {
        // Reset or keep empty for guest checkout
        setShipping({
          fullName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          postalCode: '',
          country: 'Uganda'
        });
        setDistance(5);
      }
    }
  }, [isOpen, currentUser]);

  const [payment, setPayment] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'airtel' | 'mtn'>('card');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoName, setMomoName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Promo / Coupon Code System state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // as percentage
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Totals calculations taking promo discount into account
  // Load settings and coupons dynamically
  const getStoreSettings = () => {
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
    } catch {
      // Fallback to defaultSettings
    }
    return defaultSettings;
  };

  const getCoupons = () => {
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
      // Fallback to defaultCoupons
    }
    return defaultCoupons;
  };

  const storeSettings = getStoreSettings();
  const couponsList = getCoupons();

  const subtotal = cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const discountAmount = subtotal * (appliedDiscount / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  // VAT is strictly excluded per customer requirement
  const tax = 0;
  
  // Delivery fee calculation: UGX 7,000 for areas within Kampala and UGX 3,000 for Entebbe
  const getDeliveryFeeDetails = () => {
    const text = `${shipping.city} ${shipping.postalCode} ${shipping.address}`.toLowerCase();
    
    // Check Entebbe
    if (text.includes('entebbe') || text.includes('kitoro') || text.includes('katabi')) {
      return {
        fee: 3000,
        zone: 'Entebbe Zone',
        label: 'Entebbe Delivery Rate',
        note: 'Flat UGX 3,000 for Entebbe'
      };
    }

    // Check Kampala areas
    const kampalaAreas = [
      'kampala', 'nakasero', 'kololo', 'nakawa', 'lubaga', 'rubaga', 'makindye', 'kawempe',
      'ntinda', 'bugolobi', 'kamwokya', 'bukoto', 'kisaasi', 'naguru', 'mengo', 'wandegeya',
      'luzira', 'muyenga', 'kansanga', 'kabalagala', 'kibuli', 'bwaise', 'namirembe', 'kira',
      'central', 'kyebando', 'kiwatule', 'naalya', 'kireka', 'banda', 'mutungo', 'wakiso'
    ];
    
    const isKampala = kampalaAreas.some(area => text.includes(area)) || !text.trim();
    if (isKampala) {
      return {
        fee: 7000,
        zone: 'Kampala Area',
        label: 'Kampala Delivery Rate',
        note: 'Flat UGX 7,000 for areas within Kampala'
      };
    }

    // Upcountry or other regional delivery (e.g. Jinja, Mukono, etc.)
    const upcountryRate = Math.max(7000, 3000 + (distance * 800));
    return {
      fee: upcountryRate,
      zone: 'Upcountry / Regional',
      label: `Upcountry Courier (${distance} km)`,
      note: `Base UGX 3,000 + UGX 800/km (${distance} km)`
    };
  };

  const deliveryDetails = getDeliveryFeeDetails();
  const calculatedDeliveryFee = deliveryDetails.fee;
  const delivery = calculatedDeliveryFee;
  const total = subtotalAfterDiscount + delivery;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);

    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a coupon code.');
      return;
    }

    const foundCoupon = couponsList.find((c: any) => c.code === code);

    if (foundCoupon) {
      const discount = foundCoupon.discount;
      setAppliedPromo(code);
      setAppliedDiscount(discount);
      setPromoSuccess(`Success! Code "${code}" applied: ${discount}% OFF`);
      setPromoInput('');
    } else {
      const suggestion = couponsList.map((c: any) => c.code).slice(0, 3).join(', ');
      setPromoError(`Invalid coupon. Try ${suggestion || 'AURA20'}!`);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setAppliedDiscount(0);
    setPromoSuccess(null);
    setPromoError(null);
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('shipping');
      setErrors({});
      setPlacedOrder(null);
      setPaymentMethod('card');
      setMomoNumber('');
      setMomoName('');
      setPromoInput('');
      setAppliedPromo(null);
      setAppliedDiscount(0);
      setPromoError(null);
      setPromoSuccess(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle shipping step change
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!shipping.fullName.trim()) newErrors.fullName = 'Full Name is required';
    
    // Validate Customer Contact Phone (Must Fill)
    if (!shipping.phone || !shipping.phone.trim()) {
      newErrors.phone = "Customer contact phone number is required";
    } else if (!/^[0-9+\s\-()]{9,18}$/.test(shipping.phone.trim())) {
      newErrors.phone = 'Please enter a valid 9-15 digit phone number (e.g. +256 700 123 456)';
    }

    if (!shipping.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shipping.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!shipping.address.trim()) newErrors.address = 'Street Address is required';
    if (!shipping.city.trim()) newErrors.city = 'City is required';
    if (!shipping.postalCode.trim()) newErrors.postalCode = 'Postal Code is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep('payment');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let chosenPaymentDetails = '';

    if (paymentMethod === 'card') {
      if (!payment.cardName.trim()) newErrors.cardName = 'Name on card is required';
      if (!payment.cardNumber.trim() || payment.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Valid 16-digit card number is required';
      }
      if (!payment.cardExpiry.trim() || !/^\d{2}\/\d{2}$/.test(payment.cardExpiry)) {
        newErrors.cardExpiry = 'Validity expiration (MM/YY) is required';
      }
      if (!payment.cardCvc.trim() || payment.cardCvc.length < 3) {
        newErrors.cardCvc = 'Valid CVC code is required';
      }
      chosenPaymentDetails = `Card ending in ${payment.cardNumber.split(' ').pop() || '••••'}`;
    } else if (paymentMethod === 'cash') {
      chosenPaymentDetails = 'Pay with Cash upon delivery';
    } else if (paymentMethod === 'airtel' || paymentMethod === 'mtn') {
      if (!momoNumber.trim()) {
        newErrors.momoNumber = 'Registered phone number is required';
      } else if (!/^[0-9+\s\-()]{9,16}$/.test(momoNumber.trim())) {
        newErrors.momoNumber = 'Please provide a valid 9-15 digit Mobile Money phone number';
      }
      if (!momoName.trim()) {
        newErrors.momoName = 'Mobile wallet registered account name is required';
      }
      chosenPaymentDetails = `${paymentMethod === 'airtel' ? 'Airtel Money ID' : 'MTN MoMo ID'}: ${momoNumber} (${momoName})`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Generate simulated order
    const randomOrderNum = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const mockOrder: Order = {
      id: randomOrderNum,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      items: [...cartItems],
      shippingDetails: { 
        ...shipping,
        distance,
        deliveryFee: calculatedDeliveryFee
      },
      subtotal: subtotalAfterDiscount,
      tax,
      shipping: delivery,
      total,
      status: 'Processing',
      paymentMethod: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'cash' ? 'Cash on Delivery' : paymentMethod === 'airtel' ? 'Airtel Money' : 'MTN MoMo',
      paymentDetails: appliedPromo 
        ? `${chosenPaymentDetails} (Coupon: ${appliedPromo} -${appliedDiscount}%)` 
        : chosenPaymentDetails
    };

    setPlacedOrder(mockOrder);
    onOrderPlaced(mockOrder);
    setCurrentStep('completed');
  };

  return (
    <div 
      id="checkout-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs md:p-6"
    >
      <motion.div
        id="checkout-modal-container"
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:flex-row max-h-[92vh] lg:max-h-[85vh]"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', damping: 24 }}
      >
        {/* Close Button */}
        {currentStep !== 'completed' && (
          <button
            id="checkout-close-btn"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}

        {/* Left Side: Step Forms */}
        <div id="checkout-form-panel" className="flex flex-1 flex-col p-6 md:p-8 overflow-y-auto">
          {/* Stepper progress headers */}
          {currentStep !== 'completed' && (
            <div id="checkout-stepper" className="mb-8 flex items-center gap-3">
              <span
                id="step-tag-shipping"
                className={`text-xs font-bold uppercase tracking-wider ${
                  currentStep === 'shipping' ? 'text-orange-500 font-extrabold' : 'text-slate-400'
                }`}
              >
                1. Shipping
              </span>
              <ChevronRight className="h-4 w-4 text-slate-300" />
              <span
                id="step-tag-payment"
                className={`text-xs font-bold uppercase tracking-wider ${
                  currentStep === 'payment' ? 'text-orange-500 font-extrabold' : 'text-slate-400'
                }`}
              >
                2. Method & Payment
              </span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 'shipping' && (
              <motion.div
                key="shipping-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5">
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Where should we deliver?</h3>
                  <p className="text-xs text-slate-400">Fill in your physical shipping address and customer contact details.</p>
                </div>

                <form id="shipping-form" onSubmit={handleShippingSubmit} className="space-y-5">
                  {/* Customer Contact Section - MUST FILL */}
                  <div className="rounded-2xl border border-orange-200/80 dark:border-orange-900/40 bg-orange-50/30 dark:bg-orange-950/20 p-4 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-orange-100 dark:border-orange-900/30 pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                        Customer Contact Information
                      </span>
                      <span className="text-[10px] font-extrabold bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Must Fill
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            Recipient Full Name <span className="text-red-500 font-black">*</span>
                          </span>
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          placeholder="e.g. Mukasa Joseph"
                          value={shipping.fullName}
                          onChange={(e) => {
                            setShipping({ ...shipping, fullName: e.target.value });
                            if (errors.fullName) setErrors({ ...errors, fullName: '' });
                          }}
                          className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-orange-500/25 ${
                            errors.fullName ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-orange-500'
                          }`}
                        />
                        {errors.fullName && <p id="error-fullName" className="mt-1 text-[11px] text-red-500 font-semibold">{errors.fullName}</p>}
                      </div>

                      {/* Customer Contact Phone Number - MUST FILL */}
                      <div>
                        <label htmlFor="customer-contact-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Smartphone className="h-3.5 w-3.5 text-orange-500" />
                            Customer Phone / WhatsApp <span className="text-red-500 font-black">*</span>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            id="customer-contact-phone"
                            name="phone"
                            type="tel"
                            placeholder="e.g. +256 700 123 456 or 0756 351 236"
                            value={shipping.phone || ''}
                            onChange={(e) => {
                              setShipping({ ...shipping, phone: e.target.value });
                              if (errors.phone) setErrors({ ...errors, phone: '' });
                            }}
                            className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-orange-500/25 ${
                              errors.phone ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-orange-500'
                            }`}
                          />
                        </div>
                        {errors.phone ? (
                          <p id="error-customer-phone" className="mt-1 text-[11px] text-red-500 font-semibold">{errors.phone}</p>
                        ) : (
                          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                            Required for delivery rider dispatch call &amp; SMS alerts.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          Email Address (for Receipt &amp; Tracking) <span className="text-red-500 font-black">*</span>
                        </span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="e.g. mukasa@gmail.com"
                        value={shipping.email}
                        onChange={(e) => {
                          setShipping({ ...shipping, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-orange-500/25 ${
                          errors.email ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-orange-500'
                        }`}
                      />
                      {errors.email && <p id="error-email" className="mt-1 text-[11px] text-red-500 font-semibold">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Physical Address Section */}
                  <div className="space-y-3.5">
                    <div>
                      <label htmlFor="address" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        Physical Street Address <span className="text-red-500 font-black">*</span>
                      </label>
                      <input
                        id="address"
                        type="text"
                        placeholder="e.g. Plot 45, Kampala Road, Apartment 3"
                        value={shipping.address}
                        onChange={(e) => {
                          setShipping({ ...shipping, address: e.target.value });
                          if (errors.address) setErrors({ ...errors, address: '' });
                        }}
                        className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-orange-500/25 ${
                          errors.address ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-orange-500'
                        }`}
                      />
                      {errors.address && <p id="error-address" className="mt-1 text-[11px] text-red-500 font-semibold">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-1">
                        <label htmlFor="city" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          City / Town <span className="text-red-500 font-black">*</span>
                        </label>
                        <input
                          id="city"
                          type="text"
                          placeholder="e.g. Kampala, Entebbe, Jinja"
                          value={shipping.city}
                          onChange={(e) => {
                            setShipping({ ...shipping, city: e.target.value });
                            if (errors.city) setErrors({ ...errors, city: '' });
                          }}
                          className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-orange-500/25 ${
                            errors.city ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-orange-500'
                          }`}
                        />
                        {errors.city && <p id="error-city" className="mt-1 text-[11px] text-red-500 font-semibold">{errors.city}</p>}
                      </div>

                      <div>
                        <label htmlFor="postalCode" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          District / Division <span className="text-red-500 font-black">*</span>
                        </label>
                        <input
                          id="postalCode"
                          type="text"
                          placeholder="e.g. Nakawa, Lubaga"
                          value={shipping.postalCode}
                          onChange={(e) => {
                            setShipping({ ...shipping, postalCode: e.target.value });
                            if (errors.postalCode) setErrors({ ...errors, postalCode: '' });
                          }}
                          className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-orange-500/25 ${
                            errors.postalCode ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-orange-500'
                          }`}
                        />
                        {errors.postalCode && <p id="error-postalCode" className="mt-1 text-[11px] text-red-500 font-semibold">{errors.postalCode}</p>}
                      </div>

                      <div>
                        <label htmlFor="country" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Country</label>
                        <select
                          id="country"
                          value={shipping.country}
                          disabled
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-600 dark:text-slate-300 transition-all cursor-not-allowed outline-hidden"
                        >
                          <option value="Uganda">Uganda (Local Delivery Only)</option>
                        </select>
                        <span className="mt-1 block text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                          ★ Standard express shipping restricted strictly within Uganda.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Distance-Based Delivery Estimator */}
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 mt-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        🚚 Delivery Estimator (by Distance)
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        Nakasero HQ Hub
                      </span>
                    </div>

                    {/* Pre-defined popular delivery points */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="block text-[10px] font-bold text-slate-500">Quick Destination Presets:</span>
                        <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                          Kampala: {formatPrice(7000)} • Entebbe: {formatPrice(3000)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Kampala Central', city: 'Kampala', dist: 5, dpt: 'Central', fee: 7000 },
                          { name: 'Nakasero', city: 'Kampala', dist: 2, dpt: 'Nakasero', fee: 7000 },
                          { name: 'Kololo', city: 'Kampala', dist: 3, dpt: 'Kololo', fee: 7000 },
                          { name: 'Nakawa', city: 'Kampala', dist: 6, dpt: 'Nakawa', fee: 7000 },
                          { name: 'Entebbe Hub', city: 'Entebbe', dist: 42, dpt: 'Entebbe', fee: 3000 },
                          { name: 'Kira/Wakiso', city: 'Kampala', dist: 12, dpt: 'Kira', fee: 7000 },
                          { name: 'Mukono', city: 'Mukono', dist: 22, dpt: 'Mukono', fee: 10000 },
                          { name: 'Jinja City', city: 'Jinja', dist: 82, dpt: 'Jinja', fee: 15000 }
                        ].map((loc) => {
                          const isSelected = (shipping.city.toLowerCase() === loc.city.toLowerCase() && (shipping.postalCode.toLowerCase() === loc.dpt.toLowerCase() || loc.city === 'Entebbe')) || (loc.city === 'Kampala' && shipping.city.toLowerCase() === 'kampala' && distance === loc.dist);
                          return (
                            <button
                              key={loc.name}
                              type="button"
                              onClick={() => {
                                setDistance(loc.dist);
                                setShipping({
                                  ...shipping,
                                  city: loc.city,
                                  postalCode: loc.dpt
                                });
                              }}
                              className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                                isSelected
                                  ? 'bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/40 dark:border-orange-900 dark:text-orange-400 font-black shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {loc.name} ({formatPrice(loc.fee)})
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Distance Slider (for Upcountry) */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Distance Reference:</span>
                        <span className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-md font-black">
                          {distance} km
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="150"
                        step="1"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-hidden"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                        <span>1 km (Central)</span>
                        <span>42 km (Entebbe)</span>
                        <span>150 km (Upcountry Hub)</span>
                      </div>
                    </div>

                    {/* Cost Breakdown Info */}
                    <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 p-2.5 text-[11px] flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="block font-semibold text-slate-700 dark:text-slate-300">
                          {deliveryDetails.label}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-none">
                          {deliveryDetails.note}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="space-y-0.5">
                          <span className="block font-black text-slate-900 dark:text-white text-xs">
                            {formatPrice(calculatedDeliveryFee)}
                          </span>
                          <span className="text-[9px] text-orange-600 dark:text-orange-400 font-bold">
                            {deliveryDetails.zone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      id="shipping-next-btn"
                      type="submit"
                      className="w-full flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-950 text-xs font-semibold text-white tracking-wide hover:bg-slate-800 transition-colors"
                    >
                      Continue to Payment
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {currentStep === 'payment' && (
              <motion.div
                key="payment-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Configure Payment</h3>
                    <p className="text-xs text-slate-400">All metrics are simulated. Input any mockup credentials below.</p>
                  </div>
                  <button
                    id="payment-back-btn"
                    type="button"
                    onClick={() => setCurrentStep('shipping')}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                </div>

                {/* Customer Contact & Delivery Destination Recap Bar */}
                <div id="checkout-contact-recap-bar" className="mb-5 rounded-2xl border border-orange-200/90 dark:border-orange-900/50 bg-orange-50/40 dark:bg-orange-950/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-orange-500" />
                        {shipping.fullName}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {shipping.phone}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {shipping.email}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="h-3 w-3" />
                        {shipping.address}, {shipping.city} ({distance} km)
                      </span>
                    </div>
                  </div>
                  <button
                    id="edit-contact-shipping-btn"
                    type="button"
                    onClick={() => setCurrentStep('shipping')}
                    className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 underline shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    Edit Contact &amp; Address
                  </button>
                </div>

                {/* Selector for Payment Methods */}
                <div className="mb-6">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Choose Payment Option
                  </span>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {/* Card Button */}
                    <button
                      id="pm-card-btn"
                      type="button"
                      onClick={() => {
                        setPaymentMethod('card');
                        setErrors({});
                      }}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'card'
                          ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <CreditCard className={`h-5 w-5 mb-1.5 ${paymentMethod === 'card' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-[11px] leading-tight">Credit Card</span>
                    </button>

                    {/* Cash Button */}
                    <button
                      id="pm-cash-btn"
                      type="button"
                      onClick={() => {
                        setPaymentMethod('cash');
                        setErrors({});
                      }}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-slate-800 bg-slate-50 text-slate-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <Banknote className={`h-5 w-5 mb-1.5 ${paymentMethod === 'cash' ? 'text-slate-800' : 'text-slate-400'}`} />
                      <span className="text-[11px] leading-tight">Cash (COD)</span>
                    </button>

                    {/* Airtel Button */}
                    <button
                      id="pm-airtel-btn"
                      type="button"
                      onClick={() => {
                        setPaymentMethod('airtel');
                        setErrors({});
                      }}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'airtel'
                          ? 'border-rose-600 bg-rose-50 text-rose-800 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <Smartphone className={`h-5 w-5 mb-1.5 ${paymentMethod === 'airtel' ? 'text-rose-600' : 'text-slate-400'}`} />
                      <span className="text-[11px] leading-tight text-nowrap">Airtel Money</span>
                    </button>

                    {/* MTN MoMo Button */}
                    <button
                      id="pm-mtn-btn"
                      type="button"
                      onClick={() => {
                        setPaymentMethod('mtn');
                        setErrors({});
                      }}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'mtn'
                          ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <Coins className={`h-5 w-5 mb-1.5 ${paymentMethod === 'mtn' ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span className="text-[11px] leading-tight text-nowrap">MTN MoMo</span>
                    </button>
                  </div>
                </div>

                <form id="payment-form" onSubmit={handlePaymentSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {paymentMethod === 'card' && (
                      <motion.div
                        key="pm-card-fields"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        {/* Simulated Credit Card Graphic */}
                        <div id="credit-card-graphic" className="mb-6 relative rounded-2xl bg-radial from-slate-800 to-slate-950 p-5 text-white shadow-lg overflow-hidden">
                          {/* Decorative mesh circle */}
                          <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-indigo-500/10 blur-xl" />
                          <div className="absolute -top-8 -left-8 h-20 w-20 rounded-full bg-indigo-500/20 blur-lg" />

                          <div className="flex items-center justify-between">
                            <CreditCard className="h-8 w-8 text-indigo-300" />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Simulated Card</span>
                          </div>

                          <div className="mt-8 text-lg font-mono tracking-widest">
                            {payment.cardNumber || '•••• •••• •••• ••••'}
                          </div>

                          <div className="mt-6 flex justify-between items-end">
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400">Cardholder</span>
                              <span className="text-xs font-medium tracking-wide uppercase line-clamp-1 min-h-[16px]">
                                {payment.cardName || 'YOUR FULL NAME'}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400">Expires</span>
                              <span className="text-xs font-medium tracking-wide min-h-[16px]">
                                {payment.cardExpiry || 'MM/YY'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="cardName" className="block text-xs font-semibold text-slate-600 mb-1.5">Cardholder Name</label>
                          <input
                            id="cardName"
                            type="text"
                            placeholder="Jane Doe"
                            value={payment.cardName}
                            onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 ${
                              errors.cardName ? 'border-red-300 bg-red-50/10 focus:border-red-400' : 'border-slate-200 focus:border-indigo-600'
                            }`}
                          />
                          {errors.cardName && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.cardName}</p>}
                        </div>

                        <div>
                          <label htmlFor="cardNumber" className="block text-xs font-semibold text-slate-600 mb-1.5">Card Number</label>
                          <input
                            id="cardNumber"
                            type="text"
                            maxLength={19}
                            placeholder="4111 2222 3333 4444"
                            value={payment.cardNumber}
                            onChange={(e) => setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })}
                            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 ${
                              errors.cardNumber ? 'border-red-300 bg-red-50/10 focus:border-red-400' : 'border-slate-200 focus:border-indigo-600'
                            }`}
                          />
                          {errors.cardNumber && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.cardNumber}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="cardExpiry" className="block text-xs font-semibold text-slate-600 mb-1.5">Exp Date (MM/YY)</label>
                            <input
                              id="cardExpiry"
                              type="text"
                              maxLength={5}
                              placeholder="11/28"
                              value={payment.cardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, '');
                                if (val.length > 2) {
                                  val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                }
                                setPayment({ ...payment, cardExpiry: val });
                              }}
                              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 ${
                                errors.cardExpiry ? 'border-red-300 bg-red-50/10 focus:border-red-400' : 'border-slate-200 focus:border-indigo-600'
                              }`}
                            />
                            {errors.cardExpiry && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.cardExpiry}</p>}
                          </div>

                          <div>
                            <label htmlFor="cardCvc" className="block text-xs font-semibold text-slate-600 mb-1.5">CVC / CVV</label>
                            <input
                              id="cardCvc"
                              type="password"
                              maxLength={4}
                              placeholder="•••"
                              value={payment.cardCvc}
                              onChange={(e) => setPayment({ ...payment, cardCvc: e.target.value.replace(/[^0-9]/g, '') })}
                              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 ${
                                errors.cardCvc ? 'border-red-300 bg-red-50/10 focus:border-red-400' : 'border-slate-200 focus:border-indigo-600'
                              }`}
                            />
                            {errors.cardCvc && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.cardCvc}</p>}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'cash' && (
                      <motion.div
                        key="pm-cash-fields"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="rounded-2xl border border-slate-150 bg-slate-50/80 p-5 text-slate-700"
                      >
                        <div className="flex gap-3.5 items-start">
                          <span className="p-2.5 rounded-xl bg-slate-900 text-white shrink-0">
                            <Banknote className="h-5 w-5" />
                          </span>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider mb-1">Cash on Delivery</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Pay securely upon receiving your package at your doorstep. A friendly courier agent will confirm and collect the physical cash on delivery.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {(paymentMethod === 'airtel' || paymentMethod === 'mtn') && (
                      <motion.div
                        key="pm-momo-fields"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        <div className={`p-4 rounded-2xl border flex gap-3 items-center ${
                          paymentMethod === 'airtel'
                            ? 'bg-rose-50/40 border-rose-100 text-rose-900'
                            : 'bg-amber-50/50 border-amber-100 text-amber-950'
                        }`}>
                          <span className={`p-2 rounded-xl shrink-0 ${
                            paymentMethod === 'airtel' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                          }`}>
                            {paymentMethod === 'airtel' ? <Smartphone className="h-5 w-5" /> : <Coins className="h-5 w-5" />}
                          </span>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wide leading-tight">
                              {paymentMethod === 'airtel' ? 'Airtel Money Secure Sandbox' : 'MTN MoMo Transfer Secure Sandbox'}
                            </h4>
                            <p className="text-[10px] opacity-75 mt-0.5">
                              Authenticate seamlessly. An encrypted simulated authorization alert will trigger on your device screen.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="momoNumber" className="block text-xs font-semibold text-slate-600 mb-1.5">
                              Mobile Wallet Number
                            </label>
                            <input
                              id="momoNumber"
                              type="tel"
                              placeholder={paymentMethod === 'airtel' ? 'e.g. 0701 234567' : 'e.g. 0772 123456'}
                              value={momoNumber}
                              onChange={(e) => setMomoNumber(e.target.value)}
                              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 ${
                                errors.momoNumber ? 'border-red-300 bg-red-50/10 focus:border-red-400' : 'border-slate-200 focus:border-indigo-600'
                              }`}
                            />
                            {errors.momoNumber && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.momoNumber}</p>}
                          </div>

                          <div>
                            <label htmlFor="momoName" className="block text-xs font-semibold text-slate-600 mb-1.5">
                              Registered Account holder Name
                            </label>
                            <input
                              id="momoName"
                              type="text"
                              placeholder="e.g. Alaba Ssewankambo"
                              value={momoName}
                              onChange={(e) => setMomoName(e.target.value)}
                              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 ${
                                errors.momoName ? 'border-red-300 bg-red-50/10 focus:border-red-400' : 'border-slate-200 focus:border-indigo-600'
                              }`}
                            />
                            {errors.momoName && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.momoName}</p>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-6">
                    <button
                      id="placed-order-secure-btn"
                      type="submit"
                      className="w-full flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-950 text-xs font-semibold text-white tracking-wide hover:bg-slate-800 transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Place Secure Order ({formatPrice(total)})
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {currentStep === 'completed' && placedOrder && (
              <motion.div
                key="completed-step"
                className="flex flex-col items-center justify-center py-8 text-center"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <div id="check-celebrate-bubble" className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-xs mb-5">
                  <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Order Confirmed
                </div>

                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order {placedOrder.id} Placed!</h3>
                <p className="mt-2 text-xs text-slate-500 max-w-sm">
                  Thank you for your purchase, <strong>{placedOrder.shippingDetails.fullName}</strong>. Delivery dispatch alerts &amp; rider calls will be made to <strong>{placedOrder.shippingDetails.phone || 'your phone'}</strong>, and invoice confirmation sent to <strong>{placedOrder.shippingDetails.email}</strong>.
                </p>

                <div id="invoice-receipt-mock" className="mt-6 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-left">
                  <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 border-b border-slate-100 pb-1.5">Invoice Details</span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date Placed:</span>
                      <span className="font-semibold text-slate-800">{placedOrder.date}</span>
                    </div>
                    {placedOrder.shippingDetails.phone && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Customer Contact:</span>
                        <span className="font-bold text-orange-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {placedOrder.shippingDetails.phone}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Shipping To:</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">{placedOrder.shippingDetails.address}, {placedOrder.shippingDetails.city}</span>
                    </div>
                    {placedOrder.shippingDetails.distance && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Delivery Distance:</span>
                        <span className="font-semibold text-slate-800">{placedOrder.shippingDetails.distance} km</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Charges:</span>
                      <span className="font-semibold text-slate-800">
                        {formatPrice(placedOrder.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Method:</span>
                      <span className="font-semibold text-slate-800">{placedOrder.paymentMethod}</span>
                    </div>
                    {placedOrder.paymentDetails && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Details:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[190px]" title={placedOrder.paymentDetails}>
                          {placedOrder.paymentDetails}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-100/80 pt-2 mt-2 font-bold text-slate-900">
                      <span>Amount Billed:</span>
                      <span className="text-sm font-black text-slate-950">{formatPrice(placedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Live Order Tracking Timeline */}
                <div className="mt-6 w-full text-left">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
                    🚚 Live Logistics & Delivery Schedule
                  </h4>
                  <OrderTrackingTimeline order={placedOrder} />
                </div>

                <div className="mt-8 w-full flex flex-col sm:flex-row gap-3">
                  <button
                    id="checkout-completed-close-btn"
                    type="button"
                    onClick={onClose}
                    className="flex-1 flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Cost Breakdown panel (Hidden on Success state) */}
        {currentStep !== 'completed' && (
          <div id="checkout-breakdown-panel" className="w-full bg-slate-50 p-6 md:p-8 lg:w-96 lg:border-l lg:border-slate-100 flex flex-col overflow-y-auto max-h-[35vh] lg:max-h-full">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Bag Summary</h4>

            <div id="checkout-items-list" className="flex-1 space-y-3 overflow-y-auto pr-1">
              {cartItems.map((item, index) => (
                <div key={`${item.product.id}-${index}`} className="flex gap-3 text-xs">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-200">
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
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-slate-800 truncate">{item.product.name}</h5>
                    <span className="text-[10px] text-slate-400">Qty: {item.quantity} {item.selectedColor ? `| ${item.selectedColor}` : ''}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Promo / Coupon Code Section */}
            <div id="checkout-promo-section" className="mt-6 border-t border-slate-200/60 pt-5 pr-1 text-xs">
              <span className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Promo Code</span>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl">
                  <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                    <span>🎉 code</span>
                    <strong className="bg-[#10b981]/15 px-2 py-0.5 rounded-md font-extrabold">{appliedPromo}</strong>
                    <span>(-{appliedDiscount}%)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-[10px] font-black text-rose-500 hover:text-rose-600 underline transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. AURA20, FREE50"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none uppercase font-bold text-slate-700 tracking-wide placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p id="checkout-promo-err" className="text-[10px] font-bold text-rose-500 ml-0.5">{promoError}</p>
                  )}
                  {promoSuccess && (
                    <p id="checkout-promo-succ" className="text-[10px] font-bold text-emerald-600 ml-0.5">{promoSuccess}</p>
                  )}
                </form>
              )}
            </div>

            <div id="checkout-pricing-summary" className="mt-5 border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3.5 text-xs font-sans">
              {/* Product Totals */}
              <div className="space-y-1.5 pb-2 border-b border-dashed border-slate-100 dark:border-slate-800">
                <div className="flex justify-between font-medium text-slate-500 dark:text-slate-400">
                  <span>Items Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span className="font-bold text-slate-850 dark:text-slate-200">{formatPrice(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Promo Discount ({appliedDiscount}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 px-2 py-1 rounded-lg">
                    <span>Product Total after Promo</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatPrice(subtotalAfterDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Delivery Fee Highlight Panel */}
              <div className="bg-orange-50/40 dark:bg-orange-950/10 border border-orange-100/60 dark:border-orange-900/20 rounded-2xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-wider text-orange-850 dark:text-orange-400 flex items-center gap-1">
                    🚚 Calculated Delivery Fee
                  </span>
                  <span className="text-[10px] bg-orange-100/70 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 font-extrabold px-2 py-0.5 rounded-md">
                    {deliveryDetails.zone}
                  </span>
                </div>
                
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex justify-between">
                    <span>Delivery Location</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{shipping.city ? `${shipping.city}${shipping.postalCode ? `, ${shipping.postalCode}` : ''}` : 'Kampala (Default)'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Applied Rate</span>
                    <span>{deliveryDetails.note}</span>
                  </div>
                  
                  <div className="border-t border-orange-100/50 dark:border-orange-900/20 pt-1.5 mt-1 flex justify-between items-center font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Total Delivery Cost:</span>
                    <span className="text-slate-900 dark:text-white font-black text-xs bg-orange-100/50 dark:bg-orange-950/40 px-2.5 py-1 rounded-lg">
                      {formatPrice(calculatedDeliveryFee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tax and Grand Total */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span>VAT / Sales Tax</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">Excluded</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(0)}</span>
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Grand Total</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-indigo-700 dark:text-indigo-400">{formatPrice(total)}</span>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Includes delivery (UGX 7,000 Kampala / UGX 3,000 Entebbe • VAT Excluded)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
