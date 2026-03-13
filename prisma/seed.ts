import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean all tables (truncate cascade handles FK ordering)
  const tableNames = [
    'StampCard', 'StampConfig', 'PhotoLike', 'CustomerPhoto', 'BurgerCreation',
    'OrderReview', 'OrderItem', 'Order', 'Address', 'ComboItem', 'ProductExtra',
    'Product', 'Category', 'Ingredient', 'Coupon', 'LoyaltyReward',
    'DeliverySchedule', 'BlogPost', 'User',
  ]
  for (const table of tableNames) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`)
  }

  // ─── Users ───
  const passwordHash = await bcrypt.hash('123456', 12)

  const admin = await prisma.user.create({
    data: {
      id: 'admin1',
      email: 'admin@vladiburger.com',
      name: 'Vladi Admin',
      phone: '+54 11 9999-0000',
      passwordHash,
      role: 'ADMIN',
      loyaltyPoints: 0,
      vipLevel: 'PLATINUM',
    },
  })

  const marcos = await prisma.user.create({
    data: {
      id: 'u1',
      email: 'marcos@ejemplo.com',
      name: 'Marcos García',
      phone: '+54 11 2345-6789',
      passwordHash,
      role: 'CUSTOMER',
      loyaltyPoints: 780,
      vipLevel: 'SILVER',
    },
  })

  const lucia = await prisma.user.create({
    data: {
      id: 'u2',
      email: 'lucia@ejemplo.com',
      name: 'Lucía Rodríguez',
      phone: '+54 11 3456-7890',
      passwordHash,
      role: 'CUSTOMER',
      loyaltyPoints: 1200,
      vipLevel: 'GOLD',
    },
  })

  const kitchen = await prisma.user.create({
    data: {
      id: 'kitchen1',
      email: 'cocina@vladiburger.com',
      name: 'Cocina Vladi',
      passwordHash,
      role: 'KITCHEN',
    },
  })

  await prisma.user.create({
    data: {
      id: 'delivery1',
      email: 'delivery@vladiburger.com',
      name: 'Repartidor Vladi',
      phone: '+54 11 5555-0000',
      passwordHash,
      role: 'DELIVERY',
    },
  })

  await prisma.user.createMany({
    data: [
      { id: 'u3', email: 'diego@ejemplo.com', name: 'Diego Fernández', passwordHash, role: 'CUSTOMER', loyaltyPoints: 450, vipLevel: 'BRONZE' },
      { id: 'u4', email: 'ana@ejemplo.com', name: 'Ana López', passwordHash, role: 'CUSTOMER', loyaltyPoints: 320, vipLevel: 'BRONZE' },
      { id: 'u5', email: 'carlos@ejemplo.com', name: 'Carlos Pérez', passwordHash, role: 'CUSTOMER', loyaltyPoints: 150, vipLevel: 'BRONZE' },
      { id: 'u6', email: 'marta@ejemplo.com', name: 'Marta Díaz', passwordHash, role: 'CUSTOMER', loyaltyPoints: 90, vipLevel: 'BRONZE' },
      { id: 'u7', email: 'pablo@ejemplo.com', name: 'Pablo Ruiz', passwordHash, role: 'CUSTOMER', loyaltyPoints: 210, vipLevel: 'BRONZE' },
    ],
  })

  // ─── Categories ───
  const catHamburguesas = await prisma.category.create({ data: { id: '1', name: 'Hamburguesas', slug: 'hamburguesas', description: 'Nuestras hamburguesas artesanales', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', sortOrder: 0 } })
  const catAdicionales = await prisma.category.create({ data: { id: '2', name: 'Adicionales', slug: 'adicionales', description: 'Complementá tu pedido', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800', sortOrder: 1 } })
  const catBebidas = await prisma.category.create({ data: { id: '3', name: 'Bebidas', slug: 'bebidas', description: 'Refrescate', imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=800', sortOrder: 2 } })
  const catCombos = await prisma.category.create({ data: { id: '4', name: 'Combos', slug: 'combos', description: 'Las mejores combinaciones', imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800', sortOrder: 3 } })

  // ─── Products ───
  const products = [
    { id: '1', name: 'Vladi Clásica', slug: 'vladi-clasica', description: 'Nuestra hamburguesa insignia con carne 100% vacuna, queso cheddar, lechuga, tomate y nuestra salsa secreta Vladi.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', categoryId: '1', stock: 50, extras: [{ name: 'Bacon', price: 800 }, { name: 'Huevo frito', price: 600 }, { name: 'Doble carne', price: 1200 }] },
    { id: '2', name: 'Vladi BBQ', slug: 'vladi-bbq', description: 'Hamburguesa con salsa BBQ ahumada, cebolla crispy, bacon y queso provolone.', price: 5200, imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800', categoryId: '1', stock: 3, extras: [{ name: 'Bacon', price: 800 }, { name: 'Aros de cebolla', price: 700 }] },
    { id: '3', name: 'Vladi Doble', slug: 'vladi-doble', description: 'Doble carne, doble queso, doble placer. Para los que quieren más.', price: 6800, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800', categoryId: '1', stock: 25, extras: [{ name: 'Bacon', price: 800 }, { name: 'Huevo frito', price: 600 }] },
    { id: '4', name: 'Vladi Veggie', slug: 'vladi-veggie', description: 'Medallón de lentejas y quinoa, queso vegano, rúcula, tomate y palta.', price: 4800, imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595e6cdc07c?w=800', categoryId: '1', stock: 15, extras: [{ name: 'Extra palta', price: 500 }] },
    { id: '5', name: 'Vladi Picante', slug: 'vladi-picante', description: 'Con jalapeños, salsa sriracha, pepper jack y cebolla morada.', price: 5500, imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800', categoryId: '1', stock: 2, extras: [{ name: 'Extra jalapeños', price: 400 }] },
    { id: '6', name: 'Vladi Blue', slug: 'vladi-blue', description: 'Queso azul, champiñones salteados, rúcula y cebolla caramelizada.', price: 5800, imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800', categoryId: '1', stock: 20, extras: [{ name: 'Extra queso azul', price: 600 }] },
    { id: '15', name: 'Vladi Criolla', slug: 'vladi-criolla', description: 'Chimichurri casero, provoleta derretida, cebolla morada y tomate en rodajas. Sabor bien argento.', price: 5400, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', categoryId: '1', stock: 18, extras: [{ name: 'Extra chimichurri', price: 300 }, { name: 'Provoleta doble', price: 700 }] },
    { id: '7', name: 'Papas Fritas', slug: 'papas-fritas', description: 'Papas fritas crocantes con sal marina.', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800', categoryId: '2', stock: -1, extras: [] },
    { id: '8', name: 'Aros de Cebolla', slug: 'aros-de-cebolla', description: 'Aros de cebolla empanados y dorados.', price: 2200, imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800', categoryId: '2', stock: -1, extras: [] },
    { id: '9', name: 'Nuggets x6', slug: 'nuggets', description: '6 nuggets de pollo con salsa a elección.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800', categoryId: '2', stock: 10, extras: [{ name: 'Salsa BBQ', price: 200 }, { name: 'Salsa Ranch', price: 200 }] },
    { id: '10', name: 'Coca-Cola', slug: 'coca-cola', description: 'Coca-Cola 500ml.', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=800', categoryId: '3', stock: -1, extras: [] },
    { id: '11', name: 'Agua Mineral', slug: 'agua-mineral', description: 'Agua mineral 500ml.', price: 800, imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800', categoryId: '3', stock: -1, extras: [] },
    { id: '12', name: 'Cerveza Artesanal', slug: 'cerveza-artesanal', description: 'Cerveza artesanal IPA 473ml.', price: 2800, imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800', categoryId: '3', stock: 8, extras: [] },
  ]

  for (const p of products) {
    const { extras, ...productData } = p
    await prisma.product.create({
      data: {
        ...productData,
        extras: { create: extras },
      },
    })
  }

  // Combos
  await prisma.product.create({
    data: {
      id: '13', name: 'Combo Vladi', slug: 'combo-vladi', description: 'Vladi Clásica + Papas Fritas + Bebida a elección.',
      price: 6500, imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800', categoryId: '4', stock: -1, isCombo: true,
      comboItems: { create: [{ name: 'Vladi Clásica', quantity: 1 }, { name: 'Papas Fritas', quantity: 1 }, { name: 'Bebida', quantity: 1 }] },
    },
  })
  await prisma.product.create({
    data: {
      id: '14', name: 'Combo Doble', slug: 'combo-doble', description: 'Vladi Doble + Aros de Cebolla + Cerveza.',
      price: 9800, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800', categoryId: '4', stock: -1, isCombo: true,
      comboItems: { create: [{ name: 'Vladi Doble', quantity: 1 }, { name: 'Aros de Cebolla', quantity: 1 }, { name: 'Cerveza Artesanal', quantity: 1 }] },
    },
  })

  // ─── Ingredients ───
  await prisma.ingredient.createMany({
    data: [
      { id: 'i1', name: 'Pan Brioche', price: 0, type: 'BUN', imageUrl: '🍞' },
      { id: 'i2', name: 'Pan Integral', price: 200, type: 'BUN', imageUrl: '🌾' },
      { id: 'i3', name: 'Pan de Papa', price: 300, type: 'BUN', imageUrl: '🥔' },
      { id: 'i4', name: 'Carne Vacuna 150g', price: 1500, type: 'MEAT', imageUrl: '🥩' },
      { id: 'i5', name: 'Carne Vacuna 200g', price: 2000, type: 'MEAT', imageUrl: '🥩' },
      { id: 'i6', name: 'Pollo Grillado', price: 1200, type: 'MEAT', imageUrl: '🍗' },
      { id: 'i7', name: 'Medallón Veggie', price: 1000, type: 'MEAT', imageUrl: '🌱' },
      { id: 'i8', name: 'Cheddar', price: 400, type: 'CHEESE', imageUrl: '🧀' },
      { id: 'i9', name: 'Provolone', price: 500, type: 'CHEESE', imageUrl: '🧀' },
      { id: 'i10', name: 'Queso Azul', price: 600, type: 'CHEESE', imageUrl: '🧀' },
      { id: 'i11', name: 'Lechuga', price: 0, type: 'VEGETABLE', imageUrl: '🥬' },
      { id: 'i12', name: 'Tomate', price: 0, type: 'VEGETABLE', imageUrl: '🍅' },
      { id: 'i13', name: 'Cebolla', price: 0, type: 'VEGETABLE', imageUrl: '🧅' },
      { id: 'i14', name: 'Palta', price: 500, type: 'VEGETABLE', imageUrl: '🥑' },
      { id: 'i15', name: 'Jalapeños', price: 300, type: 'VEGETABLE', imageUrl: '🌶️' },
      { id: 'i16', name: 'Ketchup', price: 0, type: 'SAUCE', imageUrl: '🟥' },
      { id: 'i17', name: 'Mostaza', price: 0, type: 'SAUCE', imageUrl: '🟨' },
      { id: 'i18', name: 'Mayonesa', price: 0, type: 'SAUCE', imageUrl: '⬜' },
      { id: 'i19', name: 'Salsa BBQ', price: 200, type: 'SAUCE', imageUrl: '🟫' },
      { id: 'i20', name: 'Salsa Vladi', price: 300, type: 'SAUCE', imageUrl: '🔥' },
      { id: 'i21', name: 'Bacon', price: 800, type: 'TOPPING', imageUrl: '🥓' },
      { id: 'i22', name: 'Huevo Frito', price: 500, type: 'TOPPING', imageUrl: '🍳' },
      { id: 'i23', name: 'Cebolla Crispy', price: 400, type: 'TOPPING', imageUrl: '🧅' },
      { id: 'i24', name: 'Champiñones', price: 400, type: 'TOPPING', imageUrl: '🍄' },
    ],
  })

  // ─── Addresses ───
  await prisma.address.createMany({
    data: [
      { id: 'a1', userId: 'u1', label: 'Casa', street: 'Av. Corrientes', number: '1234', floor: '5', apartment: 'A', city: 'CABA', zipCode: '1043', lat: -34.6037, lng: -58.3816 },
      { id: 'a2', userId: 'u1', label: 'Trabajo', street: 'Av. Santa Fe', number: '5678', city: 'CABA', zipCode: '1425', lat: -34.5875, lng: -58.4066 },
    ],
  })

  // ─── Coupons ───
  await prisma.coupon.createMany({
    data: [
      { id: 'cup1', code: 'VLADI10', discount: 10, isPercent: true, minOrder: 3000, maxUses: 100, usedCount: 12, isActive: true },
      { id: 'cup2', code: 'BURGER20', discount: 20, isPercent: true, minOrder: 5000, maxUses: 50, usedCount: 5, isActive: true },
      { id: 'cup3', code: 'ENVIOGRATIS', discount: 500, isPercent: false, minOrder: 4000, maxUses: 200, usedCount: 45, isActive: true },
    ],
  })

  // ─── Loyalty Rewards ───
  await prisma.loyaltyReward.createMany({
    data: [
      { id: 'r1', name: 'Papas Gratis', description: 'Una porción de papas fritas gratis en tu próximo pedido', pointsCost: 200, type: 'freeProduct', value: JSON.stringify({ productId: '7' }), imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
      { id: 'r2', name: '10% de Descuento', description: '10% de descuento en tu próximo pedido', pointsCost: 500, type: 'discount', value: JSON.stringify({ discountPercent: 10 }), imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400' },
      { id: 'r3', name: 'Upgrade a Doble', description: 'Pasá cualquier hamburguesa a doble carne gratis', pointsCost: 350, type: 'upgrade', value: JSON.stringify({ upgradeType: 'doubleMeat' }), imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400' },
    ],
  })

  // ─── Delivery Schedules ───
  await prisma.deliverySchedule.createMany({
    data: [
      { dayOfWeek: 0, startTime: '12:00', endTime: '22:00', slotMinutes: 30, maxOrders: 8 },
      { dayOfWeek: 1, startTime: '11:00', endTime: '23:00', slotMinutes: 30, maxOrders: 10 },
      { dayOfWeek: 2, startTime: '11:00', endTime: '23:00', slotMinutes: 30, maxOrders: 10 },
      { dayOfWeek: 3, startTime: '11:00', endTime: '23:00', slotMinutes: 30, maxOrders: 10 },
      { dayOfWeek: 4, startTime: '11:00', endTime: '23:00', slotMinutes: 30, maxOrders: 12 },
      { dayOfWeek: 5, startTime: '11:00', endTime: '00:00', slotMinutes: 30, maxOrders: 15 },
      { dayOfWeek: 6, startTime: '11:00', endTime: '00:00', slotMinutes: 30, maxOrders: 15 },
    ],
  })

  // ─── Blog Posts ───
  await prisma.blogPost.createMany({
    data: [
      { id: 'b1', title: 'La historia detrás de Vladi.burger', slug: 'historia-vladi-burger', content: 'Todo empezó con una pasión por las hamburguesas artesanales...', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', isPublished: true },
      { id: 'b2', title: 'Nuevos sabores de temporada', slug: 'sabores-temporada', content: 'Este mes incorporamos ingredientes de estación...', imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800', isPublished: true },
      { id: 'b3', title: 'Tips para la hamburguesa perfecta', slug: 'tips-hamburguesa-perfecta', content: 'Secretos de nuestro chef para hacer la mejor hamburguesa en casa...', imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800', isPublished: true },
    ],
  })

  // ─── Photos ───
  await prisma.customerPhoto.createMany({
    data: [
      { id: 'p1', userId: 'u1', imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800', caption: 'La mejor burger!', isApproved: true, likes: 15 },
      { id: 'p2', userId: 'u2', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', caption: 'Vladi BBQ 🔥', isApproved: true, likes: 23 },
      { id: 'p3', userId: 'u4', imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800', caption: 'Combo perfecto', isApproved: true, likes: 8 },
    ],
  })

  // ─── Sample Orders ───
  await prisma.order.create({
    data: {
      id: 'o1', orderNumber: 1001, userId: 'u1', status: 'DELIVERED',
      subtotal: 11600, discount: 0, total: 11600, deliveryType: 'DELIVERY',
      addressId: 'a1', notes: 'Sin cebolla en la clásica', pointsEarned: 116,
      source: 'WEB',
      items: {
        create: [
          { name: 'Vladi Clásica', productId: '1', price: 4500, quantity: 2, extras: JSON.stringify([{ id: 'e1', name: 'Bacon', price: 800 }]) },
          { name: 'Papas Fritas', productId: '7', price: 1800, quantity: 1 },
        ],
      },
      review: {
        create: { userId: 'u1', rating: 5, comment: 'Excelente como siempre!' },
      },
    },
  })

  await prisma.order.create({
    data: {
      id: 'o2', orderNumber: 1002, userId: 'u1', status: 'PREPARING',
      subtotal: 6500, discount: 650, total: 5850, couponCode: 'VLADI10', deliveryType: 'PICKUP',
      pointsEarned: 58, source: 'WEB',
      items: {
        create: [
          { name: 'Combo Vladi', productId: '13', price: 6500, quantity: 1 },
        ],
      },
    },
  })

  // Kitchen orders
  await prisma.order.create({
    data: {
      id: 'ko1', orderNumber: 1045, userId: 'u5', status: 'PREPARING',
      subtotal: 14800, total: 14800, deliveryType: 'DELIVERY', addressId: 'a1',
      notes: 'Sin cebolla, extra salsa', pointsEarned: 148, source: 'WEB',
      items: {
        create: [
          { name: 'Vladi Clásica', productId: '1', price: 4500, quantity: 2, extras: JSON.stringify([{ name: 'Bacon', price: 800 }]) },
          { name: 'Papas Fritas', productId: '7', price: 1800, quantity: 2 },
          { name: 'Coca-Cola', productId: '10', price: 1200, quantity: 2 },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      id: 'ko2', orderNumber: 1046, userId: 'u6', status: 'PENDING',
      subtotal: 12500, total: 12500, deliveryType: 'PICKUP',
      pointsEarned: 125, source: 'RAPPI',
      items: {
        create: [
          { name: 'Combo Doble', productId: '14', price: 9800, quantity: 1 },
          { name: 'Nuggets x6', productId: '9', price: 2500, quantity: 1, extras: JSON.stringify([{ name: 'Salsa BBQ', price: 200 }]) },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      id: 'ko3', orderNumber: 1047, userId: 'u7', status: 'PENDING',
      subtotal: 11500, total: 11500, deliveryType: 'DELIVERY',
      notes: 'Depto 3B, tocar timbre', pointsEarned: 115, source: 'PEDIDOSYA',
      items: {
        create: [
          { name: 'Vladi Picante', productId: '5', price: 5500, quantity: 1, extras: JSON.stringify([{ name: 'Extra jalapeños', price: 400 }]) },
          { name: 'Cerveza Artesanal', productId: '12', price: 2800, quantity: 2 },
        ],
      },
    },
  })

  // ─── Stamp Card Config ───
  await prisma.stampConfig.create({
    data: {
      id: 'default',
      stampsRequired: 5,
      prizeName: 'Vladi Burger Gratis',
      prizeDescription: 'Comprá 5 Vladi burgers y la 6ta te la regalamos!',
      prizeDiscount: 100,
      isActive: true,
      categoryId: '1',
    },
  })

  // Give marcos 3 stamps
  await prisma.stampCard.create({
    data: { userId: 'u1', stamps: 3, completed: 0 },
  })

  console.log('Seed complete!')
  console.log(`  Users: ${await prisma.user.count()}`)
  console.log(`  Categories: ${await prisma.category.count()}`)
  console.log(`  Products: ${await prisma.product.count()}`)
  console.log(`  Ingredients: ${await prisma.ingredient.count()}`)
  console.log(`  Orders: ${await prisma.order.count()}`)
  console.log(`  Coupons: ${await prisma.coupon.count()}`)
  console.log(`  Blog posts: ${await prisma.blogPost.count()}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
