import { inject, Injectable, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem, Product } from '../models/store.models';

const CART_STORAGE_KEY = 'lume_cart';

/**
 * Serviço do carrinho — gerencia itens, quantidades, persistência via localStorage.
 * SSR-safe: não acessa localStorage durante server-side rendering.
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly items = signal<CartItem[]>([]);

  /** Itens do carrinho (readonly) */
  readonly cartItems = this.items.asReadonly();

  /** Quantidade total de itens no carrinho */
  readonly totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  /** Subtotal do carrinho */
  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => {
      const price = item.product.promotionalPrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0)
  );

  /** Carrinho está vazio */
  readonly isEmpty = computed(() => this.items().length === 0);

  constructor() {
    this.loadFromStorage();
  }

  /** Adicionar item ao carrinho */
  addItem(product: Product, quantity: number = 1, size?: string, color?: string): void {
    const current = this.items();
    const existingIndex = current.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.size === size &&
        item.color === color
    );

    if (existingIndex >= 0) {
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
      };
      this.items.set(updated);
    } else {
      this.items.set([...current, { product, quantity, size, color }]);
    }

    this.saveToStorage();
  }

  /** Remover item do carrinho */
  removeItem(productId: string, size?: string, color?: string): void {
    this.items.set(
      this.items().filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.size === size &&
            item.color === color
          )
      )
    );
    this.saveToStorage();
  }

  /** Atualizar quantidade de um item */
  updateQuantity(productId: string, quantity: number, size?: string, color?: string): void {
    if (quantity <= 0) {
      this.removeItem(productId, size, color);
      return;
    }

    const current = this.items();
    const updated = current.map((item) => {
      if (
        item.product.id === productId &&
        item.size === size &&
        item.color === color
      ) {
        return { ...item, quantity };
      }
      return item;
    });

    this.items.set(updated);
    this.saveToStorage();
  }

  /** Limpar carrinho */
  clearCart(): void {
    this.items.set([]);
    this.saveToStorage();
  }

  /** Carregar do localStorage (SSR-safe) */
  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        this.items.set(parsed);
      }
    } catch {
      this.items.set([]);
    }
  }

  /** Persistir no localStorage (SSR-safe) */
  private saveToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items()));
    } catch {
      // Silently fail if localStorage is full or unavailable
    }
  }
}
