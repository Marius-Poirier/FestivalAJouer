import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from 'src/app/core/services/auth-services';
import { FestivalService } from '@festivals/services/festival-service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, MatIconModule, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly festivalssvc = inject(FestivalService)
  protected readonly festival = this.festivalssvc.lastFestival

  ngOnInit(): void {
    if (!this.authService.currentUser()) {
      this.authService.whoami();
    }
  }

  protected onLogout(): void {
    this.authService.logout();
    setTimeout(() => {
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
      }
    }, 500);
  }


}