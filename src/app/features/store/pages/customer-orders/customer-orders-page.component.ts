import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerOrder, CustomerOrdersService } from '../../../../core/services/customer-orders.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-customer-orders-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './customer-orders-page.component.html',
  styleUrls: ['./customer-orders-page.component.scss']
})
export class CustomerOrdersPageComponent implements OnInit {
  public authService = inject(AuthService);
  private ordersService = inject(CustomerOrdersService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  orders = signal<CustomerOrder[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  selectedFilter = signal<'ALL' | 'PENDING' | 'SHIPPED' | 'DELIVERED'>('ALL');

  // Modal para exibir PIX Copia e Cola
  activePixOrder = signal<CustomerOrder | null>(null);
  copiedPix = signal<boolean>(false);

  // Modal para Edição de Perfil
  isProfileModalOpen = signal<boolean>(false);
  isSavingProfile = signal<boolean>(false);
  profileSuccess = signal<string>('');
  profileError = signal<string>('');

  editName = signal<string>('');
  editPhone = signal<string>('');
  editAvatar = signal<string>('');
  tempAvatarUrl = signal<string>('');
  activeAvatarTab = signal<'upload' | 'url'>('upload');

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/conta/login'], { queryParams: { returnUrl: '/conta/pedidos' } });
      return;
    }

    this.loadOrders();

    this.route.queryParams.subscribe(params => {
      if (params['editar'] === 'true' || params['editProfile'] === 'true') {
        this.openProfileModal();
      }
    });
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.ordersService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
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

  // --- Gerenciamento de Perfil ---
  openProfileModal(): void {
    const user = this.authService.currentUser();
    this.editName.set(user?.name || '');
    this.editPhone.set(user?.phone || '');
    this.editAvatar.set(user?.avatar || '');
    this.tempAvatarUrl.set(user?.avatar || '');
    this.profileSuccess.set('');
    this.profileError.set('');
    this.isProfileModalOpen.set(true);
  }

  closeProfileModal(): void {
    this.isProfileModalOpen.set(false);
    this.profileSuccess.set('');
    this.profileError.set('');
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '');
    if (digits.length > 11) digits = digits.slice(0, 11);

    let formatted = digits;
    if (digits.length > 10) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 6) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }

    input.value = formatted;
    this.editPhone.set(formatted);
  }

  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.profileError.set('Por favor, selecione uma imagem válida (JPG, PNG ou WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.profileError.set('A imagem não pode ultrapassar 5MB.');
      return;
    }

    this.profileError.set('');
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const dataUrl = e.target?.result as string;
      this.resizeAndSetAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  private resizeAndSetAvatar(dataUrl: string): void {
    const img = new Image();
    img.onload = () => {
      const maxDim = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        this.editAvatar.set(compressed);
      } else {
        this.editAvatar.set(dataUrl);
      }
    };
    img.onerror = () => {
      this.editAvatar.set(dataUrl);
    };
    img.src = dataUrl;
  }

  removeAvatar(): void {
    this.editAvatar.set('');
    this.tempAvatarUrl.set('');
  }

  applyAvatarUrl(): void {
    const url = this.tempAvatarUrl().trim();
    if (url) {
      this.editAvatar.set(url);
    }
  }

  saveProfile(): void {
    const name = this.editName().trim();
    if (!name || name.length < 2) {
      this.profileError.set('Por favor, informe seu nome completo.');
      return;
    }

    this.isSavingProfile.set(true);
    this.profileError.set('');
    this.profileSuccess.set('');

    this.authService.updateProfile({
      name,
      phone: this.editPhone().trim() || null,
      avatar: this.editAvatar().trim() || null,
    }).subscribe({
      next: () => {
        this.isSavingProfile.set(false);
        this.profileSuccess.set('Perfil atualizado com sucesso!');
        setTimeout(() => {
          this.closeProfileModal();
        }, 1200);
      },
      error: (err) => {
        this.isSavingProfile.set(false);
        const msg = err?.error?.message || 'Erro ao atualizar perfil. Verifique os dados e tente novamente.';
        this.profileError.set(msg);
      }
    });
  }
}
