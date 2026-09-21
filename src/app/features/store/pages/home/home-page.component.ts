import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../../../core/services/store.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { STORE_CONFIG } from '../../../../core/config/store.config';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  private storeService = inject(StoreService);
  private seoService = inject(SeoService);

  featuredProducts = this.storeService.featuredProducts;
  categories = this.storeService.categories;
  newProducts = this.storeService.newProducts;

  storeConfig = STORE_CONFIG;
  storeName = STORE_CONFIG.name;
  whatsappLink = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Olá! Vim pelo site da ${STORE_CONFIG.name} e gostaria de conhecer os lançamentos.`)}`;
  whatsappSizingLink = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Olá! Vim pelo site da ${STORE_CONFIG.name} e gostaria de tirar dúvidas sobre o tamanho e caimento das peças.`)}`;

  ngOnInit(): void {
    this.seoService.setPageMeta(
      'Streetwear Masculino & Drops Exclusivos',
      `${STORE_CONFIG.name} — ${STORE_CONFIG.description}`
    );
  }
}
