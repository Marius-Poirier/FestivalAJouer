import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@users/user';
import { AuthService } from '@auth/auth-services';
import { UserDto } from '../types/user-dto';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent {
  protected readonly userService = inject(UserService);
  protected readonly authService = inject(AuthService);

  // Utilisateurs en attente de validation
  protected readonly pendingUsers = computed(() =>
    this.userService.users().filter(u => u.statut === 'en_attente')
  );

  // Tous les autres (validés ou refusés)
  protected readonly otherUsers = computed(() =>
    this.userService.users().filter(u => u.statut !== 'en_attente')
  );

  constructor() {
    this.userService.getAllUsers();
  }

  onValidateUser(userId: number, role: string) {
    const finalRole = (role || 'benevole') as UserDto['role'];
    this.userService.validateUser(userId, finalRole);
  }

  onRejectUser(userId: number) {
    this.userService.rejectUser(userId);
  }
}
