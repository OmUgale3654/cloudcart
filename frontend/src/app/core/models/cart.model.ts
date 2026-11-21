export interface CartItem {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}
