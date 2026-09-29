import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CheckoutAddress {
  postalCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface CheckoutItem {
  productId: string;
  name: string;
  sku?: string;
  image?: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
}

export interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string;
  phone: string;
}

export interface CheckoutPayload {
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerPhone: string;
  address: CheckoutAddress;
  items: CheckoutItem[];
  paymentMethod: 'PIX' | 'CREDIT_CARD';
  creditCard?: CreditCardData;
  creditCardHolder?: CreditCardHolderInfo;
  installments?: number;
  shippingCost?: number;
  shippingMethod?: string;
  customerNotes?: string;
}

export interface CheckoutResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  paymentMethod: 'PIX' | 'CREDIT_CARD';
  status: string;
  total: number;
  installments?: number;
  message?: string;
  pix?: {
    qrCodeImage: string;
    copiaECola: string;
    expiresAt: string;
  };
  isSimulator?: boolean;
}

export interface OrderStatusResponse {
  orderId: string;
  orderNumber: string;
  status: string;
  isPaid: boolean;
  total: number;
  paymentMethod: string;
  pix?: {
    qrCodeImage: string;
    copiaECola: string;
    expiresAt: string;
  } | null;
  items?: any[];
}

export interface ViaCepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  processCheckout(payload: CheckoutPayload): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/payments/checkout`, payload);
  }

  getOrderStatus(orderId: string): Observable<OrderStatusResponse> {
    return this.http.get<OrderStatusResponse>(`${this.apiUrl}/payments/order/${orderId}/status`);
  }

  simulatePaymentApproval(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/payments/simulate-payment/${orderId}`, {});
  }

  getOrderDetails(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/orders/${orderId}`);
  }

  lookupCep(cep: string): Observable<ViaCepResult> {
    const cleanCep = cep.replace(/\D/g, '');
    return this.http.get<ViaCepResult>(`${this.apiUrl}/shipping/cep/${cleanCep}`).pipe(
      catchError(() => {
        return this.http.get<ViaCepResult>(`https://viacep.com.br/ws/${cleanCep}/json/`);
      })
    );
  }
}
