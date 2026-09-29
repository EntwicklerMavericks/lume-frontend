import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  backendId?: string;
  client: string;
  email: string;
  phone?: string;
  address?: string;
  date: string;
  items: OrderItem[];
  total: number;
  paymentMethod?: string;
  status: 'pending_payment' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  statusLabel: string;
  trackingCode?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss'
})
export class OrdersPageComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  showDetailsModal = signal<boolean>(false);
  selectedOrder = signal<Order | null>(null);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(true);

  trackingInput = signal<string>('');
  isSavingTracking = signal<boolean>(false);
  saveTrackingSuccess = signal<boolean>(false);

  // List of orders
  orders = signal<Order[]>([
    {
      id: 'LUM-ORD-1024',
      client: 'João Paulo Dev',
      email: 'joaopaulo@dev.com',
      date: '2026-07-09 14:32',
      total: 389.70,
      paymentMethod: 'PIX',
      status: 'paid',
      statusLabel: 'Pago',
      items: [
        { name: 'Camiseta Pima Premium Black', sku: 'LUM-TSH-001', quantity: 3, price: 129.90 }
      ]
    },
    {
      id: 'LUM-ORD-1023',
      client: 'Maria Silva',
      email: 'maria.silva@gmail.com',
      date: '2026-07-09 11:15',
      total: 1290.00,
      paymentMethod: 'Cartão de Crédito',
      status: 'shipped',
      statusLabel: 'Enviado',
      items: [
        { name: 'Jaqueta Bomber Couro Eclipse', sku: 'LUM-JAC-003', quantity: 1, price: 1290.00 }
      ]
    }
  ]);

  filteredOrders = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.orders();
    return this.orders().filter(ord =>
      ord.id.toLowerCase().includes(term) ||
      ord.client.toLowerCase().includes(term) ||
      ord.email.toLowerCase().includes(term) ||
      ord.statusLabel.toLowerCase().includes(term) ||
      (ord.paymentMethod && ord.paymentMethod.toLowerCase().includes(term))
    );
  });

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchTerm.set(val);
  }

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.isLoading.set(true);
    this.http.get<any>(`${this.apiUrl}/orders`).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res && res.orders && res.orders.length > 0) {
          const mapped: Order[] = res.orders.map((o: any) => {
            const statusKey = this.mapBackendStatus(o.status);
            const addressStr = o.street ? `${o.street}, ${o.number} - ${o.neighborhood}, ${o.city}/${o.state}` : '';
            return {
              id: o.orderNumber || o.id,
              backendId: o.id,
              client: o.customerName,
              email: o.customerEmail,
              phone: o.customerPhone,
              address: addressStr,
              date: new Date(o.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
              total: Number(o.total),
              paymentMethod: o.paymentMethod === 'PIX' ? 'PIX Asaas' : 'Cartão de Crédito Asaas',
              status: statusKey,
              statusLabel: this.getStatusLabel(statusKey),
              trackingCode: o.trackingCode || '',
              shippedAt: o.shippedAt ? new Date(o.shippedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : undefined,
              deliveredAt: o.deliveredAt ? new Date(o.deliveredAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : undefined,
              items: (o.items || []).map((it: any) => ({
                name: it.name,
                sku: it.sku || 'N/A',
                quantity: it.quantity,
                price: Number(it.price)
              }))
            };
          });

          this.orders.set(mapped);
        }
      },
      error: () => {
        this.isLoading.set(false);
        // Mantém pedidos locais em caso de indisponibilidade
      }
    });
  }

  mapBackendStatus(status: string): Order['status'] {
    switch (status) {
      case 'PAID': return 'paid';
      case 'PREPARING': return 'preparing';
      case 'SHIPPED': return 'shipped';
      case 'DELIVERED': return 'delivered';
      case 'CANCELLED': return 'cancelled';
      case 'PENDING_PAYMENT':
      default:
        return 'pending_payment';
    }
  }

  getStatusLabel(status: Order['status']): string {
    const labels: Record<string, string> = {
      'pending_payment': 'Aguardando Pagamento',
      'paid': 'Pago',
      'preparing': 'Em separação',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  openDetails(order: Order): void {
    this.selectedOrder.set(order);
    this.trackingInput.set(order.trackingCode || '');
    this.saveTrackingSuccess.set(false);
    this.showDetailsModal.set(true);
  }

  closeModal(): void {
    this.showDetailsModal.set(false);
    this.selectedOrder.set(null);
  }

  onTrackingInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.trackingInput.set(val);
  }

  saveTracking(order: Order): void {
    const code = this.trackingInput().trim();
    const orderKey = order.backendId || order.id;
    this.isSavingTracking.set(true);
    this.saveTrackingSuccess.set(false);

    const backendStatus = this.mapToBackendStatus(order.status);

    this.http.patch<any>(`${this.apiUrl}/orders/${orderKey}/status`, {
      status: backendStatus,
      trackingCode: code
    }).subscribe({
      next: () => {
        this.isSavingTracking.set(false);
        this.saveTrackingSuccess.set(true);
        setTimeout(() => this.saveTrackingSuccess.set(false), 3000);

        // Atualiza na listagem
        this.orders.update(list => list.map(ord => {
          if (ord.id === order.id || ord.backendId === orderKey) {
            return { ...ord, trackingCode: code };
          }
          return ord;
        }));

        // Atualiza no pedido selecionado
        this.selectedOrder.update(curr => {
          if (curr) {
            return { ...curr, trackingCode: code };
          }
          return null;
        });
      },
      error: () => {
        this.isSavingTracking.set(false);
      }
    });
  }

  getCorreiosUrl(code?: string): string {
    if (!code) return 'https://rastreamento.correios.com.br';
    return `https://rastreamento.correios.com.br/app/index.php?codigo=${encodeURIComponent(code.trim())}`;
  }

  updateStatus(orderId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as any;
    
    this.orders.update(list => list.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: newStatus,
          statusLabel: this.getStatusLabel(newStatus)
        };
      }
      return ord;
    }));

    const currentSelected = this.selectedOrder();
    if (currentSelected && currentSelected.id === orderId) {
      this.selectedOrder.set({
        ...currentSelected,
        status: newStatus,
        statusLabel: this.getStatusLabel(newStatus)
      });
    }

    // Persiste no backend se for um ID real
    const backendStatus = this.mapToBackendStatus(newStatus);
    const orderObj = this.orders().find(o => o.id === orderId);
    const trackingCodeToSend = orderObj?.trackingCode;

    this.http.patch(`${this.apiUrl}/orders/${orderId}/status`, {
      status: backendStatus,
      ...(trackingCodeToSend ? { trackingCode: trackingCodeToSend } : {})
    }).subscribe({
      error: () => {}
    });
  }

  mapToBackendStatus(status: Order['status']): string {
    switch (status) {
      case 'paid': return 'PAID';
      case 'preparing': return 'PREPARING';
      case 'shipped': return 'SHIPPED';
      case 'delivered': return 'DELIVERED';
      case 'cancelled': return 'CANCELLED';
      case 'pending_payment':
      default:
        return 'PENDING_PAYMENT';
    }
  }
}
