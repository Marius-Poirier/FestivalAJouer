import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, effect } from '@angular/core';
import { environment } from 'src/environments/environment';
import { EditeurDto } from '@interfaces/entites/editeur-dto';
import { catchError, finalize, of, tap } from 'rxjs';
import { JeuDto } from '@interfaces/entites/jeu-dto';
import { CurrentFestival } from '@core/services/current-festival';

@Injectable({
  providedIn: 'root'
})
export class EditeurService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/editeurs`;
  private readonly currentFest = inject(CurrentFestival);

  public readonly currentFestival = this.currentFest.currentFestival;

  private readonly _editeurs = signal<EditeurDto[]>([]);
  readonly editeurs = this._editeurs.asReadonly();

  private readonly _showForm = signal(false);
  readonly showForm = this._showForm.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    // Recharger automatiquement les éditeurs du festival quand le festival change
    effect(() => {
      const festival = this.currentFestival();
      if (festival?.id) {
        console.log('Festival changé, rechargement des éditeurs pour:', festival.nom);
        this.loadForCurrentFestival();
      }
    });
  }

  /**
   * GET /api/editeurs?search=...
   */
  loadAll(search?: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    let params = new HttpParams();
    if (search && search.trim().length > 0) {
      params = params.set('search', search.trim());
    }

    this.http.get<EditeurDto[]>(this.baseUrl, {
      withCredentials: true,
      params
    })
      .pipe(
        tap(data => this._editeurs.set(data ?? [])),
        catchError(err => {
          console.error('Erreur lors du chargement des éditeurs', err);
          this._error.set('Erreur lors du chargement des éditeurs');
          this._editeurs.set([]);
          return of([] as EditeurDto[]);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  /**
   * POST /api/editeurs
   * body: { nom }
   * réponse: { message, editeur }
   */
  add(editeur: Pick<EditeurDto, 'nom'>): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.post<{ message: string; editeur: EditeurDto }>(
      this.baseUrl,
      editeur,
      { withCredentials: true }
    )
      .pipe(
        tap(response => {
          if (response?.editeur) {
            this._editeurs.update(list => [response.editeur, ...list]);
            console.log('Éditeur ajouté :', response.editeur);
          } else {
            this._error.set('Erreur lors de l’ajout de l’éditeur');
          }
        }),
        catchError(err => {
          console.error('Erreur HTTP (add éditeur)', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant qu’organisateur');
          } else if (err?.status === 400) {
            this._error.set('Le nom est requis');
          } else if (err?.status === 409) {
            this._error.set('Ce nom d’éditeur existe déjà');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  /**
   * GET /api/editeurs?festivalId=<current>&search=...
   * Charge les éditeurs ayant au moins une réservation sur le festival courant
   */
  loadForCurrentFestival(search?: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    const festival = this.currentFest.currentFestival();
    const festivalId = festival?.id;

    if (!festivalId) {
      this._isLoading.set(false);
      this._editeurs.set([]);
      this._error.set('Aucun festival courant défini');
      return;
    }

    let params = new HttpParams().set('festivalId', String(festivalId));
    if (search && search.trim().length > 0) {
      params = params.set('search', search.trim());
    }

    this.http.get<EditeurDto[]>(this.baseUrl, {
      withCredentials: true,
      params
    })
      .pipe(
        tap(data => this._editeurs.set(data ?? [])),
        catchError(err => {
          console.error('Erreur lors du chargement des éditeurs du festival courant', err);
          this._error.set('Erreur lors du chargement des éditeurs');
          this._editeurs.set([]);
          return of([] as EditeurDto[]);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  /**
   * PUT /api/editeurs/:id
   * body: { nom }
   * réponse: { message, editeur }
   */
  update(id: number, nom: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.put<{ message: string; editeur: EditeurDto }>(
      `${this.baseUrl}/${id}`,
      { nom },
      { withCredentials: true }
    )
      .pipe(
        tap(response => {
          if (response?.editeur) {
            this._editeurs.update(list =>
              list.map(e => e.id === response.editeur.id ? response.editeur : e)
            );
            console.log('Éditeur mis à jour :', response.editeur);
          } else {
            this._error.set('Erreur lors de la mise à jour de l’éditeur');
          }
        }),
        catchError(err => {
          console.error('Erreur HTTP (update éditeur)', err);
          if (err?.status === 400) {
            this._error.set('Le nom est requis');
          } else if (err?.status === 404) {
            this._error.set('Éditeur non trouvé');
          } else if (err?.status === 409) {
            this._error.set('Ce nom d’éditeur existe déjà');
          } else {
            this._error.set('Erreur lors de la mise à jour de l’éditeur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  /**
   * DELETE /api/editeurs/:id
   * réponse: { message, editeur }
   */
  delete(id: number): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.delete<{ message: string; editeur: { id: number; nom: string } }>(
      `${this.baseUrl}/${id}`,
      { withCredentials: true }
    )
      .pipe(
        tap(() => {
          this._editeurs.update(list => list.filter(e => e.id !== id));
          console.log('Éditeur supprimé :', id);
        }),
        catchError(err => {
          console.error('Erreur HTTP (delete éditeur)', err);
          if (err?.status === 404) {
            this._error.set('Éditeur non trouvé');
          } else {
            this._error.set('Erreur lors de la suppression de l’éditeur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  // Recherche locale dans les données déjà chargées
  findByIdLocal(id: number): EditeurDto | undefined {
    return this._editeurs().find(e => e.id === id);
  }

  // gestion affichage formulaire

  toggleForm(): void {
    this._showForm.update(v => !v);
  }

  showFormModal(): void {
    this._showForm.set(true);
  }

  closeForm(): void {
    this._showForm.set(false);
  }

  loadOne(id: number) {
    return this.http.get<EditeurDto>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  getJeuxForEditeur(editeurId: number) {
    return this.http.get<JeuDto[]>(`${this.baseUrl}/${editeurId}/jeux`,{ withCredentials: true });
  }
}
