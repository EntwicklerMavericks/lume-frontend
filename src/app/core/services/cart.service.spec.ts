import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, provideZonelessChangeDetection } from '@angular/core';
import { CartService } from './cart.service';
import { Product } from '../models/store.models';

describe('CartService', () => {
  let service: CartService;

  const mockProductA: Product = {
    id: 'prod-test-1',
    name: 'Camiseta Teste A',
    slug: 'camiseta-teste-a',
    description: 'Desc',
    price: 100.0,
    images: ['img1.jpg'],
    categoryId: 'cat-1',
    available: true,
  };

  const mockProductB: Product = {
    id: 'prod-test-2',
    name: 'Calça Teste B',
    slug: 'calca-teste-b',
    description: 'Desc',
    price: 200.0,
    promotionalPrice: 150.0,
    images: ['img2.jpg'],
    categoryId: 'cat-2',
    available: true,
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CartService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(CartService);
    service.clearCart();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve inicializar com carrinho vazio', () => {
    expect(service.cartItems()).toEqual([]);
    expect(service.totalItems()).toBe(0);
    expect(service.subtotal()).toBe(0);
    expect(service.isEmpty()).toBeTrue();
  });

  it('deve adicionar um produto ao carrinho', () => {
    service.addItem(mockProductA, 1, 'M', 'Preto');
    expect(service.totalItems()).toBe(1);
    expect(service.subtotal()).toBe(100.0);
    expect(service.cartItems()[0].size).toBe('M');
    expect(service.cartItems()[0].color).toBe('Preto');
    expect(service.isEmpty()).toBeFalse();
  });

  it('deve incrementar quantidade ao adicionar o mesmo produto com as mesmas variações', () => {
    service.addItem(mockProductA, 1, 'M', 'Preto');
    service.addItem(mockProductA, 2, 'M', 'Preto');

    expect(service.cartItems().length).toBe(1);
    expect(service.cartItems()[0].quantity).toBe(3);
    expect(service.totalItems()).toBe(3);
    expect(service.subtotal()).toBe(300.0);
  });

  it('deve criar itens separados ao adicionar o mesmo produto com tamanhos ou cores diferentes', () => {
    service.addItem(mockProductA, 1, 'M', 'Preto');
    service.addItem(mockProductA, 1, 'G', 'Preto');

    expect(service.cartItems().length).toBe(2);
    expect(service.totalItems()).toBe(2);
    expect(service.subtotal()).toBe(200.0);
  });

  it('deve calcular subtotal com preço promocional quando aplicável', () => {
    service.addItem(mockProductB, 2, '40'); // promotionalPrice 150 ao invés de 200

    expect(service.subtotal()).toBe(300.0);
  });

  it('deve atualizar quantidade de um item existente', () => {
    service.addItem(mockProductA, 1, 'M', 'Preto');
    service.updateQuantity(mockProductA.id, 5, 'M', 'Preto');

    expect(service.cartItems()[0].quantity).toBe(5);
    expect(service.subtotal()).toBe(500.0);
  });

  it('deve remover o item se quantidade for atualizada para 0 ou negativo', () => {
    service.addItem(mockProductA, 2, 'M', 'Preto');
    service.updateQuantity(mockProductA.id, 0, 'M', 'Preto');

    expect(service.cartItems().length).toBe(0);
    expect(service.isEmpty()).toBeTrue();
  });

  it('deve remover um item específico do carrinho', () => {
    service.addItem(mockProductA, 1, 'M', 'Preto');
    service.addItem(mockProductB, 1, '42');

    service.removeItem(mockProductA.id, 'M', 'Preto');

    expect(service.cartItems().length).toBe(1);
    expect(service.cartItems()[0].product.id).toBe(mockProductB.id);
  });

  it('deve limpar completamente o carrinho', () => {
    service.addItem(mockProductA, 2, 'M');
    service.addItem(mockProductB, 1, 'G');

    service.clearCart();

    expect(service.cartItems()).toEqual([]);
    expect(service.totalItems()).toBe(0);
    expect(service.subtotal()).toBe(0);
    expect(service.isEmpty()).toBeTrue();
  });

  it('deve persistir e carregar itens do localStorage', () => {
    service.addItem(mockProductA, 2, 'P', 'Branco');

    // Instancia novo serviço para testar hidratação do localStorage
    const newService = TestBed.runInInjectionContext(() => new CartService());
    expect(newService.totalItems()).toBe(2);
    expect(newService.cartItems()[0].product.name).toBe('Camiseta Teste A');
  });
});
