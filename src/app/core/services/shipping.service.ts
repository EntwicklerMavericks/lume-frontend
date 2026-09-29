import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ShippingOption {
  id: string;
  name: string;
  carrier: string;
  service: string;
  deadline: string;
  price: number;
  originalPrice: number;
  isFree: boolean;
}

export interface ShippingResult {
  origin: {
    postalCode: string;
    street: string;
    city: string;
    state: string;
  };
  destination: {
    postalCode: string;
    city: string;
    state: string;
  };
  freeShippingQualified: boolean;
  freeShippingThreshold: number;
  options: ShippingOption[];
}

export interface StoreSettings {
  id: string;
  storeName: string;
  email: string;
  phone: string;
  postalCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  pacBaseRate: number;
  sedexBaseRate: number;
  freeShippingMin: number;
}

@Injectable({
  providedIn: 'root',
})
export class ShippingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /** CEP informado para cotação */
  currentCep = signal<string>('');

  /** Último resultado de cálculo */
  lastResult = signal<ShippingResult | null>(null);

  /** Opção de frete atualmente selecionada pelo cliente */
  selectedOption = signal<ShippingOption | null>(null);

  /** Valor numérico do frete selecionado */
  shippingCost = computed(() => this.selectedOption()?.price ?? 0);

  /** Indicador de cálculo em andamento */
  isCalculating = signal<boolean>(false);

  /**
   * Consulta as opções de frete disponíveis junto à API
   */
  calculate(destinationCep: string, subtotal: number): Observable<ShippingResult> {
    this.isCalculating.set(true);
    const cleanCep = destinationCep.replace(/\D/g, '');

    return this.http.post<ShippingResult>(`${this.apiUrl}/shipping/calculate`, {
      destinationCep: cleanCep,
      subtotal,
    }).pipe(
      tap({
        next: (res) => {
          this.isCalculating.set(false);
          this.currentCep.set(cleanCep);
          this.lastResult.set(res);

          // Se já havia uma opção selecionada, tenta mantê-la (ex: PAC ou SEDEX)
          const curr = this.selectedOption();
          if (curr) {
            const match = res.options.find(o => o.id === curr.id);
            if (match) {
              this.selectedOption.set(match);
              return;
            }
          }

          // Se não houver seleção anterior, seleciona por padrão a opção mais econômica / gratuita
          if (res.options.length > 0) {
            this.selectedOption.set(res.options[0]);
          }
        },
        error: () => {
          this.isCalculating.set(false);
        }
      })
    );
  }

  /** Seleciona manualmente uma opção de frete */
  selectOption(option: ShippingOption): void {
    this.selectedOption.set(option);
  }

  /** Limpa a cotação e seleção de frete */
  clearShipping(): void {
    this.currentCep.set('');
    this.lastResult.set(null);
    this.selectedOption.set(null);
  }

  /** Obtém configurações de endereço e taxas da loja */
  getStoreSettings(): Observable<StoreSettings> {
    return this.http.get<StoreSettings>(`${this.apiUrl}/settings`);
  }

  /** Atualiza configurações da loja (Painel Admin) */
  updateStoreSettings(settings: Partial<StoreSettings>): Observable<StoreSettings> {
    return this.http.put<StoreSettings>(`${this.apiUrl}/settings`, settings);
  }
}
