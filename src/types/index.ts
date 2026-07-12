// Types centraux — réutilisables pour le SaaS multi-vendeurs

export type ProductCategory =
  | 'sonorisation'
  | 'mixeurs'
  | 'amplificateurs'
  | 'claviers'
  | 'guitares'
  | 'batteries'
  | 'instruments'
  | 'accessoires';

export type ProductBadge = 'new' | 'hot' | 'sale' | null;

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  short_description: string;
  description: string;
  specs: ProductSpec[];
  price: number;
  rental_price_day?: number | null;
  images: string[];
  badge: ProductBadge;
  stock: number;
  stock_alert: number;
  is_active: boolean;
  is_rentable: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'cash'
  | 'moov_money'
  | 't_money'
  | 'flooz'
  | 'virement';

// Statut de verification du paiement (distinct du statut de traitement de
// la commande ci-dessous) : 'cash' reste unpaid jusqu'a la livraison, les
// autres moyens passent en pending_verification des qu'une reference est
// fournie, puis l'admin les marque paid une fois le virement/transfert confirme.
export type PaymentStatus = 'unpaid' | 'pending_verification' | 'paid';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  client_address?: string;
  client_neighborhood?: string;
  delivery_instructions?: string;
  payment_method: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_reference?: string | null;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type DevisStatus = 'new' | 'processing' | 'sent' | 'accepted' | 'refused';

export interface Devis {
  id: string;
  devis_number: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  product_id?: string;
  product_name?: string;
  quantity: number;
  usage_type?: string;
  desired_date?: string;
  message?: string;
  status: DevisStatus;
  created_at: string;
}

export type StockMovementType = 'in' | 'out' | 'adjustment';

export interface StockMovement {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutData {
  // Étape 1 — infos client
  client_name: string;
  client_phone: string;
  client_email: string;
  // Étape 2 — livraison
  client_address: string;
  client_neighborhood: string;
  delivery_instructions: string;
  // Étape 3 — paiement
  payment_method: PaymentMethod;
}

export interface AppSettings {
  shop_name: string;
  shop_address: string;
  shop_phone: string;
  shop_whatsapp: string;
  shop_email: string;
  delivery_fee_default: number;
  delivery_zones: DeliveryZone[];
  payment_methods: PaymentMethod[];
}

export interface DeliveryZone {
  name: string;
  fee: number;
}

// Stats pour le dashboard admin
export interface DashboardStats {
  revenue_today: number;
  revenue_month: number;
  revenue_total: number;
  orders_total: number;
  orders_pending: number;
  orders_delivered: number;
  devis_pending: number;
  products_total: number;
  products_out_of_stock: number;
}

// Graphiques
export interface RevenueChartData {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryChartData {
  category: string;
  count: number;
  revenue: number;
}
