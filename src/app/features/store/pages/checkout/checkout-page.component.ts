import { Component, inject, OnInit, OnDestroy, signal, computed, HostListener } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { CheckoutService, CheckoutPayload } from '../../../../core/services/checkout.service';
import { SeoService } from '../../../../core/services/seo.service';
import { STORE_CONFIG } from '../../../../core/config/store.config';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss'],
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private checkoutService = inject(CheckoutService);
  private seoService = inject(SeoService);
  private router = inject(Router);

  storeConfig = STORE_CONFIG;

  // Cart
  cartItems = this.cartService.cartItems;
  subtotal = this.cartService.subtotal;
  isEmpty = this.cartService.isEmpty;
  shippingCost = signal(0); // Frete promocional gratuito
  total = computed(() => this.subtotal() + this.shippingCost());

  // Payment method
  paymentMethod = signal<'PIX' | 'CREDIT_CARD'>('PIX');
  installments = signal<number>(1);

  // Customer Data
  customerName = signal('');
  customerEmail = signal('');
  customerCpf = signal('');
  customerPhone = signal('');

  // Address Data
  postalCode = signal('');
  street = signal('');
  number = signal('');
  complement = signal('');
  neighborhood = signal('');
  city = signal('');
  state = signal('');
  isLoadingCep = signal(false);

  // Credit Card Data
  cardHolderName = signal('');
  cardNumber = signal('');
  cardExpiry = signal(''); // MM/AA
  cardCvv = signal('');

  // Customer Notes
  customerNotes = signal('');

  // State & Loading
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // PIX Modal & Live Status
  showPixModal = signal(false);
  pixData = signal<{
    orderId: string;
    orderNumber: string;
    qrCodeImage: string;
    copiaECola: string;
    expiresAt: string;
  } | null>(null);
  pixCopied = signal(false);
  pixApproved = signal(false);
  private pollingTimer: any = null;

  // Installment Options (1x to 12x)
  installmentOptions = computed(() => {
    const tot = this.total();
    const options: { count: number; value: number; label: string }[] = [];
    for (let i = 1; i <= 12; i++) {
      const val = tot / i;
      options.push({
        count: i,
        value: val,
        label: `${i}x de R$ ${val.toFixed(2).replace('.', ',')} sem juros`,
      });
    }
    return options;
  });

  isInstallmentsOpen = signal<boolean>(false);

  selectedInstallment = computed(() => {
    return (
      this.installmentOptions().find((opt) => opt.count === this.installments()) ||
      this.installmentOptions()[0]
    );
  });

  toggleInstallments(event: MouseEvent) {
    event.stopPropagation();
    this.isInstallmentsOpen.update((open) => !open);
  }

  selectInstallment(count: number, event: MouseEvent) {
    event.stopPropagation();
    this.installments.set(count);
    this.isInstallmentsOpen.set(false);
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.isInstallmentsOpen.set(false);
  }

  ngOnInit(): void {
    this.seoService.setPageMeta(
      'Checkout Transparente Seguro',
      `Finalize suas compras com segurança na ${STORE_CONFIG.name} via PIX ou Cartão de Crédito com aprovação imediata.`
    );

    // Redireciona se a sacola estiver vazia
    if (this.isEmpty()) {
      this.router.navigate(['/carrinho']);
    }
  }

  ngOnDestroy(): void {
    this.stopPixPolling();
  }

  // --- MÁSCARAS E FORMATAÇÃO ---
  onCpfInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    this.customerCpf.set(v);
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    this.customerPhone.set(v);
  }

  onCepInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    this.postalCode.set(v);

    if (v.replace(/\D/g, '').length === 8) {
      this.searchCep(v.replace(/\D/g, ''));
    }
  }

  onCardNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 16);
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardNumber.set(v);
  }

  onCardExpiryInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 4);
    if (v.length > 2) v = v.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    this.cardExpiry.set(v);
  }

  onCvvInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const v = input.value.replace(/\D/g, '').slice(0, 4);
    this.cardCvv.set(v);
  }

  searchCep(cep: string) {
    this.isLoadingCep.set(true);
    this.checkoutService.lookupCep(cep).subscribe({
      next: (res) => {
        this.isLoadingCep.set(false);
        if (!res.erro) {
          this.street.set(res.logradouro || '');
          this.neighborhood.set(res.bairro || '');
          this.city.set(res.localidade || '');
          this.state.set(res.uf || '');
        }
      },
      error: () => this.isLoadingCep.set(false),
    });
  }

  // --- SUBMISSÃO DO CHECKOUT ---
  submitOrder() {
    this.errorMessage.set(null);

    // Validações básicas
    if (!this.customerName().trim()) {
      this.errorMessage.set('Por favor, informe seu nome completo.');
      return;
    }
    if (!this.customerEmail().trim() || !this.customerEmail().includes('@')) {
      this.errorMessage.set('Por favor, informe um e-mail válido.');
      return;
    }
    if (this.customerCpf().replace(/\D/g, '').length < 11) {
      this.errorMessage.set('Por favor, informe um CPF válido.');
      return;
    }
    if (this.customerPhone().replace(/\D/g, '').length < 10) {
      this.errorMessage.set('Por favor, informe um telefone/WhatsApp com DDD.');
      return;
    }
    if (this.postalCode().replace(/\D/g, '').length < 8) {
      this.errorMessage.set('Por favor, informe um CEP válido.');
      return;
    }
    if (!this.street().trim() || !this.number().trim()) {
      this.errorMessage.set('Por favor, complete os dados de rua e número do endereço.');
      return;
    }

    if (this.paymentMethod() === 'CREDIT_CARD') {
      if (!this.cardHolderName().trim()) {
        this.errorMessage.set('Informe o nome impresso no cartão.');
        return;
      }
      if (this.cardNumber().replace(/\D/g, '').length < 15) {
        this.errorMessage.set('Informe o número completo do cartão.');
        return;
      }
      if (this.cardExpiry().replace(/\D/g, '').length < 4) {
        this.errorMessage.set('Informe a validade do cartão (MM/AA).');
        return;
      }
      if (this.cardCvv().trim().length < 3) {
        this.errorMessage.set('Informe o código de segurança (CVV).');
        return;
      }
    }

    this.isSubmitting.set(true);

    const [expiryMonth, expiryYear] = this.cardExpiry().split('/');

    const payload: CheckoutPayload = {
      customerName: this.customerName(),
      customerEmail: this.customerEmail(),
      customerCpf: this.customerCpf(),
      customerPhone: this.customerPhone(),
      address: {
        postalCode: this.postalCode(),
        street: this.street(),
        number: this.number(),
        complement: this.complement() || undefined,
        neighborhood: this.neighborhood(),
        city: this.city(),
        state: this.state(),
      },
      items: this.cartItems().map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        image: item.product.images?.[0] || '',
        size: item.size,
        color: item.color,
        price: item.product.promotionalPrice ?? item.product.price,
        quantity: item.quantity,
      })),
      paymentMethod: this.paymentMethod(),
      customerNotes: this.customerNotes() || undefined,
    };

    if (this.paymentMethod() === 'CREDIT_CARD') {
      payload.installments = this.installments();
      payload.creditCard = {
        holderName: this.cardHolderName(),
        number: this.cardNumber().replace(/\D/g, ''),
        expiryMonth: expiryMonth?.trim() || '',
        expiryYear: expiryYear?.trim() || '',
        cvv: this.cardCvv().trim(),
      };
      payload.creditCardHolder = {
        name: this.cardHolderName(),
        email: this.customerEmail(),
        cpfCnpj: this.customerCpf(),
        postalCode: this.postalCode(),
        addressNumber: this.number(),
        addressComplement: this.complement() || undefined,
        phone: this.customerPhone(),
      };
    }

    this.checkoutService.processCheckout(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.paymentMethod === 'PIX' && res.pix) {
          // Exibe o modal PIX com QR code e inicia polling de aprovação
          this.pixData.set({
            orderId: res.orderId,
            orderNumber: res.orderNumber,
            qrCodeImage: res.pix.qrCodeImage,
            copiaECola: res.pix.copiaECola,
            expiresAt: res.pix.expiresAt,
          });
          this.showPixModal.set(true);
          this.startPixPolling(res.orderId);
        } else {
          // Cartão de Crédito aprovado
          this.cartService.clearCart();
          this.router.navigate(['/pedido-confirmado', res.orderId]);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.error?.message || 'Erro ao processar pagamento. Verifique os dados e tente novamente.'
        );
      },
    });
  }

  // --- POLLING E AÇÕES PIX ---
  startPixPolling(orderId: string) {
    this.stopPixPolling();
    this.pollingTimer = setInterval(() => {
      this.checkoutService.getOrderStatus(orderId).subscribe({
        next: (status) => {
          if (status.isPaid) {
            this.stopPixPolling();
            this.pixApproved.set(true);
            this.cartService.clearCart();
            setTimeout(() => {
              this.router.navigate(['/pedido-confirmado', orderId]);
            }, 1800);
          }
        },
      });
    }, 3000);
  }

  stopPixPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  copyPixCode() {
    const code = this.pixData()?.copiaECola;
    if (code) {
      navigator.clipboard.writeText(code);
      this.pixCopied.set(true);
      setTimeout(() => this.pixCopied.set(false), 3000);
    }
  }

  simulatePixPayment() {
    const orderId = this.pixData()?.orderId;
    if (!orderId) return;

    this.checkoutService.simulatePaymentApproval(orderId).subscribe({
      next: () => {
        this.pixApproved.set(true);
        this.stopPixPolling();
        this.cartService.clearCart();
        setTimeout(() => {
          this.router.navigate(['/pedido-confirmado', orderId]);
        }, 1500);
      },
    });
  }

  closePixModal() {
    this.stopPixPolling();
    this.showPixModal.set(false);
  }
}
