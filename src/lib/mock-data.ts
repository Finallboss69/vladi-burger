import type {
  Product, Category, Ingredient, IngredientType, BurgerCreation,
  BlogPost, CustomerPhoto, Order, OrderStatus, DeliveryType,
  OrderSource, LoyaltyReward, DeliverySchedule, TimeSlot,
  DashboardStats, User, VipLevel, Role, Address,
} from '@/types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Hamburguesas', slug: 'hamburguesas', description: 'Nuestras hamburguesas artesanales', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', sortOrder: 0, productCount: 6 },
  { id: '2', name: 'Adicionales', slug: 'adicionales', description: 'Complementá tu pedido', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800', sortOrder: 1, productCount: 4 },
  { id: '3', name: 'Bebidas', slug: 'bebidas', description: 'Refrescate', imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=800', sortOrder: 2, productCount: 5 },
  { id: '4', name: 'Combos', slug: 'combos', description: 'Las mejores combinaciones', imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800', sortOrder: 3, productCount: 3 },
];

export const mockProducts: Product[] = [
  {
    id: '1', name: 'Vladi Clásica', slug: 'vladi-clasica', description: 'Nuestra hamburguesa insignia con carne 100% vacuna, queso cheddar, lechuga, tomate y nuestra salsa secreta Vladi.',
    price: 4500, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', categoryId: '1', category: mockCategories[0],
    stock: 50, isActive: true, isCombo: false,
    extras: [{ id: 'e1', name: 'Bacon', price: 800 }, { id: 'e2', name: 'Huevo frito', price: 600 }, { id: 'e3', name: 'Doble carne', price: 1200 }],
  },
  {
    id: '2', name: 'Vladi BBQ', slug: 'vladi-bbq', description: 'Hamburguesa con salsa BBQ ahumada, cebolla crispy, bacon y queso provolone.',
    price: 5200, imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800', categoryId: '1', category: mockCategories[0],
    stock: 3, isActive: true, isCombo: false,
    extras: [{ id: 'e1', name: 'Bacon', price: 800 }, { id: 'e4', name: 'Aros de cebolla', price: 700 }],
  },
  {
    id: '3', name: 'Vladi Doble', slug: 'vladi-doble', description: 'Doble carne, doble queso, doble placer. Para los que quieren más.',
    price: 6800, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800', categoryId: '1', category: mockCategories[0],
    stock: 25, isActive: true, isCombo: false,
    extras: [{ id: 'e1', name: 'Bacon', price: 800 }, { id: 'e2', name: 'Huevo frito', price: 600 }],
  },
  {
    id: '4', name: 'Vladi Veggie', slug: 'vladi-veggie', description: 'Medallón de lentejas y quinoa, queso vegano, rúcula, tomate y palta.',
    price: 4800, imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595e6cdc07c?w=800', categoryId: '1', category: mockCategories[0],
    stock: 15, isActive: true, isCombo: false,
    extras: [{ id: 'e5', name: 'Extra palta', price: 500 }],
  },
  {
    id: '5', name: 'Vladi Picante', slug: 'vladi-picante', description: 'Con jalapeños, salsa sriracha, pepper jack y cebolla morada.',
    price: 5500, imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800', categoryId: '1', category: mockCategories[0],
    stock: 2, isActive: true, isCombo: false,
    extras: [{ id: 'e6', name: 'Extra jalapeños', price: 400 }],
  },
  {
    id: '6', name: 'Vladi Blue', slug: 'vladi-blue', description: 'Queso azul, champiñones salteados, rúcula y cebolla caramelizada.',
    price: 5800, imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800', categoryId: '1', category: mockCategories[0],
    stock: 20, isActive: true, isCombo: false,
    extras: [{ id: 'e7', name: 'Extra queso azul', price: 600 }],
  },
  {
    id: '7', name: 'Papas Fritas', slug: 'papas-fritas', description: 'Papas fritas crocantes con sal marina.',
    price: 1800, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800', categoryId: '2', category: mockCategories[1],
    stock: -1, isActive: true, isCombo: false, extras: [],
  },
  {
    id: '8', name: 'Aros de Cebolla', slug: 'aros-de-cebolla', description: 'Aros de cebolla empanados y dorados.',
    price: 2200, imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800', categoryId: '2', category: mockCategories[1],
    stock: -1, isActive: true, isCombo: false, extras: [],
  },
  {
    id: '9', name: 'Nuggets x6', slug: 'nuggets', description: '6 nuggets de pollo con salsa a elección.',
    price: 2500, imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800', categoryId: '2', category: mockCategories[1],
    stock: 10, isActive: true, isCombo: false,
    extras: [{ id: 'e8', name: 'Salsa BBQ', price: 200 }, { id: 'e9', name: 'Salsa Ranch', price: 200 }],
  },
  {
    id: '10', name: 'Coca-Cola', slug: 'coca-cola', description: 'Coca-Cola 500ml.', price: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=800', categoryId: '3', category: mockCategories[2],
    stock: -1, isActive: true, isCombo: false, extras: [],
  },
  {
    id: '11', name: 'Agua Mineral', slug: 'agua-mineral', description: 'Agua mineral 500ml.', price: 800,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800', categoryId: '3', category: mockCategories[2],
    stock: -1, isActive: true, isCombo: false, extras: [],
  },
  {
    id: '12', name: 'Cerveza Artesanal', slug: 'cerveza-artesanal', description: 'Cerveza artesanal IPA 473ml.', price: 2800,
    imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800', categoryId: '3', category: mockCategories[2],
    stock: 8, isActive: true, isCombo: false, extras: [],
  },
  {
    id: '13', name: 'Combo Vladi', slug: 'combo-vladi', description: 'Vladi Clásica + Papas Fritas + Bebida a elección.',
    price: 6500, imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800', categoryId: '4', category: mockCategories[3],
    stock: -1, isActive: true, isCombo: true, extras: [],
    comboItems: [{ id: 'c1', name: 'Vladi Clásica', quantity: 1 }, { id: 'c2', name: 'Papas Fritas', quantity: 1 }, { id: 'c3', name: 'Bebida', quantity: 1 }],
  },
  {
    id: '14', name: 'Combo Doble', slug: 'combo-doble', description: 'Vladi Doble + Aros de Cebolla + Cerveza.',
    price: 9800, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800', categoryId: '4', category: mockCategories[3],
    stock: -1, isActive: true, isCombo: true, extras: [],
    comboItems: [{ id: 'c4', name: 'Vladi Doble', quantity: 1 }, { id: 'c5', name: 'Aros de Cebolla', quantity: 1 }, { id: 'c6', name: 'Cerveza Artesanal', quantity: 1 }],
  },
];

export const mockIngredients: Ingredient[] = [
  { id: 'i1', name: 'Pan Brioche', price: 0, type: 'BUN' as IngredientType, imageUrl: '🍞', isActive: true },
  { id: 'i2', name: 'Pan Integral', price: 200, type: 'BUN' as IngredientType, imageUrl: '🌾', isActive: true },
  { id: 'i3', name: 'Pan de Papa', price: 300, type: 'BUN' as IngredientType, imageUrl: '🥔', isActive: true },
  { id: 'i4', name: 'Carne Vacuna 150g', price: 1500, type: 'MEAT' as IngredientType, imageUrl: '🥩', isActive: true },
  { id: 'i5', name: 'Carne Vacuna 200g', price: 2000, type: 'MEAT' as IngredientType, imageUrl: '🥩', isActive: true },
  { id: 'i6', name: 'Pollo Grillado', price: 1200, type: 'MEAT' as IngredientType, imageUrl: '🍗', isActive: true },
  { id: 'i7', name: 'Medallón Veggie', price: 1000, type: 'MEAT' as IngredientType, imageUrl: '🌱', isActive: true },
  { id: 'i8', name: 'Cheddar', price: 400, type: 'CHEESE' as IngredientType, imageUrl: '🧀', isActive: true },
  { id: 'i9', name: 'Provolone', price: 500, type: 'CHEESE' as IngredientType, imageUrl: '🧀', isActive: true },
  { id: 'i10', name: 'Queso Azul', price: 600, type: 'CHEESE' as IngredientType, imageUrl: '🧀', isActive: true },
  { id: 'i11', name: 'Lechuga', price: 0, type: 'VEGETABLE' as IngredientType, imageUrl: '🥬', isActive: true },
  { id: 'i12', name: 'Tomate', price: 0, type: 'VEGETABLE' as IngredientType, imageUrl: '🍅', isActive: true },
  { id: 'i13', name: 'Cebolla', price: 0, type: 'VEGETABLE' as IngredientType, imageUrl: '🧅', isActive: true },
  { id: 'i14', name: 'Palta', price: 500, type: 'VEGETABLE' as IngredientType, imageUrl: '🥑', isActive: true },
  { id: 'i15', name: 'Jalapeños', price: 300, type: 'VEGETABLE' as IngredientType, imageUrl: '🌶️', isActive: true },
  { id: 'i16', name: 'Ketchup', price: 0, type: 'SAUCE' as IngredientType, imageUrl: '🟥', isActive: true },
  { id: 'i17', name: 'Mostaza', price: 0, type: 'SAUCE' as IngredientType, imageUrl: '🟨', isActive: true },
  { id: 'i18', name: 'Mayonesa', price: 0, type: 'SAUCE' as IngredientType, imageUrl: '⬜', isActive: true },
  { id: 'i19', name: 'Salsa BBQ', price: 200, type: 'SAUCE' as IngredientType, imageUrl: '🟫', isActive: true },
  { id: 'i20', name: 'Salsa Vladi', price: 300, type: 'SAUCE' as IngredientType, imageUrl: '🔥', isActive: true },
  { id: 'i21', name: 'Bacon', price: 800, type: 'TOPPING' as IngredientType, imageUrl: '🥓', isActive: true },
  { id: 'i22', name: 'Huevo Frito', price: 500, type: 'TOPPING' as IngredientType, imageUrl: '🍳', isActive: true },
  { id: 'i23', name: 'Cebolla Crispy', price: 400, type: 'TOPPING' as IngredientType, imageUrl: '🧅', isActive: true },
  { id: 'i24', name: 'Champiñones', price: 400, type: 'TOPPING' as IngredientType, imageUrl: '🍄', isActive: true },
];

export const mockCreations: BurgerCreation[] = [
  { id: 'cr1', name: 'La Monstruosa', description: 'Doble carne, triple queso, todos los toppings', userId: 'u1', user: { name: 'Marcos G.' }, ingredients: [], totalPrice: 7500, voteCount: 42, hasVoted: false, isPublic: true, createdAt: '2026-03-01T10:00:00Z' },
  { id: 'cr2', name: 'Veggie Deluxe', description: 'La mejor veggie que vas a probar', userId: 'u2', user: { name: 'Lucía R.' }, ingredients: [], totalPrice: 4200, voteCount: 38, hasVoted: true, isPublic: true, createdAt: '2026-03-02T14:00:00Z' },
  { id: 'cr3', name: 'BBQ Extreme', description: 'Bacon, BBQ, cebolla crispy y cheddar', userId: 'u3', user: { name: 'Diego F.' }, ingredients: [], totalPrice: 6100, voteCount: 35, hasVoted: false, isPublic: true, createdAt: '2026-03-05T09:00:00Z' },
];

export const mockBlogPosts: BlogPost[] = [
  { id: 'b1', title: 'La historia detrás de Vladi.burger', slug: 'historia-vladi-burger', content: 'Todo empezó con una pasión por las hamburguesas artesanales...', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', isPublished: true, createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-02-15T10:00:00Z' },
  { id: 'b2', title: 'Nuevos sabores de temporada', slug: 'sabores-temporada', content: 'Este mes incorporamos ingredientes de estación...', imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800', isPublished: true, createdAt: '2026-03-01T12:00:00Z', updatedAt: '2026-03-01T12:00:00Z' },
  { id: 'b3', title: 'Tips para la hamburguesa perfecta', slug: 'tips-hamburguesa-perfecta', content: 'Secretos de nuestro chef para hacer la mejor hamburguesa en casa...', imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800', isPublished: true, createdAt: '2026-03-10T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z' },
];

export const mockPhotos: CustomerPhoto[] = [
  { id: 'p1', userId: 'u1', user: { name: 'Marcos' }, imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800', caption: 'La mejor burger!', isApproved: true, likes: 15, hasLiked: false, createdAt: '2026-03-08T18:00:00Z' },
  { id: 'p2', userId: 'u2', user: { name: 'Lucía' }, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', caption: 'Vladi BBQ 🔥', isApproved: true, likes: 23, hasLiked: true, createdAt: '2026-03-09T20:00:00Z' },
  { id: 'p3', userId: 'u4', user: { name: 'Ana' }, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800', caption: 'Combo perfecto', isApproved: true, likes: 8, hasLiked: false, createdAt: '2026-03-10T19:00:00Z' },
];

export const mockOrders: Order[] = [
  {
    id: 'o1', orderNumber: 1001, userId: 'u1', status: 'DELIVERED' as OrderStatus,
    items: [
      { id: 'oi1', productId: '1', name: 'Vladi Clásica', price: 4500, quantity: 2, extras: [{ id: 'e1', name: 'Bacon', price: 800 }], isCustom: false },
      { id: 'oi2', productId: '7', name: 'Papas Fritas', price: 1800, quantity: 1, extras: [], isCustom: false },
    ],
    subtotal: 11600, discount: 0, total: 11600, deliveryType: 'DELIVERY' as DeliveryType,
    scheduledAt: '2026-03-10T20:00:00Z', notes: 'Sin cebolla en la clásica', pointsEarned: 116, pointsRedeemed: 0,
    source: 'WEB' as OrderSource, createdAt: '2026-03-10T19:30:00Z', updatedAt: '2026-03-10T20:15:00Z',
  },
  {
    id: 'o2', orderNumber: 1002, userId: 'u1', status: 'PREPARING' as OrderStatus,
    items: [
      { id: 'oi3', productId: '13', name: 'Combo Vladi', price: 6500, quantity: 1, extras: [], isCustom: false },
    ],
    subtotal: 6500, discount: 650, total: 5850, couponCode: 'VLADI10', deliveryType: 'PICKUP' as DeliveryType,
    scheduledAt: '2026-03-12T21:00:00Z', pointsEarned: 58, pointsRedeemed: 0,
    source: 'WEB' as OrderSource, createdAt: '2026-03-12T20:30:00Z', updatedAt: '2026-03-12T20:35:00Z',
  },
];

export const mockRewards: LoyaltyReward[] = [
  { id: 'r1', name: 'Papas Gratis', description: 'Una porción de papas fritas gratis en tu próximo pedido', pointsCost: 200, type: 'freeProduct', value: { productId: '7' }, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', isActive: true },
  { id: 'r2', name: '10% de Descuento', description: '10% de descuento en tu próximo pedido', pointsCost: 500, type: 'discount', value: { discountPercent: 10 }, imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', isActive: true },
  { id: 'r3', name: 'Upgrade a Doble', description: 'Pasá cualquier hamburguesa a doble carne gratis', pointsCost: 350, type: 'upgrade', value: { upgradeType: 'doubleMeat' }, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', isActive: true },
];

export const mockSchedules: DeliverySchedule[] = [
  { id: 's1', dayOfWeek: 1, startTime: '11:00', endTime: '23:00', slotMinutes: 30, maxOrders: 10, isActive: true },
  { id: 's2', dayOfWeek: 2, startTime: '11:00', endTime: '23:00', slotMinutes: 30, maxOrders: 10, isActive: true },
  { id: 's3', dayOfWeek: 3, startTime: '11:00', endTime: '23:00', slotMinutes: 30, maxOrders: 10, isActive: true },
  { id: 's4', dayOfWeek: 4, startTime: '11:00', endTime: '23:00', slotMinutes: 30, maxOrders: 12, isActive: true },
  { id: 's5', dayOfWeek: 5, startTime: '11:00', endTime: '00:00', slotMinutes: 30, maxOrders: 15, isActive: true },
  { id: 's6', dayOfWeek: 6, startTime: '11:00', endTime: '00:00', slotMinutes: 30, maxOrders: 15, isActive: true },
  { id: 's0', dayOfWeek: 0, startTime: '12:00', endTime: '22:00', slotMinutes: 30, maxOrders: 8, isActive: true },
];

export const mockTimeSlots: TimeSlot[] = [
  { time: '19:00', available: true, remainingSlots: 5 },
  { time: '19:30', available: true, remainingSlots: 3 },
  { time: '20:00', available: true, remainingSlots: 8 },
  { time: '20:30', available: true, remainingSlots: 2 },
  { time: '21:00', available: false, remainingSlots: 0 },
  { time: '21:30', available: true, remainingSlots: 10 },
  { time: '22:00', available: true, remainingSlots: 7 },
  { time: '22:30', available: true, remainingSlots: 9 },
];

export const mockDashboardStats: DashboardStats = {
  ordersToday: 47,
  revenueToday: 285000,
  revenueWeek: 1850000,
  revenueMonth: 7200000,
  avgRating: 4.6,
  activeCustomers: 234,
  popularProducts: [
    { name: 'Vladi Clásica', count: 156 },
    { name: 'Combo Vladi', count: 98 },
    { name: 'Vladi BBQ', count: 87 },
    { name: 'Papas Fritas', count: 203 },
    { name: 'Vladi Doble', count: 72 },
  ],
};

export const mockUser: User = {
  id: 'u1',
  email: 'marcos@ejemplo.com',
  name: 'Marcos García',
  phone: '+54 11 2345-6789',
  role: 'CUSTOMER' as Role,
  loyaltyPoints: 780,
  vipLevel: 'SILVER' as VipLevel,
  createdAt: '2025-06-15T10:00:00Z',
};

export const mockAddresses: Address[] = [
  { id: 'a1', userId: 'u1', label: 'Casa', street: 'Av. Corrientes', number: '1234', floor: '5', apartment: 'A', city: 'CABA', zipCode: '1043', lat: -34.6037, lng: -58.3816 },
  { id: 'a2', userId: 'u1', label: 'Trabajo', street: 'Av. Santa Fe', number: '5678', city: 'CABA', zipCode: '1425', lat: -34.5875, lng: -58.4066 },
];

export const mockKitchenOrders: Order[] = [
  {
    id: 'ko1', orderNumber: 1045, userId: 'u5', status: 'PREPARING' as OrderStatus,
    items: [
      { id: 'ki1', name: 'Vladi Clásica', price: 4500, quantity: 2, extras: [{ id: 'e1', name: 'Bacon', price: 800 }], isCustom: false },
      { id: 'ki2', name: 'Papas Fritas', price: 1800, quantity: 2, extras: [], isCustom: false },
      { id: 'ki3', name: 'Coca-Cola', price: 1200, quantity: 2, extras: [], isCustom: false },
    ],
    subtotal: 14800, discount: 0, total: 14800, deliveryType: 'DELIVERY' as DeliveryType,
    scheduledAt: '2026-03-12T20:30:00Z', notes: 'Sin cebolla, extra salsa', pointsEarned: 148, pointsRedeemed: 0,
    source: 'WEB' as OrderSource, createdAt: '2026-03-12T20:00:00Z', updatedAt: '2026-03-12T20:05:00Z',
  },
  {
    id: 'ko2', orderNumber: 1046, userId: 'u6', status: 'PENDING' as OrderStatus,
    items: [
      { id: 'ki4', name: 'Combo Doble', price: 9800, quantity: 1, extras: [], isCustom: false },
      { id: 'ki5', name: 'Nuggets x6', price: 2500, quantity: 1, extras: [{ id: 'e8', name: 'Salsa BBQ', price: 200 }], isCustom: false },
    ],
    subtotal: 12500, discount: 0, total: 12500, deliveryType: 'PICKUP' as DeliveryType,
    scheduledAt: '2026-03-12T21:00:00Z', pointsEarned: 125, pointsRedeemed: 0,
    source: 'RAPPI' as OrderSource, createdAt: '2026-03-12T20:10:00Z', updatedAt: '2026-03-12T20:10:00Z',
  },
  {
    id: 'ko3', orderNumber: 1047, userId: 'u7', status: 'PENDING' as OrderStatus,
    items: [
      { id: 'ki6', name: 'Vladi Picante', price: 5500, quantity: 1, extras: [{ id: 'e6', name: 'Extra jalapeños', price: 400 }], isCustom: false },
      { id: 'ki7', name: 'Cerveza Artesanal', price: 2800, quantity: 2, extras: [], isCustom: false },
    ],
    subtotal: 11500, discount: 0, total: 11500, deliveryType: 'DELIVERY' as DeliveryType,
    scheduledAt: '2026-03-12T20:45:00Z', notes: 'Depto 3B, tocar timbre', pointsEarned: 115, pointsRedeemed: 0,
    source: 'PEDIDOSYA' as OrderSource, createdAt: '2026-03-12T20:15:00Z', updatedAt: '2026-03-12T20:15:00Z',
  },
];
