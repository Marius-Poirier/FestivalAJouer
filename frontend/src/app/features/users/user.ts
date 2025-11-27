import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, finalize, of, tap } from 'rxjs';
import { RoleUtilisateur } from '@enum/role-utilisateur';
import { UtilisateurDto } from '@interfaces/entites/utilisateur-dto';
import { StatutUtilisateur } from '@enum/statut-utilisateur';

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
      tap(rows => {
        const normalized = rows.map(raw => this.normalizeUser(raw));
        this._users.set(normalized);
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

  // normalise un user venant du backend
  private normalizeUser(raw: any): UtilisateurDto {
    return {
      id: raw.id,
      email: raw.email,
      role: (raw.role as string)?.toUpperCase() as RoleUtilisateur,
      statut_utilisateur: (raw.statut ?? raw.statut_utilisateur ?? 'EN_ATTENTE').toUpperCase() as StatutUtilisateur,
      date_demande: raw.date_demande ? new Date(raw.date_demande) : undefined,
      valide_par: raw.valide_par ?? undefined,
      email_bloque: !!raw.email_bloque,
      created_at: raw.created_at ? new Date(raw.created_at) : undefined,
      updated_at: raw.updated_at ? new Date(raw.updated_at) : undefined
    };
  }

  // map enum FRONT -> string BACK
  private mapRoleToBackend(role: string): string {
    switch (role as RoleUtilisateur) {
      case RoleUtilisateur.ADMIN:
        return 'admin';
      case RoleUtilisateur.SUPER_ORGANISATEUR:
        return 'super_organisateur';
      case RoleUtilisateur.ORGANISATEUR:
        return 'organisateur';
      case RoleUtilisateur.BENEVOLE:
      default:
        return 'benevole';
    }
  }
}