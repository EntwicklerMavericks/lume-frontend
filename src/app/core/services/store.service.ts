import { inject, Injectable, PLATFORM_ID, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, tap, catchError, map } from 'rxjs';
import { Product, Category, ProductColor } from '../models/store.models';
import { environment } from '../../../environments/environment';
import { MOCK_PRODUCTS } from '../data/products.mock';
import { MOCK_CATEGORIES } from '../data/categories.mock';

const CACHE_PRODUCTS_KEY = 'lume_products_cache';
const CACHE_CATEGORIES_KEY = 'lume_categories_cache';

function mapBackendToProduct(p: any): Product {
  const price = Number(p.price);
  const promotionalPrice = p.promotionalPrice ? Number(p.promotionalPrice) : undefined;

  // Map images
  const images = Array.isArray(p.images)
    ? p.images.map((img: any) => typeof img === 'string' ? img : img.url)
    : [];

  // Map colors
  let colors: ProductColor[] | undefined = undefined;
  if (Array.isArray(p.colors) && p.colors.length > 0) {
    colors = p.colors.map((c: any) => {
      if (typeof c === 'string') {
        return { name: c, hex: '#111827' };
      }
      return { name: c.name, hex: c.hex || '#111827' };
    });
  }

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price,
    promotionalPrice,
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000&q=85'],
    categoryId: p.categoryId,
    category: p.category ? {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
      description: p.category.description,
      image: p.category.image,
    } : undefined,
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    colors,
    composition: p.composition,
    fit: p.fit,
    washCare: p.washCare,
    available: p.status ?? true,
    featured: p.highlight ?? false,
    isNew: p.newLaunch ?? false,
    createdAt: p.createdAt,
  };
}

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = environment.apiUrl;

  private readonly productsData = signal<Product[]>([]);
  private readonly categoriesData = signal<Category[]>([]);

  readonly isLoading = signal<boolean>(true);
  readonly hasError = signal<boolean>(false);
  readonly isUsingCache = signal<boolean>(false);

  /** Todos os produtos ativos */
  readonly products = this.productsData.asReadonly();

  /** Todas as categorias */
  readonly categories = this.categoriesData.asReadonly();

  /** Produtos em destaque */
  readonly featuredProducts = computed(() =>
    this.productsData().filter((p) => p.featured && p.available)
  );

  /** Produtos novos */
  readonly newProducts = computed(() =>
    this.productsData().filter((p) => p.isNew && p.available)
  );

  constructor() {
    this.initStore();
  }

  private initStore(): void {
    // 1. Tentar restaurar cache recente do navegador (se disponível)
    if (isPlatformBrowser(this.platformId)) {
      try {
        const cachedProds = sessionStorage.getItem(CACHE_PRODUCTS_KEY);
        const cachedCats = sessionStorage.getItem(CACHE_CATEGORIES_KEY);
        if (cachedProds && cachedCats) {
          this.productsData.set(JSON.parse(cachedProds));
          this.categoriesData.set(JSON.parse(cachedCats));
          this.isUsingCache.set(true);
        }
      } catch (e) {
        // Silently ignore storage issues
      }
    }

    // 2. Carregar dados reais da API
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    if (!this.http) {
      this.isLoading.set(false);
      return;
    }

    // Carregar Categorias
    this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
      catchError((err) => {
        console.error('[StoreService] Erro ao carregar categorias da API:', err);
        return of([] as Category[]);
      })
    ).subscribe((categories) => {
      if (categories) {
        this.categoriesData.set(categories);
        if (isPlatformBrowser(this.platformId)) {
          try {
            sessionStorage.setItem(CACHE_CATEGORIES_KEY, JSON.stringify(categories));
          } catch (e) {}
        }
      }
    });

    // Carregar Produtos (apenas ativos para a vitrine pública)
    this.http.get<any[]>(`${this.apiUrl}/products`).pipe(
      catchError((err) => {
        console.error('[StoreService] Erro ao carregar produtos da API:', err);
        this.hasError.set(true);
        this.isLoading.set(false);
        return of(null);
      })
    ).subscribe((apiProducts) => {
      this.isLoading.set(false);
      if (apiProducts) {
        const mapped = apiProducts.map(mapBackendToProduct);
        this.productsData.set(mapped);
        this.hasError.set(false);
        this.isUsingCache.set(false);

        if (isPlatformBrowser(this.platformId)) {
          try {
            sessionStorage.setItem(CACHE_PRODUCTS_KEY, JSON.stringify(mapped));
          } catch (e) {}
        }
      }
    });
  }

  /**
   * Inicializa com dados de mock para testes unitários ou modo isolado
   */
  initWithMockData(): void {
    this.productsData.set(MOCK_PRODUCTS);
    this.categoriesData.set(MOCK_CATEGORIES);
    this.isLoading.set(false);
    this.hasError.set(false);
  }

  /** Buscar produto por ID ou Slug com suporte a Observable */
  getProduct(idOrSlug: string): Observable<Product | undefined> {
    const inMemory = this.getProductById(idOrSlug) || this.getProductBySlug(idOrSlug);
    if (inMemory) {
      return of(inMemory);
    }

    if (!this.http) {
      return of(undefined);
    }

    // Tentar endpoint por slug
    return this.http.get<any>(`${this.apiUrl}/products/slug/${idOrSlug}`).pipe(
      map(mapBackendToProduct),
      catchError(() => {
        // Se falhar por slug, tentar por ID
        return this.http!.get<any>(`${this.apiUrl}/products/${idOrSlug}`).pipe(
          map(mapBackendToProduct),
          catchError(() => of(undefined))
        );
      })
    );
  }

  /** Buscar produto por ID no estado atual */
  getProductById(id: string): Product | undefined {
    return this.productsData().find((p) => p.id === id);
  }

  /** Buscar produto por slug no estado atual */
  getProductBySlug(slug: string): Product | undefined {
    return this.productsData().find((p) => p.slug === slug);
  }

  /** Buscar categoria por ID no estado atual */
  getCategoryById(id: string): Category | undefined {
    return this.categoriesData().find((c) => c.id === id);
  }

  /** Buscar categoria por slug no estado atual */
  getCategoryBySlug(slug: string): Category | undefined {
    return this.categoriesData().find((c) => c.slug === slug);
  }

  /** Produtos por categoria */
  getProductsByCategory(categoryId: string): Product[] {
    return this.productsData().filter(
      (p) => p.categoryId === categoryId && p.available
    );
  }

  /** Buscar produtos por termo */
  searchProducts(query: string): Product[] {
    const term = query.toLowerCase().trim();
    if (!term) return this.productsData().filter((p) => p.available);

    return this.productsData().filter(
      (p) =>
        p.available &&
        (p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          (p.sku && p.sku.toLowerCase().includes(term)))
    );
  }

  /** Filtrar produtos */
  filterProducts(filters: {
    categoryId?: string;
    size?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
    sort?: 'newest' | 'price-asc' | 'price-desc';
  }): Product[] {
    let result = this.productsData().filter((p) => p.available);

    if (filters.categoryId) {
      result = result.filter((p) => p.categoryId === filters.categoryId);
    }

    if (filters.size) {
      result = result.filter((p) => p.sizes?.includes(filters.size!));
    }

    if (filters.color) {
      result = result.filter((p) =>
        p.colors?.some((c) => c.name === filters.color)
      );
    }

    if (filters.minPrice !== undefined) {
      result = result.filter(
        (p) => (p.promotionalPrice ?? p.price) >= filters.minPrice!
      );
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter(
        (p) => (p.promotionalPrice ?? p.price) <= filters.maxPrice!
      );
    }

    if (filters.query) {
      const term = filters.query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          (p.sku && p.sku.toLowerCase().includes(term))
      );
    }

    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc':
          result.sort(
            (a, b) =>
              (a.promotionalPrice ?? a.price) - (b.promotionalPrice ?? b.price)
          );
          break;
        case 'price-desc':
          result.sort(
            (a, b) =>
              (b.promotionalPrice ?? b.price) - (a.promotionalPrice ?? a.price)
          );
          break;
        case 'newest':
          result.sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime()
          );
          break;
      }
    }

    return result;
  }
}
