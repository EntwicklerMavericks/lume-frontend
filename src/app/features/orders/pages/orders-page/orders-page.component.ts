import { Component, signal } from '@angular/core';

interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  client: string;
  email: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'pending_payment' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  statusLabel: string;
}

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss'
})
export class OrdersPageComponent {
  showDetailsModal = signal<boolean>(false);
  selectedOrder = signal<Order | null>(null);

  // Mock list of orders for Lume
  orders = signal<Order[]>([
    {
      id: 'BI-ORD-1024',
      client: 'João Paulo Dev',
      email: 'joaopaulo@dev.com',
      date: '2026-07-09 14:32',
      total: 389.70,
      status: 'paid',
      statusLabel: 'Pago',
      items: [
        { name: 'Camiseta Pima Premium Black', sku: 'BI-TSH-001', quantity: 3, price: 129.90 }
      ]
    },
    {
      id: 'BI-ORD-1023',
      client: 'Maria Silva',
      email: 'maria.silva@gmail.com',
      date: '2026-07-09 11:15',
      total: 1290.00,
      status: 'shipped',
      statusLabel: 'Enviado',
      items: [
        { name: 'Jaqueta Bomber Couro Eclipse', sku: 'BI-JAC-003', quantity: 1, price: 1290.00 }
      ]
    },
    {
      id: 'BI-ORD-1022',
      client: 'Carlos Santos',
      email: 'carlos.s@yahoo.com',
      date: '2026-07-08 17:45',
      total: 249.90,
      status: 'pending_payment',
      statusLabel: 'Aguardando Pagamento',
      items: [
        { name: 'Calça Chino Slim Gray', sku: 'BI-PAN-002', quantity: 1, price: 249.90 }
      ]
    },
    {
      id: 'BI-ORD-1021',
      client: 'Ana Oliveira',
      email: 'ana.oliveira@outlook.com',
      date: '2026-07-07 09:20',
      total: 519.60,
      status: 'delivered',
      statusLabel: 'Entregue',
      items: [
        { name: 'Camiseta Pima Premium Black', sku: 'BI-TSH-001', quantity: 4, price: 129.90 }
      ]
    }
  ]);

  openDetails(order: Order): void {
    this.selectedOrder.set(order);
    this.showDetailsModal.set(true);
  }

  closeModal(): void {
    this.showDetailsModal.set(false);
    this.selectedOrder.set(null);
  }

  updateStatus(orderId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as any;
    
    const labels: { [key: string]: string } = {
      'pending_payment': 'Aguardando Pagamento',
      'paid': 'Pago',
      'preparing': 'Em separação',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };

    this.orders.update(list => list.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: newStatus,
          statusLabel: labels[newStatus]
        };
      }
      return ord;
    }));

    const currentSelected = this.selectedOrder();
    if (currentSelected && currentSelected.id === orderId) {
      this.selectedOrder.set({
        ...currentSelected,
        status: newStatus,
        statusLabel: labels[newStatus]
      });
    }
  }
}
