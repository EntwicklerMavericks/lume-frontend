import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [],
  standalone: true,
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  // Reduced KPIs
  stats = [
    { title: 'Total de Produtos', value: '45', icon: 'products' },
    { title: 'Total de Pedidos', value: '124', icon: 'orders' },
    { title: 'Total de Clientes', value: '89', icon: 'clients' }
  ];

  // Latest added items
  latestProducts = [
    { name: 'Camiseta Pima Premium Black', sku: 'BI-TSH-001', price: 129.90, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200' },
    { name: 'Calça Chino Slim Gray', sku: 'BI-PAN-002', price: 249.90, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200' },
    { name: 'Jaqueta Bomber Couro Eclipse', sku: 'BI-JAC-003', price: 1290.00, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200' }
  ];

  // Latest placed orders
  latestOrders = [
    { id: '#1024', client: 'João Paulo Dev', date: 'Hoje, 14:32', total: 389.70, status: 'paid', statusLabel: 'Pago' },
    { id: '#1023', client: 'Maria Silva', date: 'Hoje, 11:15', total: 1290.00, status: 'shipped', statusLabel: 'Enviado' },
    { id: '#1022', client: 'Carlos Santos', date: 'Ontem, 17:45', total: 249.90, status: 'pending', statusLabel: 'Aguardando Pagamento' }
  ];
}
