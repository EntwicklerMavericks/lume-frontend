import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { WhatsappService } from '../../../../core/services/whatsapp.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ShippingOption, ShippingService } from '../../../../core/services/shipping.service';
import { CartItem } from '../../../../core/models/store.models';
import { STORE_CONFIG } from '../../../../core/config/store.config';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit {
  private cartService = inject(CartService);
  private whatsappService = inject(WhatsappService);
  private seoService = inject(SeoService);
  shippingService = inject(ShippingService);

  storeConfig = STORE_CONFIG;

  cartItems = this.cartService.cartItems;
  subtotal = this.cartService.subtotal;
  totalItems = this.cartService.totalItems;
  isEmpty = this.cartService.isEmpty;

  customerNote = signal('');

  // Frete
  shippingCep = signal<string>('');
  shippingError = signal<string | null>(null);

  selectedShipping = this.shippingService.selectedOption;
  shippingCost = this.shippingService.shippingCost;
  shippingResult = this.shippingService.lastResult;
  isCalculatingShipping = this.shippingService.isCalculating;

  totalWithShipping = computed(() => this.subtotal() + this.shippingCost());

  ngOnInit(): void {
    this.seoService.setPageMeta(
      'Sacola de Compras',
      `Confira os itens selecionados na sua sacola de compras da ${STORE_CONFIG.name} com cálculo de frete e envio rápido.`
    );

    const savedCep = this.shippingService.currentCep();
    if (savedCep) {
      const formatted = savedCep.length === 8 ? `${savedCep.slice(0, 5)}-${savedCep.slice(5)}` : savedCep;
      this.shippingCep.set(formatted);
    }
  }

  onCepInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    this.shippingCep.set(v);
    this.shippingError.set(null);
  }

  calculateShipping(): void {
    const cleanCep = this.shippingCep().replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      this.shippingError.set('Por favor, informe um CEP válido com 8 dígitos.');
      return;
    }

    this.shippingError.set(null);
    this.shippingService.calculate(cleanCep, this.subtotal()).subscribe({
      error: (err) => {
        this.shippingError.set(err?.error?.message || 'Não foi possível cotar o frete para este CEP.');
      }
    });
  }

  selectShipping(option: ShippingOption): void {
    this.shippingService.selectOption(option);
  }

  updateQuantity(item: CartItem, quantity: number) {
    this.cartService.updateQuantity(item.product.id, quantity, item.size, item.color);
    if (this.shippingService.currentCep()) {
      this.shippingService.calculate(this.shippingService.currentCep(), this.subtotal()).subscribe({ error: () => {} });
    }
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.product.id, item.size, item.color);
    if (this.shippingService.currentCep() && !this.isEmpty()) {
      this.shippingService.calculate(this.shippingService.currentCep(), this.subtotal()).subscribe({ error: () => {} });
    }
  }

  clearCart() {
    this.cartService.clearCart();
    this.shippingService.clearShipping();
  }

  checkoutWhatsApp() {
    if (this.isEmpty()) return;
    this.whatsappService.sendCartOrder(this.cartItems(), this.totalWithShipping(), this.customerNote());
  }

  getItemPrice(item: CartItem): number {
    return item.product.promotionalPrice ?? item.product.price;
  }

  getItemTotal(item: CartItem): number {
    return this.getItemPrice(item) * item.quantity;
  }
}
