/**
 * Lume — Modelos da loja de moda premium.
 * Preparados para desacoplamento e integração transparente com API NestJS.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  available: boolean;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  images: string[];
  categoryId: string;
  category?: Category;
  sizes?: string[];
  colors?: ProductColor[];
  composition?: string;
  fit?: string; // Ex: 'Slim Fit', 'Oversized', 'Regular'
  washCare?: string;
  available: boolean;
  featured?: boolean;
  isNew?: boolean;
  variants?: ProductVariant[];
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface StoreConfig {
  name: string;
  whatsappNumber: string;
  currency: string;
  locale: string;
  whatsappGreeting: string;
  whatsappClosing: string;
}

