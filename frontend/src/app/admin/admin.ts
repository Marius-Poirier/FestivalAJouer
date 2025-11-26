import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@users/user';
import { AuthService } from '@auth/auth-services';
import { UtilisateurDto } from '../types/interfaces/entites/utilisateur-dto';
import { RoleUtilisateur } from '../types/enum/role-utilisateur';
import { StatutUtilisateur } from '../types/enum/statut-utilisateur';

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

  protected readonly RoleUtilisateur = RoleUtilisateur;
  protected readonly StatutUtilisateur = StatutUtilisateur;

  // Recherche et filtre
  protected readonly searchTerm = signal('');
  protected readonly roleFilter = signal<'all' | RoleUtilisateur>('all');

  constructor() {
    this.userService.getAllUsers();
  }

  // SECTION : Comptes en attente
  protected readonly pendingUsers = computed(() =>
    this.userService.users().filter(
      (u) => u.statut_utilisateur === StatutUtilisateur.EN_ATTENTE
    )
  );

  // SECTION : Tous les utilisateurs
  protected readonly otherUsers = computed(() =>
    this.userService.users().filter(
      (u) => u.statut_utilisateur !== StatutUtilisateur.EN_ATTENTE
    )
  );

  protected readonly filteredOtherUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const role = this.roleFilter();

    return this.otherUsers().filter((u) => {
      const matchEmail = u.email.toLowerCase().includes(term);
      const matchRole = role === 'all' ? true : u.role.toLowerCase() === role.toLowerCase();
      return matchEmail && matchRole;
    });
  });


  // HANDLERS
  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onRoleFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as RoleUtilisateur | 'all';
    this.roleFilter.set(value);
  }

  onValidateUser(userId: number, role: string) {
    this.userService.validateUser(userId, role as RoleUtilisateur);
  }

  onRejectUser(userId: number) {
    this.userService.rejectUser(userId);
  }
}
