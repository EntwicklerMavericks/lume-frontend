import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthCardComponent } from '../../components/auth-card/auth-card.component';
import { AuthInputComponent } from '../../components/auth-input/auth-input.component';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthCardComponent,
    AuthInputComponent,
    AuthButtonComponent
  ],
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // States
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Form definition
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        const queryReturnUrl = this.route.snapshot.queryParams['returnUrl'];
        let targetUrl = queryReturnUrl;

        // Se não houver returnUrl específico ou se for a raiz '/', direciona ADMIN para o painel
        if (!targetUrl || targetUrl === '/') {
          targetUrl = response.user?.role === 'ADMIN' ? '/admin/products' : '/';
        }

        this.router.navigateByUrl(targetUrl);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('E-mail ou senha incorretos.');
        } else if (err.status === 0) {
          this.errorMessage.set('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
          this.errorMessage.set('Ocorreu um erro ao realizar o login. Tente novamente mais tarde.');
        }
      }
    });
  }
}
