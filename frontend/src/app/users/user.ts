import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, finalize, of, tap } from 'rxjs';
import { RoleUtilisateur } from '../types/enum/role-utilisateur';
import { UtilisateurDto } from '../types/interfaces/entites/utilisateur-dto';
import { StatutUtilisateur } from '../types/enum/statut-utilisateur';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);

  // --- Internal state (signals) ---
  private readonly _users = signal<UtilisateurDto[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  // --- Exposed state (readonly, computed) ---
  readonly users = this._users.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // --- Fetch all users (admin only) ---
  getAllUsers(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.get<any[]>(
      `${environment.apiUrl}/users`,
      { withCredentials: true }
    ).pipe(
      tap(rawUsers => {
        const normalized: UtilisateurDto[] = rawUsers.map(u => ({
          ...u,

          // normalisation du rôle du backend -> enum Angular
          role: (u.role as string).toUpperCase() as RoleUtilisateur,

          // conversion backend `statut` -> frontend `statut_utilisateur`
          // en uppercase car ton enum est en majuscules
          statut_utilisateur: (u.statut as string).toUpperCase() as StatutUtilisateur,
        }));

        this._users.set(normalized);
        console.log(`${normalized.length} utilisateurs chargés`);
      }),

      catchError((err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);

        if (err.status === 403) {
          this._error.set('Accès refusé : privilèges administrateur requis');
        } else if (err.status === 401) {
          this._error.set('Session expirée, veuillez vous reconnecter');
        } else if (err.status === 0) {
          this._error.set('Serveur injoignable');
        } else {
          this._error.set(`Erreur serveur (${err.status})`);
        }

        this._users.set([]);
        return of<UtilisateurDto[]>([]);
      }),

      finalize(() => this._isLoading.set(false))
    )
    .subscribe();
  }

  // --- Create a new user (admin) ---
  createUser(email: string, password: string, role: RoleUtilisateur = RoleUtilisateur.BENEVOLE): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.post<UtilisateurDto>(
      `${environment.apiUrl}/users`,
      { email, password, role },
      { withCredentials: true }
    ).pipe(
      tap((created) => {
        console.log(`Utilisateur ${created.email} créé avec succès`);
        // Refresh the user list after creation
        this.getAllUsers();
      }),
      catchError((err) => {
        console.error('Erreur lors de la création', err);
        if (err.status === 409) {
          this._error.set('Cet email est déjà utilisé');
        } else if (err.status === 400) {
          this._error.set('Données invalides');
        } else {
          this._error.set(`Erreur serveur (${err.status})`);
        }
        return of(null);
      }),
      finalize(() => this._isLoading.set(false))
    ).subscribe();
  }

  // --- Get a user by ID (helper method) ---
  getUserById(id: number): UtilisateurDto | undefined {
    return this._users().find(user => user.id === id);
  }

  // --- Clear error ---
  clearError(): void {
    this._error.set(null);
  }

  // --- Reset state ---
  reset(): void {
    this._users.set([]);
    this._error.set(null);
    this._isLoading.set(false);
  }

  // --- Valider la création de compte d'un user ---
  validateUser(id: number, role: RoleUtilisateur | string = RoleUtilisateur.BENEVOLE): void {
    this._isLoading.set(true);
    this._error.set(null);

    const backendRole = this.mapRoleToBackend(role);

    this.http.patch<UtilisateurDto>(
      `${environment.apiUrl}/users/${id}/validate`,
      { role: backendRole },
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // Après validation, on recharge la liste complète
        this.getAllUsers();
      }),
      catchError(err => {
        console.error('Erreur lors de la validation du compte', err);
        this._error.set('Impossible de valider ce compte');
        return of(null);
      }),
      finalize(() => this._isLoading.set(false))
    ).subscribe();
  }

  // --- Refuser la création de compte d'un user ---
  rejectUser(id: number): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.patch<UtilisateurDto>(
      `${environment.apiUrl}/users/${id}/reject`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // Après refus, on recharge la liste complète
        this.getAllUsers();
      }),
      catchError(err => {
        console.error('Erreur lors du refus du compte', err);
        this._error.set('Impossible de refuser ce compte');
        return of(null);
      }),
      finalize(() => this._isLoading.set(false))
    ).subscribe();
  }

  // --- Modifier le rôle d'un user ---
  updateUserRole(id: number, role: RoleUtilisateur | string): void {
    this._isLoading.set(true);
    this._error.set(null);

    const backendRole = this.mapRoleToBackend(role);

    this.http.patch<UtilisateurDto>(
      `${environment.apiUrl}/users/${id}/role`,
      { role: backendRole },
      { withCredentials: true }
    )
    .pipe(
      tap(updatedUser => {
        if (updatedUser) {
          this._users.update(users =>
            users.map(u => (u.id === updatedUser.id ? updatedUser : u))
          );
        }
      }),
      catchError(err => {
        console.error('Erreur lors de la mise à jour du rôle', err);
        this._error.set('Impossible de mettre à jour le rôle');
        return of(null);
      }),
      finalize(() => this._isLoading.set(false))
    )
    .subscribe();
  }

  // Convertir un rôle en string pour le back
  private mapRoleToBackend(role: RoleUtilisateur | string | undefined): string {
    if (!role) return 'benevole';

    switch (role) {
      case RoleUtilisateur.ADMIN:
        return 'admin';
      case RoleUtilisateur.SUPER_ORGANISATEUR:
        return 'super_organisateur';
      case RoleUtilisateur.ORGANISATEUR:
        return 'organisateur';
      case RoleUtilisateur.BENEVOLE:
        return 'benevole';
      default:
        return (role as string).toLowerCase();
    }
  }
}