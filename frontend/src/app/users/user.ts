import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { UserDto } from '../types/user-dto';
import { catchError, finalize, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);

  // --- Internal state (signals) ---
  private readonly _users = signal<UserDto[]>([]);
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

    this.http.get<UserDto[]>(
      `${environment.apiUrl}/users`,
      { withCredentials: true }
    ).pipe(
      tap(users => {
        this._users.set(users);
        console.log(`${users.length} utilisateurs chargés`);
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
        return of([]);
      }),
      finalize(() => this._isLoading.set(false))
    ).subscribe();
  }

  // --- Create a new user ---
  createUser(login: string, password: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.post(
      `${environment.apiUrl}/users`,
      { login, password },
      { withCredentials: true }
    ).pipe(
      tap(() => {
        console.log(`Utilisateur ${login} créé avec succès`);
        // Refresh the user list after creation
        this.getAllUsers();
      }),
      catchError((err) => {
        console.error('Erreur lors de la création', err);
        if (err.status === 409) {
          this._error.set('Ce login est déjà utilisé');
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
  getUserById(id: number): UserDto | undefined {
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
}