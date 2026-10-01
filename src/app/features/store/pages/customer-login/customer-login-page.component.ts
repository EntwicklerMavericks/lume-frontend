import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';

declare const google: any;

@Component({
  selector: 'app-customer-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-login-page.component.html',
  styleUrls: ['./customer-login-page.component.scss']
})
export class CustomerLoginPageComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  activeTab = signal<'login' | 'register'>('login');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  returnUrl = '/';

  // Login form model
  loginEmail = '';
  loginPassword = '';

  // Register form model
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/conta/pedidos';

    // Se já estiver logado, redireciona
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    // Inicializa botão oficial do Google se no browser
    if (isPlatformBrowser(this.platformId)) {
      this.initGoogleAuth();
    }
  }

  setTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  /**
   * Inicializa o Google Identity Services (GSI)
   */
  private initGoogleAuth(): void {
    // Carrega o script do Google se ainda não carregado
    if (typeof google === 'undefined' || !google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => this.renderGoogleButton();
      document.head.appendChild(script);
    } else {
      this.renderGoogleButton();
    }
  }

  private renderGoogleButton(): void {
    try {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        // Tenta renderizar caso exista container
        const btnContainer = document.getElementById('google-btn-container');
        if (btnContainer) {
          google.accounts.id.initialize({
            // Se o usuário configurar o GOOGLE_CLIENT_ID nas envs ele pode injetar
            client_id: '921837482910-dummygoogleclientid.apps.googleusercontent.com',
            callback: (res: any) => this.handleGoogleCredential(res.credential),
          });
          google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: btnContainer.offsetWidth || 340,
          });
        }
      }
    } catch (e) {
      // Ignora falhas de inicialização do script externo
    }
  }

  /**
   * Processa credencial recebida do Google
   */
  handleGoogleCredential(credential: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.loginWithGoogle(credential).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.cartService.syncWithServer();
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Falha ao autenticar com o Google. Tente novamente.');
      }
    });
  }

  /**
   * Simulação de Login Google para testes rápidos e demonstração
   */
  simulateGoogleLogin(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Cria um token JWT simulado para testes caso o cliente Google ainda não esteja aprovado no console do cliente
    const dummyHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const dummyPayload = btoa(JSON.stringify({
      sub: 'google_user_' + Date.now(),
      email: 'cliente.google@lumestore.com.br',
      name: 'Cliente Lume',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      email_verified: true,
      aud: 'google_app',
    }));
    const dummySignature = 'mock_signature';
    const mockToken = `${dummyHeader}.${dummyPayload}.${dummySignature}`;

    this.authService.loginWithGoogle(mockToken).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.cartService.syncWithServer();
        this.router.navigateByUrl(this.returnUrl);
      },
      error: () => {
        // Se a verificação remota no backend falhar porque precisa do Google online, salva sessão localmente
        this.isLoading.set(false);
        this.errorMessage.set('Para login real com o Google, configure o GOOGLE_CLIENT_ID no arquivo .env.');
      }
    });
  }

  onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage.set('Preencha seu e-mail e sua senha.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.cartService.syncWithServer();
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'E-mail ou senha incorretos.');
      }
    });
  }

  onRegister(): void {
    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      this.errorMessage.set('Preencha todos os campos obrigatórios.');
      return;
    }

    if (this.registerPassword.length < 6) {
      this.errorMessage.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.errorMessage.set('As senhas digitadas não coincidem.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register({
      name: this.registerName,
      email: this.registerEmail,
      password: this.registerPassword
    }).subscribe({
      next: () => {
        // Realiza login automático em seguida
        this.authService.login({ email: this.registerEmail, password: this.registerPassword }).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.cartService.syncWithServer();
            this.router.navigateByUrl(this.returnUrl);
          },
          error: () => {
            this.isLoading.set(false);
            this.successMessage.set('Cadastro realizado com sucesso! Faça login abaixo.');
            this.activeTab.set('login');
            this.loginEmail = this.registerEmail;
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Falha ao criar conta. O e-mail já pode estar cadastrado.');
      }
    });
  }
}
