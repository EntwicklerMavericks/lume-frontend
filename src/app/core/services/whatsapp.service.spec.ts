import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, provideZonelessChangeDetection } from '@angular/core';
import { WhatsappService } from './whatsapp.service';
import { CartItem, Product } from '../models/store.models';
import { STORE_CONFIG } from '../config/store.config';

describe('WhatsappService', () => {
  let service: WhatsappService;

  const mockProductA: Product = {
    id: 'prod-1',
    name: 'Camiseta Pima Essential',
    slug: 'camiseta-pima-essential',
    description: 'Desc',
    price: 159.90,
    images: ['img.jpg'],
    categoryId: 'cat-1',
    available: true,
  };

  const mockProductB: Product = {
    id: 'prod-2',
    name: 'Calça Alfaiataria',
    slug: 'calca-alfaiataria',
    description: 'Desc',
    price: 299.90,
    promotionalPrice: 249.90,
    images: ['img2.jpg'],
    categoryId: 'cat-2',
    available: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        WhatsappService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(WhatsappService);
  });

  it('deve gerar mensagem para compra direta de produto único com variações', () => {
    const msg = service.buildProductMessage(mockProductA, 2, 'G', 'Preto Intenso');

    expect(msg).toContain('Camiseta Pima Essential');
    expect(msg).toContain('Tamanho: G');
    expect(msg).toContain('Cor: Preto Intenso');
    expect(msg).toContain('Quantidade: 2');
    expect(msg).toContain(STORE_CONFIG.name);
  });

  it('deve gerar mensagem para carrinho com múltiplos produtos e variações', () => {
    const items: CartItem[] = [
      { product: mockProductA, quantity: 1, size: 'M', color: 'Preto' },
      { product: mockProductB, quantity: 2, size: '42' },
    ];
    const total = 159.90 + (249.90 * 2); // 659.70

    const msg = service.buildCartMessage(items, total);

    expect(msg).toContain(STORE_CONFIG.whatsappGreeting);
    expect(msg).toContain('1x Camiseta Pima Essential');
    expect(msg).toContain('Tamanho: M');
    expect(msg).toContain('Cor: Preto');
    expect(msg).toContain('2x Calça Alfaiataria');
    expect(msg).toContain('Tamanho: 42');
    expect(msg).toContain(STORE_CONFIG.whatsappClosing);
  });

  it('deve incluir observações do cliente quando fornecidas', () => {
    const items: CartItem[] = [
      { product: mockProductA, quantity: 1, size: 'M' },
    ];
    const note = 'Favor embrulhar para presente.';

    const msg = service.buildCartMessage(items, 159.90, note);

    expect(msg).toContain('Observação: Favor embrulhar para presente.');
  });

  it('deve abrir URL com wa.me e encodeURIComponent correto', () => {
    spyOn(window, 'open');

    const testMessage = 'Olá! Teste com acentuação & caracteres especiais: R$ 150,00';
    service.openWhatsApp(testMessage);

    const expectedEncoded = encodeURIComponent(testMessage);
    const expectedUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${expectedEncoded}`;

    expect(window.open).toHaveBeenCalledWith(expectedUrl, '_blank');
  });
});
