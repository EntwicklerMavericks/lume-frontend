import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { STORE_CONFIG } from '../../../../core/config/store.config';

import { StoreService } from '../../../../core/services/store.service';

@Component({
  selector: 'app-store-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './store-header.component.html',
  styleUrls: ['./store-header.component.scss']
})
export class StoreHeaderComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private storeService = inject(StoreService);

  categories = this.storeService.categories;
  isMobileMenuOpen = signal(false);

  storeConfig = STORE_CONFIG;
  whatsappLink = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Olá! Vim pelo site da ${STORE_CONFIG.name} e gostaria de falar com um consultor.`)}`;

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
