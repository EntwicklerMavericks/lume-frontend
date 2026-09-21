import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { StoreService } from '../../../../core/services/store.service';
import { CartService } from '../../../../core/services/cart.service';
import { WhatsappService } from '../../../../core/services/whatsapp.service';
import { SeoService } from '../../../../core/services/seo.service';
import { Product, ProductColor } from '../../../../core/models/store.models';
import { STORE_CONFIG } from '../../../../core/config/store.config';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss']
})
export class ProductPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storeService = inject(StoreService);
  private cartService = inject(CartService);
  private whatsappService = inject(WhatsappService);
  private seoService = inject(SeoService);

  storeConfig = STORE_CONFIG;

  product = signal<Product | undefined>(undefined);
  selectedImage = signal(0);
  selectedSize = signal<string | null>(null);
  selectedColor = signal<string | null>(null);
  quantity = signal(1);

  // Estados de UX e Feedback
  attemptedSubmit = signal(false);
  showAddedToast = signal(false);
  activeAccordion = signal<'details' | 'care' | 'shipping' | null>('details');

  currentPrice = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return p.promotionalPrice || p.price;
  });

  hasVariations = computed(() => {
    const p = this.product();
    if (!p) return false;
    return (!!p.sizes && p.sizes.length > 0) || (!!p.colors && p.colors.length > 0);
  });

  sizeRequiredMissing = computed(() => {
    const p = this.product();
    return !!(p?.sizes && p.sizes.length > 0 && !this.selectedSize());
  });

  colorRequiredMissing = computed(() => {
    const p = this.product();
    return !!(p?.colors && p.colors.length > 0 && !this.selectedColor());
  });

  canAddToCart = computed(() => {
    return !this.sizeRequiredMissing() && !this.colorRequiredMissing();
  });

  categoryName = computed(() => {
    const p = this.product();
    if (!p) return '';
    const category = this.storeService.getCategoryById(p.categoryId);
    return category ? category.name : p.categoryId;
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const idOrSlug = params['id'];
      this.storeService.getProduct(idOrSlug).subscribe(product => {
        if (product) {
          this.product.set(product);
          this.selectedImage.set(0);
          this.selectedSize.set(null);
          this.selectedColor.set(null);
          this.quantity.set(1);
          this.attemptedSubmit.set(false);
          this.showAddedToast.set(false);

          // SEO dinâmico com dados reais
          this.seoService.setPageMeta(
            product.name,
            `${product.description ? product.description.slice(0, 155) : product.name}... Compre com atendimento exclusivo ${STORE_CONFIG.name}.`,
            product.images && product.images.length > 0 ? product.images[0] : undefined
          );
        }
      });
    });
  }

  selectImage(index: number) {
    this.selectedImage.set(index);
  }

  selectSize(size: string) {
    this.selectedSize.set(size);
    if (this.canAddToCart()) {
      this.attemptedSubmit.set(false);
    }
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
    if (this.canAddToCart()) {
      this.attemptedSubmit.set(false);
    }
  }

  incrementQuantity() {
    this.quantity.update(q => q + 1);
  }

  decrementQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  toggleAccordion(section: 'details' | 'care' | 'shipping') {
    this.activeAccordion.update(curr => curr === section ? null : section);
  }

  addToCart() {
    if (!this.canAddToCart()) {
      this.attemptedSubmit.set(true);
      return;
    }

    const p = this.product();
    if (!p) return;

    this.cartService.addItem(
      p,
      this.quantity(),
      this.selectedSize() || undefined,
      this.selectedColor() || undefined
    );

    this.showAddedToast.set(true);
    setTimeout(() => {
      this.showAddedToast.set(false);
    }, 4500);
  }

  buyNow() {
    if (!this.canAddToCart()) {
      this.attemptedSubmit.set(true);
      return;
    }

    const p = this.product();
    if (!p) return;

    this.whatsappService.sendProductOrder(
      p, 
      this.quantity(), 
      this.selectedSize() || undefined, 
      this.selectedColor() || undefined
    );
  }

  closeToast() {
    this.showAddedToast.set(false);
  }
}
