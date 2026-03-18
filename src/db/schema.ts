import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ============================================================
// UTILISATEURS
// ============================================================
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["customer", "admin", "delivery"] }).notNull().default("customer"),
  address: text("address"),
  quarter: text("quarter"), // Quartier à Maroua
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================
// CATÉGORIES DE PRODUITS
// ============================================================
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"), // Nom de l'icône lucide-react
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

// ============================================================
// PRODUITS
// ============================================================
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(), // En FCFA
  stock: integer("stock").notNull().default(0),
  unit: text("unit").notNull().default("unité"), // "bouteille", "kg", "unité"
  weight: real("weight"), // Poids en kg (ex: 6, 12, 38)
  imageUrl: text("image_url"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================
// COMMANDES
// ============================================================
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(), // Ex: GC-2024-0001
  userId: integer("user_id").notNull().references(() => users.id),
  deliveryType: text("delivery_type", { enum: ["home", "pickup"] }).notNull(),
  pickupPointId: text("pickup_point_id"), // ID du point de retrait si pickup
  deliveryAddress: text("delivery_address"), // Adresse si livraison domicile
  deliveryQuarter: text("delivery_quarter"), // Quartier
  subtotal: integer("subtotal").notNull(), // Sous-total avant frais
  deliveryFee: integer("delivery_fee").notNull().default(0),
  discountAmount: integer("discount_amount").notNull().default(0), // Réduction fidélité
  total: integer("total").notNull(),
  paymentMethod: text("payment_method", { enum: ["cash", "mtn", "orange"] }).notNull(),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "failed"] }).notNull().default("pending"),
  status: text("status", {
    enum: ["pending", "confirmed", "preparing", "out_for_delivery", "ready_for_pickup", "delivered", "cancelled"],
  }).notNull().default("pending"),
  loyaltyPointsEarned: integer("loyalty_points_earned").notNull().default(0),
  loyaltyPointsUsed: integer("loyalty_points_used").notNull().default(0),
  notes: text("notes"), // Notes du client
  deliveryPersonId: integer("delivery_person_id").references(() => users.id),
  estimatedDelivery: text("estimated_delivery"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================
// LIGNES DE COMMANDE
// ============================================================
export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(), // Snapshot du nom
  productPrice: integer("product_price").notNull(), // Snapshot du prix
  quantity: integer("quantity").notNull(),
  subtotal: integer("subtotal").notNull(),
});

// ============================================================
// HISTORIQUE DES STATUTS DE COMMANDE
// ============================================================
export const orderStatusHistory = sqliteTable("order_status_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id),
  status: text("status").notNull(),
  note: text("note"),
  changedBy: integer("changed_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================
// NOTIFICATIONS
// ============================================================
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", { enum: ["order", "promo", "system", "loyalty"] }).notNull().default("system"),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  relatedOrderId: integer("related_order_id").references(() => orders.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================
// TRANSACTIONS FIDÉLITÉ
// ============================================================
export const loyaltyTransactions = sqliteTable("loyalty_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  type: text("type", { enum: ["earn", "redeem"] }).notNull(),
  points: integer("points").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================
// PROMOTIONS
// ============================================================
export const promotions = sqliteTable("promotions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  discountType: text("discount_type", { enum: ["percentage", "fixed"] }).notNull(),
  discountValue: integer("discount_value").notNull(),
  minOrderAmount: integer("min_order_amount").default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
