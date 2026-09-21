import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StoreService } from './store.service';

describe('StoreService', () => {
  let service: StoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        StoreService
      ]
    });
    service = TestBed.inject(StoreService);
    service.initWithMockData();
  });

  it('deve retornar lista de produtos e categorias mockados', () => {
    expect(service.products().length).toBeGreaterThan(0);
    expect(service.categories().length).toBeGreaterThan(0);
  });

  it('deve buscar produto por ID existente', () => {
    const all = service.products();
    const target = all[0];

    const found = service.getProductById(target.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe(target.name);
  });

  it('deve buscar produtos por termo de pesquisa (case-insensitive)', () => {
    const results = service.searchProducts('pima');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(p => p.name.toLowerCase().includes('pima') || p.description.toLowerCase().includes('pima'))).toBeTrue();
  });

  it('deve filtrar produtos por categoria específica', () => {
    const results = service.filterProducts({ categoryId: 'cat-1' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(p => p.categoryId === 'cat-1')).toBeTrue();
  });

  it('deve filtrar produtos por tamanho', () => {
    const results = service.filterProducts({ size: 'GG' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(p => p.sizes?.includes('GG'))).toBeTrue();
  });

  it('deve filtrar produtos por cor', () => {
    const results = service.filterProducts({ color: 'Preto Intenso' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(p => p.colors?.some(c => c.name === 'Preto Intenso'))).toBeTrue();
  });

  it('deve ordenar produtos por menor preço (price-asc)', () => {
    const results = service.filterProducts({ sort: 'price-asc' });
    for (let i = 0; i < results.length - 1; i++) {
      const priceA = results[i].promotionalPrice ?? results[i].price;
      const priceB = results[i + 1].promotionalPrice ?? results[i + 1].price;
      expect(priceA).toBeLessThanOrEqual(priceB);
    }
  });

  it('deve ordenar produtos por maior preço (price-desc)', () => {
    const results = service.filterProducts({ sort: 'price-desc' });
    for (let i = 0; i < results.length - 1; i++) {
      const priceA = results[i].promotionalPrice ?? results[i].price;
      const priceB = results[i + 1].promotionalPrice ?? results[i + 1].price;
      expect(priceA).toBeGreaterThanOrEqual(priceB);
    }
  });
});
