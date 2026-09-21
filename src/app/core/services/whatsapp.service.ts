import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem, Product } from '../models/store.models';
import { STORE_CONFIG } from '../config/store.config';

/**
 * Serviço de integração com WhatsApp.
 * Gera mensagens formatadas e redireciona para wa.me.
 */
@Injectable({
  providedIn: 'root',
})
export class WhatsappService {
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Gera mensagem formatada para um pedido completo (carrinho).
   */
  buildCartMessage(items: CartItem[], total: number, customerNote?: string): string {
    const lines: string[] = [STORE_CONFIG.whatsappGreeting, '', 'Produtos:', ''];

    items.forEach((item) => {
      const price = item.product.promotionalPrice ?? item.product.price;
      const itemTotal = price * item.quantity;

      let line = `${item.quantity}x ${item.product.name}`;
      if (item.size) line += `\nTamanho: ${item.size}`;
      if (item.color) line += `\nCor: ${item.color}`;
      line += `\n${this.formatPrice(itemTotal)}`;

      lines.push(line, '');
    });

    lines.push(`Total: ${this.formatPrice(total)}`);

    if (customerNote && customerNote.trim()) {
      lines.push('', `Observação: ${customerNote.trim()}`);
    }

    lines.push('', STORE_CONFIG.whatsappClosing);

    return lines.join('\n');
  }

  /**
   * Gera mensagem para compra direta de um produto.
   */
  buildProductMessage(
    product: Product,
    quantity: number = 1,
    size?: string,
    color?: string
  ): string {
    const price = product.promotionalPrice ?? product.price;
    const total = price * quantity;

    const lines: string[] = [
      'Olá! Gostaria de comprar:',
      '',
      `Produto: ${product.name}`,
    ];

    if (size) lines.push(`Tamanho: ${size}`);
    if (color) lines.push(`Cor: ${color}`);
    lines.push(`Quantidade: ${quantity}`);
    lines.push(`Preço: ${this.formatPrice(total)}`);
    lines.push('', STORE_CONFIG.name);

    return lines.join('\n');
  }

  /**
   * Abre o WhatsApp com a mensagem formatada.
   */
  openWhatsApp(message: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  }

  /**
   * Atalho: abre WhatsApp com carrinho completo.
   */
  sendCartOrder(items: CartItem[], total: number, customerNote?: string): void {
    const message = this.buildCartMessage(items, total, customerNote);
    this.openWhatsApp(message);
  }

  /**
   * Atalho: abre WhatsApp para compra direta de um produto.
   */
  sendProductOrder(
    product: Product,
    quantity?: number,
    size?: string,
    color?: string
  ): void {
    const message = this.buildProductMessage(product, quantity, size, color);
    this.openWhatsApp(message);
  }

  /** Formata valor em BRL */
  private formatPrice(value: number): string {
    return value.toLocaleString(STORE_CONFIG.locale, {
      style: 'currency',
      currency: STORE_CONFIG.currency,
    });
  }
}
