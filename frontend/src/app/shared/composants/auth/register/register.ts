import { Component, effect, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth-services';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor() {
    this.auth.resetRegisterSuccess?.();
    effect(() => {
      if (this.auth.registerSuccess()) {
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 3000);
      }
    });
  }

  submit() {
    if (this.form.invalid || this.auth.isLoading()) return;
    const { login, password } = this.form.getRawValue();
    this.auth.register(login, password);
  }

  get loginCtrl() { return this.form.controls.login; }
  get passwordCtrl() { return this.form.controls.password; }
}
