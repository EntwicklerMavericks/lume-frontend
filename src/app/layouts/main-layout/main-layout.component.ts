import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CabecalhoComponent } from '../../shared/components/cabecalho/cabecalho.component';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { AuthService } from '../../core/services/auth.service';
import { STORE_CONFIG } from '../../core/config/store.config';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CabecalhoComponent, MenuComponent],
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private authService = inject(AuthService);

  storeConfig = STORE_CONFIG;

  // Responsive state for sidebar collapsing
  isSidebarCollapsed = signal<boolean>(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(val => !val);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
