export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviewsCount: number;
  image: string;
  images?: string[];
  features: string[];
  colors?: string[];
  sizes?: string[];
  stock?: number;
  netWeightGram?: number;
  unitCount?: number;
  unitName?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  distance?: number;
  deliveryFee?: number;
}

export interface OrderTrackingEvent {
  id: string;
  stage: 'placed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  completed: boolean;
  current?: boolean;
}

export interface OrderTrackingInfo {
  trackingNumber: string;
  carrier: string;
  carrierService: string;
  estimatedDeliveryDate: string;
  currentStage: 'placed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  events: OrderTrackingEvent[];
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  shippingDetails: ShippingDetails;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod?: string;
  paymentDetails?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: string;
  trackingInfo?: OrderTrackingInfo;
}

export type Category = string;

export interface FilterPreset {
  id: string;
  name: string;
  category: Category;
  search: string;
}

export interface SecurityAlert {
  id: string;
  type: 'login' | 'mfa' | 'password' | 'unlink' | 'link';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  ipAddress?: string;
  resolved?: boolean;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  orderId?: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  role?: 'Customer' | 'VIP' | 'Admin';
  shippingAddress?: ShippingDetails;
  isFallback?: boolean;
  mfaEnabled?: boolean;
  mfaMethod?: 'phone' | 'totp';
  mfaPhone?: string;
  mfaSecret?: string;
  linkedEmail?: string;
  linkedPhone?: string;
  cart?: CartItem[];
  mfaPhoneEnabled?: boolean;
  mfaTotpEnabled?: boolean;
  mfaPreferredMethod?: 'phone' | 'totp';
  securityAlertSettings?: {
    loginAlerts: boolean;
    changeAlerts: boolean;
    unusualIpAlerts: boolean;
    smsAlerts: boolean;
    emailAlerts: boolean;
  };
  securityAlerts?: SecurityAlert[];
}

