import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, finalize, Observable, of, tap } from 'rxjs';
import { JeuDto } from '@interfaces/entites/jeu-dto';

@Injectable({
  providedIn: 'root'
})
export class JeuService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/jeux`;

  private readonly _jeux = signal<JeuDto[]>([]);
  readonly jeux = this._jeux.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadAll(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.get<JeuDto[]>(this.baseUrl, { withCredentials: true })
      .pipe(
        tap(data => this._jeux.set(data ?? [])),
        catchError(err => {
          console.error('Erreur lors du chargement des jeux', err);
          this._error.set('Erreur lors du chargement des jeux');
          this._jeux.set([]);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  add(jeu: Partial<JeuDto> & { nom: string }): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.post<{ message: string; jeu: JeuDto }>(this.baseUrl, jeu, {
      withCredentials: true
    })
      .pipe(
        tap(res => {
          if (res?.jeu) {
            this._jeux.update(list => [res.jeu, ...list]);
          } else {
            this._error.set('Erreur lors de l\'ajout du jeu');
          }
        }),
        catchError(err => {
          console.error('Erreur HTTP ajout jeu', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté avec un rôle autorisé');
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 409) {
            this._error.set('Ce jeu existe déjà');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  delete(id: number): void {
    this._error.set(null);

    this.http.delete<{ message: string; jeu: { id: number } }>(
      `${this.baseUrl}/${id}`,
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // On met à jour la liste localement, sans recharger toute la page
        this._jeux.update(list => list.filter(j => j.id !== id));
      }),
      catchError(err => {
        console.error('Erreur lors de la suppression du jeu', err);
        if (err.status === 401) {
          this._error.set('Vous devez être connecté avec le bon rôle pour supprimer un jeu');
        } else if (err.status === 404) {
          this._error.set('Jeu introuvable ou déjà supprimé');
        } else {
          this._error.set('Erreur lors de la suppression du jeu');
        }
        return of(null);
      })
    ).subscribe();
  }

    getById(id: number): Observable<JeuDto> {
    return this.http.get<JeuDto>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }
}
