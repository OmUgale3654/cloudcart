export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED';

export interface OrderItem {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userEmail?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  shippingAddress: string;
  paymentTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCreateRequest {
  shippingAddress: string;
  paymentMethod: string;
  paymentToken: string;
}
