import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  private readonly TOKEN_KEY = 'sales_sys_token';
  private readonly REFRESH_TOKEN_KEY = 'sales_sys_refresh_token';
  private readonly USER_KEY = 'sales_sys_user';
  private readonly API_URL = environment.apiUrl;

  // Modern Angular Signals for reactive state
  public currentUser = signal<User | null>(null);
  public token = signal<string | null>(null);
  public isAuth = signal<boolean>(false);

  constructor() {
    this.initializeAuthState();
  }

  /**
   * Initializes state from localStorage if running in the browser context (SSR safe)
   */
  private initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedToken = localStorage.getItem(this.TOKEN_KEY);
      const savedUser = localStorage.getItem(this.USER_KEY);

      if (savedToken && savedUser) {
        try {
          this.token.set(savedToken);
          this.currentUser.set(JSON.parse(savedUser));
          this.isAuth.set(true);
        } catch (e) {
          this.clearSession();
        }
      }
    }
  }

  /**
   * Sends Login request and saves session on success
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((response) => this.saveSession(response))
    );
  }

  /**
   * Sends Register request
   */
  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/register`, userData);
  }

  /**
   * Sends Forgot Password request
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/forgot-password`, { email });
  }

  /**
   * Clear auth state and redirect to login
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuth();
  }

  /**
   * Retrieves access token
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Saves credentials in localStorage and updates signals
   */
  private saveSession(response: LoginResponse): void {
    this.token.set(response.accessToken);
    this.currentUser.set(response.user);
    this.isAuth.set(true);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
      }
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    }
  }

  /**
   * Clears state from signals and localStorage
   */
  private clearSession(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.isAuth.set(false);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }
}
