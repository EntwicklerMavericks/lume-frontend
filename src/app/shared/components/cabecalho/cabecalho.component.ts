import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { STORE_CONFIG } from '../../../core/config/store.config';

@Component({
  selector: 'app-cabecalho',
  imports: [],
  standalone: true,
  templateUrl: './cabecalho.component.html',
  styleUrl: './cabecalho.component.scss'
})
export class CabecalhoComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  storeConfig = STORE_CONFIG;

  currentUser = this.authService.currentUser;

  get breadcrumbs(): string[] {
    const url = this.router.url.split('?')[0];
    const segments = url.split('/').filter(s => !!s && s !== 'admin');
    if (segments.length === 0) {
      return ['Dashboard'];
    }
    
    // Core routes Portuguese label mapping dictionary
    const routeNames: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'products': 'Produtos',
      'categories': 'Categorias',
      'gallery': 'Galeria de Imagens',
      'orders': 'Pedidos',
      'stock': 'Estoque',
      'customers': 'Clientes',
      'settings': 'Configurações'
    };

    return segments.map(seg => routeNames[seg] || seg.charAt(0).toUpperCase() + seg.slice(1));
  }

  get currentSection(): string {
    const crumbs = this.breadcrumbs;
    return crumbs.length > 0 ? crumbs[crumbs.length - 1] : 'Painel';
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'AD';
    const names = user.name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }
}
