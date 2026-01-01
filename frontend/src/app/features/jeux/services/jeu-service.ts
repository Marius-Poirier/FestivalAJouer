import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, finalize, of, tap, switchMap } from 'rxjs';
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

    this.http.post<{ message: string; jeu: { id: number } }>(this.baseUrl, jeu, {
      withCredentials: true
    })
      .pipe(
        switchMap(res => {
          if (!res?.jeu?.id) {
            this._error.set('Erreur lors de l\'ajout du jeu');
            return of(null);
          }
          // 👉 on recharge le jeu complet
          return this.http.get<JeuDto>(`${this.baseUrl}/${res.jeu.id}`, {
            withCredentials: true
          });
        }),
        tap(fullJeu => {
          if (fullJeu) {
            this._jeux.update(list => [fullJeu, ...list]);
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

  update(jeu: JeuDto): void {
    if (jeu.id == null) return;

    this._isLoading.set(true);
    this._error.set(null);

    this.http.put<{ message: string; jeu: { id: number } }>(
      `${this.baseUrl}/${jeu.id}`,
      jeu,
      { withCredentials: true }
    )
      .pipe(
        switchMap(res => {
          if (!res?.jeu?.id) {
            this._error.set('Erreur lors de la mise à jour du jeu');
            return of(null);
          }
          // 👉 on recharge le jeu complet (avec éditeurs, mécas, type, etc.)
          return this.http.get<JeuDto>(`${this.baseUrl}/${res.jeu.id}`, {
            withCredentials: true
          });
        }),
        tap(fullJeu => {
          if (fullJeu) {
            this._jeux.update(list =>
              list.map(j => j.id === fullJeu.id ? fullJeu : j)
            );
          }
        }),
        catchError(err => {
          console.error('Erreur HTTP update jeu', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté avec un rôle autorisé');
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 404) {
            this._error.set('Jeu non trouvé');
          } else if (err?.status === 409) {
            this._error.set('Un jeu avec ce nom existe déjà');
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

  getById(id: number) {
    return this.http.get<JeuDto>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  findByIdLocal(id: number): JeuDto | undefined {
    return this._jeux().find(j => j.id === id);
  }
}
