import { Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
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
export class CustomerLoginPageComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  activeTab = signal<'login' | 'register' | 'forgot'>('login');
  forgotStep = signal<'request' | 'reset'>('request');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  returnUrl = '/';

  // Cooldown de reenvio de código (segurança anti-flood)
  resendCooldown = signal<number>(0);
  private cooldownTimer: any = null;

  // Login form model
  loginEmail = '';
  loginPassword = '';

  // Register form model
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  // Forgot / Reset form model
  forgotEmail = '';
  resetCode = '';
  newPassword = '';
  confirmNewPassword = '';

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

  ngOnDestroy(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }

  setTab(tab: 'login' | 'register' | 'forgot'): void {
    this.activeTab.set(tab);
    if (tab === 'forgot') {
      this.forgotStep.set('request');
      if (this.loginEmail && !this.forgotEmail) {
        this.forgotEmail = this.loginEmail;
      }
    }
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  openForgotPassword(): void {
    this.activeTab.set('forgot');
    this.forgotStep.set('request');
    this.forgotEmail = this.loginEmail || '';
    this.resetCode = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  startCooldown(seconds: number = 60): void {
    this.resendCooldown.set(seconds);
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
    this.cooldownTimer = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        this.resendCooldown.set(0);
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }

  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '');
    if (digits.length > 6) digits = digits.slice(0, 6);
    input.value = digits;
    this.resetCode = digits;
  }

  onRequestResetCode(): void {
    const email = this.forgotEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      this.errorMessage.set('Informe um e-mail válido para receber o código.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.forgotPassword(email).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res?.cooldown) {
          this.errorMessage.set(res.message);
          if (res.remainingSeconds) {
            this.startCooldown(res.remainingSeconds);
          }
          return;
        }
        this.forgotStep.set('reset');
        this.startCooldown(60);
        this.successMessage.set(res?.message || 'Código de verificação de 6 dígitos enviado para seu e-mail!');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Não foi possível enviar o código. Tente novamente.');
      }
    });
  }

  onResendCode(): void {
    if (this.resendCooldown() > 0 || this.isLoading()) return;
    this.onRequestResetCode();
  }

  onResetPassword(): void {
    const cleanCode = this.resetCode.replace(/\D/g, '').trim();
    if (cleanCode.length !== 6) {
      this.errorMessage.set('Por favor, informe o código de 6 dígitos recebido por e-mail.');
      return;
    }

    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage.set('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage.set('As senhas digitadas não coincidem.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.resetPassword({
      email: this.forgotEmail.trim().toLowerCase(),
      code: cleanCode,
      password: this.newPassword
    }).subscribe({
      next: (res: any) => {
        this.successMessage.set(res?.message || 'Senha alterada com sucesso! Entrando na sua conta...');
        // Login automático com a nova senha para conveniência e segurança
        this.authService.login({ email: this.forgotEmail.trim().toLowerCase(), password: this.newPassword }).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.cartService.syncWithServer();
            this.router.navigateByUrl(this.returnUrl);
          },
          error: () => {
            this.isLoading.set(false);
            this.activeTab.set('login');
            this.loginEmail = this.forgotEmail;
            this.loginPassword = '';
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Código inválido ou expirado. Tente novamente.');
      }
    });
  }

  /**
   * Inicializa o Google Identity Services (GSI)
   */
  private initGoogleAuth(): void {
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
        const btnContainer = document.getElementById('google-btn-container');
        if (btnContainer) {
          google.accounts.id.initialize({
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
    } catch (_) {
      // Ignora falhas de inicialização do script externo
    }
  }

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

  simulateGoogleLogin(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

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
