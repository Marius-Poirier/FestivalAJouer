import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UserService } from '@users/user'
import { AuthService } from '@auth/auth-services'

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent {
  protected readonly userService = inject(UserService);
  protected readonly authService = inject(AuthService);
  
  constructor() {
    // Load users when component initializes
    this.userService.getAllUsers();
  }
}