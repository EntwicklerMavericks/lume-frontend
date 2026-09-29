import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, switchMap, map } from 'rxjs';
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

    // Consulta ViaCEP diretamente para obter a localidade exata do comprador (ex: Barueri, Sorocaba, Salvador)
    return this.http.get<any>(`https://viacep.com.br/ws/${cleanCep}/json/`).pipe(
      catchError(() => of(null)),
      switchMap((viaData) => {
        const destCity = viaData && !viaData.erro && viaData.localidade ? viaData.localidade : undefined;
        const destState = viaData && !viaData.erro && viaData.uf ? viaData.uf : undefined;

        return this.http.post<ShippingResult>(`${this.apiUrl}/shipping/calculate`, {
          destinationCep: cleanCep,
          subtotal,
          destinationCity: destCity,
          destinationState: destState,
        }).pipe(
          map((res) => {
            // Garante que a cidade real de entrega é exibida com precisão
            if (destCity) {
              res.destination.city = destCity;
              if (destState) res.destination.state = destState;
            }
            return res;
          }),
          catchError(() => {
            // Fallback inteligente se o backend não estiver em execução
            const isFree = subtotal >= 299;
            const fallback: ShippingResult = {
              origin: {
                postalCode: '',
                street: '',
                city: 'Loja',
                state: 'Origem',
              },
              destination: {
                postalCode: `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`,
                city: destCity || 'Destino',
                state: destState || 'BR',
              },
              freeShippingQualified: isFree,
              freeShippingThreshold: 299,
              options: [
                {
                  id: 'pac',
                  name: 'PAC Correios (Econômico)',
                  carrier: 'Correios Brasil',
                  service: 'PAC',
                  deadline: '3 a 5 dias úteis',
                  price: isFree ? 0 : 19.90,
                  originalPrice: 19.90,
                  isFree,
                },
                {
                  id: 'sedex',
                  name: 'SEDEX Correios (Expresso)',
                  carrier: 'Correios Brasil',
                  service: 'SEDEX',
                  deadline: '1 a 2 dias úteis',
                  price: 32.90,
                  originalPrice: 32.90,
                  isFree: false,
                },
              ],
            };
            return of(fallback);
          })
        );
      }),
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
