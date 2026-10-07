import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CabecalhoComponent } from '../../shared/components/cabecalho/cabecalho.component';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { AuthService } from '../../core/services/auth.service';
import { STORE_CONFIG } from '../../core/config/store.config';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CabecalhoComponent, MenuComponent],
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  storeConfig = STORE_CONFIG;

  // Responsive state for sidebar collapsing
  isSidebarCollapsed = signal<boolean>(false);

  // Mobile drawer state
  isMobileDrawerOpen = signal<boolean>(false);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isMobileDrawerOpen.set(false);
      });
  }

  ngOnInit(): void {
    this.themeService.applyTheme();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(val => !val);
  }

  toggleMobileDrawer(): void {
    this.isMobileDrawerOpen.update(val => !val);
  }

  closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
