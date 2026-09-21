import { Routes } from '@angular/router';

import { StoreLayoutComponent } from './layouts/store-layout/store-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

import { HomePageComponent } from './features/store/pages/home/home-page.component';
import { CatalogPageComponent } from './features/store/pages/catalog/catalog-page.component';
import { ProductPageComponent } from './features/store/pages/product/product-page.component';
import { CartPageComponent } from './features/store/pages/cart/cart-page.component';

import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';
import { RegisterPageComponent } from './features/auth/pages/register-page/register-page.component';
import { ForgotPasswordPageComponent } from './features/auth/pages/forgot-password-page/forgot-password-page.component';

import { DashboardPageComponent } from './features/dashboard/pages/dashboard-page/dashboard-page.component';
import { ProductsPageComponent } from './features/products/pages/products-page/products-page.component';
import { CategoriesPageComponent } from './features/categories/pages/categories-page/categories-page.component';
import { OrdersPageComponent } from './features/orders/pages/orders-page/orders-page.component';
import { CustomersPageComponent } from './features/customers/pages/customers-page/customers-page.component';
import { GalleryPageComponent } from './features/gallery/pages/gallery-page/gallery-page.component';
import { SettingsPageComponent } from './features/settings/pages/settings-page/settings-page.component';
import { StockPageComponent } from './features/stock/pages/stock-page/stock-page.component';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: StoreLayoutComponent,
    children: [
      { path: '', component: HomePageComponent },
      { path: 'catalogo', component: CatalogPageComponent },
      { path: 'produto/:id', component: ProductPageComponent },
      { path: 'carrinho', component: CartPageComponent }
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginPageComponent },
      { path: 'register', component: RegisterPageComponent },
      { path: 'forgot-password', component: ForgotPasswordPageComponent }
    ]
  },
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: ProductsPageComponent },
      { path: 'categories', component: CategoriesPageComponent },
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'gallery', component: GalleryPageComponent },
      { path: 'orders', component: OrdersPageComponent },
      { path: 'stock', component: StockPageComponent },
      { path: 'customers', component: CustomersPageComponent },
      { path: 'settings', component: SettingsPageComponent }
    ]
  },
  { path: '**', redirectTo: '/' }
];
