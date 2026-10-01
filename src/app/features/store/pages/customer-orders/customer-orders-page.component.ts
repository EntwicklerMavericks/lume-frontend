import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CustomerOrder, CustomerOrdersService } from '../../../../core/services/customer-orders.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-customer-orders-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-orders-page.component.html',
  styleUrls: ['./customer-orders-page.component.scss']
})
export class CustomerOrdersPageComponent implements OnInit {
  public authService = inject(AuthService);
  private ordersService = inject(CustomerOrdersService);
  private router = inject(Router);

  orders = signal<CustomerOrder[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  selectedFilter = signal<'ALL' | 'PENDING' | 'SHIPPED' | 'DELIVERED'>('ALL');

  // Modal para exibir PIX Copia e Cola
  activePixOrder = signal<CustomerOrder | null>(null);
  copiedPix = signal<boolean>(false);

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/conta/login'], { queryParams: { returnUrl: '/conta/pedidos' } });
      return;
    }

    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.ordersService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Não foi possível carregar seus pedidos. Tente atualizar a página.');
      }
    });
  }

  setFilter(filter: 'ALL' | 'PENDING' | 'SHIPPED' | 'DELIVERED'): void {
    this.selectedFilter.set(filter);
  }

  get filteredOrders(): CustomerOrder[] {
    const filter = this.selectedFilter();
    const list = this.orders();

    if (filter === 'PENDING') {
      return list.filter(o => o.status === 'PENDING_PAYMENT');
    }
    if (filter === 'SHIPPED') {
      return list.filter(o => o.status === 'SHIPPED' || o.status === 'PREPARING');
    }
    if (filter === 'DELIVERED') {
      return list.filter(o => o.status === 'DELIVERED' || o.status === 'PAID');
    }
    return list;
  }

  getStatusBadge(status: string): { label: string; class: string } {
    switch (status) {
      case 'PAID':
        return { label: 'Pagamento Aprovado', class: 'status-paid' };
      case 'PREPARING':
        return { label: 'Em Separação', class: 'status-preparing' };
      case 'SHIPPED':
        return { label: 'Despachado / Em Rota', class: 'status-shipped' };
      case 'DELIVERED':
        return { label: 'Entregue', class: 'status-delivered' };
      case 'CANCELLED':
        return { label: 'Cancelado', class: 'status-cancelled' };
      case 'PENDING_PAYMENT':
      default:
        return { label: 'Aguardando Pagamento', class: 'status-pending' };
    }
  }

  openPixModal(order: CustomerOrder): void {
    this.activePixOrder.set(order);
    this.copiedPix.set(false);
  }

  closePixModal(): void {
    this.activePixOrder.set(null);
  }

  copyPix(text?: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copiedPix.set(true);
      setTimeout(() => this.copiedPix.set(false), 3000);
    });
  }

  openCorreiosTracking(trackingCode?: string): void {
    if (!trackingCode) return;
    const url = `https://rastreamento.correios.com.br/app/index.php?codigo=${encodeURIComponent(trackingCode)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  onLogout(): void {
    this.authService.logout('/');
  }
}
