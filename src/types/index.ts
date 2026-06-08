export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  imageColor: string; // Tailwind gradient or color representation
  productType?: 'medicamento' | 'general';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'Pendiente' | 'En Preparación' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'Tarjeta' | 'Transferencia' | 'Efectivo';
  shippingAddress: string;
  createdAt: string;
  history: OrderStatusHistory[];
}
