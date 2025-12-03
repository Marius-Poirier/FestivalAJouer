import { Component, inject, signal } from '@angular/core';
import { AuthService } from '@core/services/auth-services';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { routes } from 'src/app/app.routes';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router)
  protected currentRoute = signal<string>('');
  protected menuOpen = signal<boolean>(false);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.url);
      });
    this.currentRoute.set(this.router.url);
    this.menuOpen.set(false);
  }

  protected isActive(route: string): boolean {
    const result = this.currentRoute() === route;
    return result;
  }

  // protected toggleMenu(): void {
  //   this.menuOpen.update(f => !f);
  // }

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
