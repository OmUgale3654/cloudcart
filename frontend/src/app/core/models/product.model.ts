export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  categoryId?: number;
  categoryName?: string;
  imageUrl?: string;
  active: boolean;
  stockQuantity?: number;
  createdAt: string;
  updatedAt: string;
}
