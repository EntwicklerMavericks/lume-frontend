import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { STORE_CONFIG } from '../../../../core/config/store.config';
import { ShippingService } from '../../../../core/services/shipping.service';
import { CheckoutService } from '../../../../core/services/checkout.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private shippingService = inject(ShippingService);
  private checkoutService = inject(CheckoutService);

  logoPreview = signal<string>(STORE_CONFIG.logoUrl);
  saveSuccess = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isLoadingCep = signal<boolean>(false);

  settingsForm: FormGroup = this.fb.group({
    storeName: [STORE_CONFIG.name, Validators.required],
    email: [STORE_CONFIG.email, [Validators.required, Validators.email]],
    phone: [STORE_CONFIG.whatsappFormatted, Validators.required],
    
    // Endereço de Origem (Base de Cálculo de Frete)
    postalCode: ['01310-100', Validators.required],
    street: ['Avenida Paulista', Validators.required],
    number: ['1000', Validators.required],
    complement: ['Andar 10'],
    neighborhood: ['Bela Vista', Validators.required],
    city: ['São Paulo', Validators.required],
    state: ['SP', [Validators.required, Validators.maxLength(2)]],

    // Parâmetros de Frete
    pacBaseRate: [19.90, [Validators.required, Validators.min(0)]],
    sedexBaseRate: [32.90, [Validators.required, Validators.min(0)]],
    freeShippingMin: [299.00, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.shippingService.getStoreSettings().subscribe({
      next: (data) => {
        this.isLoading.set(false);
        if (data) {
          const formattedCep = data.postalCode && data.postalCode.length === 8
            ? `${data.postalCode.slice(0, 5)}-${data.postalCode.slice(5)}`
            : data.postalCode;

          this.settingsForm.patchValue({
            storeName: data.storeName || STORE_CONFIG.name,
            email: data.email || STORE_CONFIG.email,
            phone: data.phone || STORE_CONFIG.whatsappFormatted,
            postalCode: formattedCep,
            street: data.street,
            number: data.number,
            complement: data.complement || '',
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            pacBaseRate: Number(data.pacBaseRate) || 19.90,
            sedexBaseRate: Number(data.sedexBaseRate) || 32.90,
            freeShippingMin: Number(data.freeShippingMin) || 299.00,
          });
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onCepInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    this.settingsForm.patchValue({ postalCode: v }, { emitEvent: false });

    const cleanCep = v.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      this.triggerCepSearch();
    }
  }

  triggerCepSearch(): void {
    const raw = this.settingsForm.get('postalCode')?.value || '';
    const cleanCep = raw.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      this.isLoadingCep.set(true);
      this.checkoutService.lookupCep(cleanCep).subscribe({
        next: (res) => {
          this.isLoadingCep.set(false);
          if (!res.erro) {
            this.settingsForm.patchValue({
              street: res.logradouro || this.settingsForm.get('street')?.value,
              neighborhood: res.bairro || this.settingsForm.get('neighborhood')?.value,
              city: res.localidade || this.settingsForm.get('city')?.value,
              state: res.uf || this.settingsForm.get('state')?.value,
            });
          }
        },
        error: () => this.isLoadingCep.set(false),
      });
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview.set(e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formVal = this.settingsForm.value;

    this.shippingService.updateStoreSettings(formVal).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => {
          this.saveSuccess.set(false);
        }, 3500);
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }
}
