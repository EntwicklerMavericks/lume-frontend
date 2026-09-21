import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { WhatsappService } from '../../../../core/services/whatsapp.service';
import { SeoService } from '../../../../core/services/seo.service';
import { CartItem } from '../../../../core/models/store.models';
import { STORE_CONFIG } from '../../../../core/config/store.config';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit {
  private cartService = inject(CartService);
  private whatsappService = inject(WhatsappService);
  private seoService = inject(SeoService);

  storeConfig = STORE_CONFIG;

  cartItems = this.cartService.cartItems;
  subtotal = this.cartService.subtotal;
  totalItems = this.cartService.totalItems;
  isEmpty = this.cartService.isEmpty;

  customerNote = signal('');

  ngOnInit(): void {
    this.seoService.setPageMeta(
      'Sacola de Compras',
      `Confira os itens selecionados na sua sacola de compras da ${STORE_CONFIG.name} e finalize diretamente pelo WhatsApp.`
    );
  }

  updateQuantity(item: CartItem, quantity: number) {
    this.cartService.updateQuantity(item.product.id, quantity, item.size, item.color);
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.product.id, item.size, item.color);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  checkout() {
    if (this.isEmpty()) return;
    this.whatsappService.sendCartOrder(this.cartItems(), this.subtotal(), this.customerNote());
  }

  getItemPrice(item: CartItem): number {
    return item.product.promotionalPrice ?? item.product.price;
  }

  getItemTotal(item: CartItem): number {
    return this.getItemPrice(item) * item.quantity;
  }
}
