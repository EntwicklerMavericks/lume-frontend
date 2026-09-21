import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthCardComponent } from '../../components/auth-card/auth-card.component';
import { AuthInputComponent } from '../../components/auth-input/auth-input.component';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';

// Custom validator to check matching passwords
function matchPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ mustMatch: true });
    return { mustMatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthCardComponent,
    AuthInputComponent,
    AuthButtonComponent
  ],
  standalone: true,
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // States
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Form definition
  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: matchPasswords });

  get passwordValue(): string {
    return this.registerForm.get('password')?.value || '';
  }

  get passwordStrength(): { label: string; class: string; score: number } {
    const val = this.passwordValue;
    if (!val) {
      return { label: '', class: '', score: 0 };
    }
    if (val.length < 8) {
      return { label: 'Fraca (Mínimo de 8 caracteres)', class: 'weak', score: 1 };
    }

    let score = 0;
    if (/[a-zA-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^a-zA-Z0-9]/.test(val)) score++;
    if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;

    if (score <= 2) {
      return { label: 'Média (Adicione letras maiúsculas/símbolos)', class: 'medium', score: 2 };
    } else {
      return { label: 'Forte', class: 'strong', score: 3 };
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { name, email, password } = this.registerForm.value;

    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Cadastro realizado com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Este e-mail já está cadastrado.');
        } else if (err.status === 0) {
          this.errorMessage.set('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
          this.errorMessage.set('Ocorreu um erro ao realizar o cadastro. Tente novamente mais tarde.');
        }
      }
    });
  }
}
