import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminProductImage {
  id?: string;
  url: string;
  isMain: boolean;
  order?: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug?: string;
  sku: string;
  description: string;
  price: number;
  promotionalPrice?: number | null;
  pricePromo?: number | null;
  stock: number;
  status: boolean;
  sizes: string[];
  colors: any[];
  gender: string;
  highlight: boolean;
  newLaunch: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  composition?: string;
  fit?: string;
  washCare?: string;
  images: AdminProductImage[];
  createdAt: string;
  updatedAt?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  _count?: {
    products: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminProductsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Listar todos os produtos (incluindo inativos para o admin)
   */
  getProducts(all: boolean = true): Observable<AdminProduct[]> {
    return this.http.get<AdminProduct[]>(`${this.apiUrl}/products`, {
      params: all ? { all: 'true' } : {},
    });
  }

  /**
   * Obter produto por ID
   */
  getProductById(id: string): Observable<AdminProduct> {
    return this.http.get<AdminProduct>(`${this.apiUrl}/products/${id}`);
  }

  /**
   * Criar novo produto
   */
  createProduct(productData: Partial<AdminProduct>): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(`${this.apiUrl}/products`, productData);
  }

  /**
   * Atualizar produto existente
   */
  updateProduct(id: string, productData: Partial<AdminProduct>): Observable<AdminProduct> {
    return this.http.patch<AdminProduct>(`${this.apiUrl}/products/${id}`, productData);
  }

  /**
   * Alternar status ativo/inativo do produto
   */
  toggleProductStatus(id: string): Observable<AdminProduct> {
    return this.http.patch<AdminProduct>(`${this.apiUrl}/products/${id}/toggle-status`, {});
  }

  /**
   * Excluir produto
   */
  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/products/${id}`);
  }

  /**
   * Listar todas as categorias
   */
  getCategories(): Observable<AdminCategory[]> {
    return this.http.get<AdminCategory[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Criar nova categoria
   */
  createCategory(categoryData: Partial<AdminCategory>): Observable<AdminCategory> {
    return this.http.post<AdminCategory>(`${this.apiUrl}/categories`, categoryData);
  }

  /**
   * Atualizar categoria existente
   */
  updateCategory(id: string, categoryData: Partial<AdminCategory>): Observable<AdminCategory> {
    return this.http.patch<AdminCategory>(`${this.apiUrl}/categories/${id}`, categoryData);
  }

  /**
   * Excluir categoria
   */
  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/categories/${id}`);
  }
}
