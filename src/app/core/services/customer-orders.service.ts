import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CustomerOrderItem {
  id: string;
  name: string;
  sku?: string;
  image?: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  subtotal: number;
  shippingCost: number;
  shippingMethod?: string;
  discount: number;
  total: number;
  paymentMethod: 'PIX' | 'CREDIT_CARD';
  status: 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'OVERDUE' | 'REFUNDED';
  pixQrCodeImage?: string;
  pixCopiaECola?: string;
  pixExpiresAt?: string;
  trackingCode?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  items: CustomerOrderItem[];
}

@Injectable({
  providedIn: 'root',
})
export class CustomerOrdersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Busca todos os pedidos associados à conta do cliente
   */
  getMyOrders(): Observable<CustomerOrder[]> {
    return this.http.get<CustomerOrder[]>(`${this.apiUrl}/orders/my-orders`);
  }

  /**
   * Busca detalhes de um pedido específico
   */
  getOrder(id: string): Observable<CustomerOrder> {
    return this.http.get<CustomerOrder>(`${this.apiUrl}/orders/${id}`);
  }
}
