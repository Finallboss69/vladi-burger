export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  KITCHEN = 'KITCHEN',
  DELIVERY = 'DELIVERY',
}

export enum VipLevel {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum DeliveryType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

export enum IngredientType {
  BUN = 'BUN',
  MEAT = 'MEAT',
  CHEESE = 'CHEESE',
  VEGETABLE = 'VEGETABLE',
  SAUCE = 'SAUCE',
  TOPPING = 'TOPPING',
}

export enum OrderSource {
  WEB = 'WEB',
  RAPPI = 'RAPPI',
  PEDIDOSYA = 'PEDIDOSYA',
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  loyaltyPoints: number;
  vipLevel: VipLevel;
  avatarUrl?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  productCount?: number;
}

export interface ProductExtra {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  category?: Category;
  stock: number;
  isActive: boolean;
  isCombo: boolean;
  extras: ProductExtra[];
  comboItems?: ComboItem[];
}

export interface ComboItem {
  id: string;
  name: string;
  quantity: number;
  productId?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  price: number;
  type: IngredientType;
  imageUrl?: string;
  isActive: boolean;
}

export interface SelectedIngredient {
  ingredient: Ingredient;
  quantity: number;
}

export interface BurgerCreation {
  id: string;
  name: string;
  description?: string;
  userId: string;
  user?: { name: string; avatarUrl?: string };
  ingredients: Array<{ ingredientId: string; quantity: number; name: string }>;
  totalPrice: number;
  voteCount?: number;
  hasVoted?: boolean;
  isPublic: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
  city: string;
  zipCode: string;
  lat?: number;
  lng?: number;
}

export interface CartItem {
  id: string;
  product?: Product;
  name: string;
  price: number;
  quantity: number;
  extras: ProductExtra[];
  imageUrl?: string;
  isCustom: boolean;
  customIngredients?: SelectedIngredient[];
}

export interface OrderItem {
  id: string;
  productId?: string;
  product?: Product;
  name: string;
  price: number;
  quantity: number;
  extras?: ProductExtra[];
  isCustom: boolean;
  customIngredients?: Array<{ ingredientId: string; quantity: number; name: string }>;
}

export interface Order {
  id: string;
  orderNumber: number;
  userId: string;
  user?: User;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  deliveryType: DeliveryType;
  addressId?: string;
  address?: Address;
  scheduledAt?: string;
  notes?: string;
  pointsEarned: number;
  pointsRedeemed: number;
  paymentId?: string;
  paymentStatus?: string;
  review?: OrderReview;
  source: OrderSource;
  createdAt: string;
  updatedAt: string;
}

export interface OrderReview {
  id: string;
  orderId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  isPercent: boolean;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: string;
  value: Record<string, unknown>;
  imageUrl?: string;
  isActive: boolean;
}

export interface DeliverySchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  maxOrders: number;
  isActive: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  remainingSlots: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPhoto {
  id: string;
  userId: string;
  user?: { name: string };
  imageUrl: string;
  caption?: string;
  isApproved: boolean;
  likes: number;
  hasLiked?: boolean;
  createdAt: string;
}

export interface SatisfactionSurvey {
  id: string;
  orderId: string;
  food: number;
  service: number;
  delivery: number;
  comments?: string;
  createdAt: string;
}

export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  avgRating: number;
  activeCustomers: number;
  popularProducts: Array<{ name: string; count: number }>;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
