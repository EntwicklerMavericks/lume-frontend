import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../../core/services/store.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { STORE_CONFIG } from '../../../../core/config/store.config';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [FormsModule, ProductCardComponent],
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.scss']
})
export class CatalogPageComponent implements OnInit {
  private storeService = inject(StoreService);
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);

  storeConfig = STORE_CONFIG;

  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  selectedSize = signal<string | null>(null);
  selectedColor = signal<string | null>(null);
  sortBy = signal<'newest' | 'price-asc' | 'price-desc'>('newest');
  showFilters = signal(false);

  categories = this.storeService.categories;

  filteredProducts = computed(() => {
    return this.storeService.filterProducts({
      query: this.searchQuery(),
      categoryId: this.selectedCategory() || undefined,
      size: this.selectedSize() || undefined,
      color: this.selectedColor() || undefined,
      sort: this.sortBy()
    });
  });

  allSizes = computed(() => {
    const products = this.storeService.products();
    const sizes = new Set<string>();
    products.forEach(p => {
      if (p.sizes) {
        p.sizes.forEach((s: string) => sizes.add(s));
      }
    });
    return Array.from(sizes).sort();
  });

  allColors = computed(() => {
    const products = this.storeService.products();
    const colorsMap = new Map<string, string>();
    products.forEach(p => {
      if (p.colors) {
        p.colors.forEach((c: any) => colorsMap.set(c.name, c.hex));
      }
    });
    return Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex }));
  });

  activeCategoryName = computed(() => {
    const catId = this.selectedCategory();
    if (!catId) return 'Todas as Peças';
    const cat = this.categories().find(c => c.id === catId);
    return cat ? cat.name : 'Todas as Peças';
  });

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchQuery().trim()) count++;
    if (this.selectedCategory()) count++;
    if (this.selectedSize()) count++;
    if (this.selectedColor()) count++;
    if (this.sortBy() !== 'newest') count++;
    return count;
  });

  constructor() {
    effect(() => {
      const catName = this.activeCategoryName();
      this.seoService.setPageMeta(
        catName === 'Todas as Peças' ? 'Catálogo & Coleção Completa' : `${catName} — Coleção`,
        `Explore as peças de ${catName} da ${this.storeConfig.name}. Streetwear autêntico e modelagens exclusivas.`
      );
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const catSlug = params['categoria'];
      if (catSlug) {
        const cat = this.categories().find(c => c.slug === catSlug);
        if (cat) {
          this.selectedCategory.set(cat.id);
        }
      }
    });
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
    this.selectedSize.set(null);
    this.selectedColor.set(null);
    this.sortBy.set('newest');
  }

  toggleFilters() {
    this.showFilters.set(!this.showFilters());
  }

  closeFilters() {
    this.showFilters.set(false);
  }

  setCategory(id: string | null) {
    this.selectedCategory.set(id);
  }

  setSize(size: string | null) {
    this.selectedSize.set(size);
  }

  setColor(color: string | null) {
    this.selectedColor.set(color);
  }

  setSort(sort: string) {
    this.sortBy.set(sort as any);
  }
}
