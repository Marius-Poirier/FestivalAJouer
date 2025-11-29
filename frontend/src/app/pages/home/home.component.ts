import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/auth-services';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Verify session on component init
    if (!this.authService.currentUser()) {
      this.authService.whoami();
    }
  }

  protected onLogout(): void {
    this.authService.logout();
    // Navigate to login after logout
    setTimeout(() => {
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
      }
    }, 500);
  }
}