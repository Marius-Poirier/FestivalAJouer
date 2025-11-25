import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/auth-services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Local component state
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Reactive form
  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Veuillez remplir tous les champs correctement');
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(email, password);

    // Poll auth state changes to detect success/error
    const checkAuthState = setInterval(() => {
      if (!this.authService.isLoading()) {
        clearInterval(checkAuthState);
        this.isSubmitting.set(false);

        if (this.authService.isLoggedIn()) {
          // Success: navigate to home
          this.router.navigate(['/home']);
        } else if (this.authService.error()) {
          // Error: display message from service
          this.errorMessage.set(this.authService.error());
        }
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (this.isSubmitting()) {
        clearInterval(checkAuthState);
        this.isSubmitting.set(false);
        this.errorMessage.set('Le serveur met trop de temps à répondre');
      }
    }, 10000);
  }

  protected get loginControl() {
    return this.loginForm.controls.email;
  }

  protected get passwordControl() {
    return this.loginForm.controls.password;
  }
}