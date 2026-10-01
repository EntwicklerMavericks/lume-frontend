import { inject, Injectable, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CartItem, Product } from '../models/store.models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

const CART_STORAGE_KEY = 'lume_cart';

/**
 * Serviço do carrinho — gerencia itens, quantidades e persistência híbrida:
 * 1. Offline/Guest: localStorage seguro e reativo via Signals.
 * 2. Autenticado: sincronização automática com backend /cart na conta do cliente.
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

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
    if (this.authService.isAuthenticated()) {
      this.syncWithServer();
    }
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

    // Sincroniza com a nuvem se logado
    if (this.authService.isAuthenticated()) {
      this.http.post(`${this.apiUrl}/cart/item`, {
        productId: product.id,
        quantity,
        size,
        color,
      }).subscribe({
        error: (err) => console.warn('[CartService] Falha ao sincronizar item na nuvem:', err),
      });
    }
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

    // Sincroniza remoção com a nuvem se logado
    if (this.authService.isAuthenticated()) {
      const params: any = { productId };
      if (size) params.size = size;
      if (color) params.color = color;

      this.http.delete(`${this.apiUrl}/cart/item`, { params }).subscribe({
        error: (err) => console.warn('[CartService] Falha ao remover item da nuvem:', err),
      });
    }
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

    // Sincroniza atualização com a nuvem se logado
    if (this.authService.isAuthenticated()) {
      this.http.put(`${this.apiUrl}/cart/item`, {
        productId,
        quantity,
        size,
        color,
      }).subscribe({
        error: (err) => console.warn('[CartService] Falha ao atualizar quantidade na nuvem:', err),
      });
    }
  }

  /** Limpar carrinho */
  clearCart(): void {
    this.items.set([]);
    this.saveToStorage();

    if (this.authService.isAuthenticated()) {
      this.http.delete(`${this.apiUrl}/cart`).subscribe({
        error: (err) => console.warn('[CartService] Falha ao limpar carrinho na nuvem:', err),
      });
    }
  }

  /**
   * Sincroniza carrinho local com a conta do cliente no servidor
   */
  syncWithServer(): void {
    if (!this.authService.isAuthenticated()) return;

    const payload = {
      items: this.items().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
    };

    this.http.post<any>(`${this.apiUrl}/cart/sync`, payload).subscribe({
      next: (cloudCart) => {
        if (cloudCart && cloudCart.items && Array.isArray(cloudCart.items)) {
          const mapped: CartItem[] = cloudCart.items.map((ci: any) => ({
            product: {
              id: ci.product.id,
              name: ci.product.name,
              slug: ci.product.slug,
              sku: ci.product.sku,
              price: Number(ci.product.price),
              promotionalPrice: ci.product.promotionalPrice ? Number(ci.product.promotionalPrice) : undefined,
              images: ci.product.images?.map((img: any) => img.url) || [],
              category: ci.product.category?.name || 'Geral',
              gender: ci.product.gender || 'Masculino',
              stock: ci.product.stock || 0,
              highlight: ci.product.highlight || false,
            },
            quantity: ci.quantity,
            size: ci.size,
            color: ci.color,
          }));

          this.items.set(mapped);
          this.saveToStorage();
        }
      },
      error: (err) => {
        console.warn('[CartService] Não foi possível sincronizar com o carrinho na nuvem:', err);
      },
    });
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
