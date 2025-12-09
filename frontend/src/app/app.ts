import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth-services';
import { Header } from '@sharedComponent/header/header';
import { Footer } from '@sharedComponent/footer/footer';
import { FestivalSelector } from '@festivals/components/festival-selector/festival-selector';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, Header, Footer, FestivalSelector],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly authService = inject(AuthService);

  constructor() {
    this.authService.whoami();
  }
}
