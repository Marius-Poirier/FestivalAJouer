import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth-services';
import { Router, RouterLink } from '@angular/router';
import { routes } from 'src/app/app.routes';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router)

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
