import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@users/user';
import { AuthService } from '@auth/auth-services';

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

  // Champ de recherche (pour "Tous les utilisateurs")
  protected readonly searchTerm = signal('');

  // Liste filtrée selon la recherche
  protected readonly filteredOtherUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.otherUsers();
    }

    return this.otherUsers().filter(user =>
      user.email.toLowerCase().includes(term)
      // plus tard on pourra filtrer aussi par rôle et statut
    );
  });

  constructor() {
    this.userService.getAllUsers();
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onValidateUser(userId: number, role: string) {
    const finalRole = (role || 'benevole') as any;
    this.userService.validateUser(userId, finalRole);
  }

  onRejectUser(userId: number) {
    this.userService.rejectUser(userId);
  }
}
