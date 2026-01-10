import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { TableJeuDto } from '@interfaces/entites/table-jeu-dto'; // À créer si n'existe pas
import { environment } from 'src/environments/environment';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TablesService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiUrl}/tables`;

  private readonly _tables = signal<TableJeuDto[]>([]);
  readonly tables = this._tables.asReadonly()

  private readonly _showform = signal(false)
  readonly showform = this._showform.asReadonly()

  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Récupère une table par son id (GET /api/tables/:id).
   */
  getTableById(tableId: number): Observable<TableJeuDto | null> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<TableJeuDto>(`${this.baseUrl}/${tableId}`, { withCredentials: true })
      .pipe(
        tap(table => {
          if (table) {
            this._tables.update(list => {
              const exists = list.some(t => t.id === tableId);
              return exists ? list.map(t => t.id === tableId ? table : t) : [table, ...list];
            });
          }
        }),
        catchError(err => {
          console.error('Erreur lors du chargement de la table', err);
          this._error.set('Erreur lors du chargement de la table');
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  /**
   * Récupère toutes les tables d'une zone du plan donnée.
   */
  getTablesByZonePlan(zonePlanId: number): Observable<TableJeuDto[]> {
    this._isLoading.set(true);
    this._error.set(null);

    const params = new HttpParams().set('zoneDuPlanId', zonePlanId.toString());
    return this.http.get<TableJeuDto[]>(this.baseUrl, { params, withCredentials: true })
      .pipe(
        map(data => data ?? []),
        tap(data => this._tables.set(data)),
        catchError(err => {
          console.error('Erreur lors du chargement des tables de la zone', err);
          this._error.set('Erreur lors du chargement des tables');
          this._tables.set([]);
          return of([]);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  /**
   * Récupère les tables disponibles (statut "libre") pour une zone du plan.
   */
  getAvailableTablesByZonePlan(zonePlanId: number): Observable<TableJeuDto[]> {
    this._isLoading.set(true);
    this._error.set(null);

    const params = new HttpParams()
      .set('zoneDuPlanId', zonePlanId.toString())
      .set('statut', 'libre');

    console.log('Récupération des tables disponibles avec params:', { zoneDuPlanId: zonePlanId, statut: 'libre' });

    return this.http.get<TableJeuDto[]>(this.baseUrl, { params, withCredentials: true })
      .pipe(
        map(data => data ?? []),
        tap(data => {
          console.log('Tables disponibles reçues:', data);
          this._tables.set(data);
        }),
        catchError(err => {
          console.error('Erreur lors du chargement des tables disponibles', err);
          this._error.set('Erreur lors du chargement des tables disponibles');
          this._tables.set([]);
          return of([]);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  //chargement de toute les tables 
  loadAll(): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.http.get<TableJeuDto[]>(this.baseUrl, {withCredentials:true})
      .pipe(
        tap(data => { this._tables.set(data ?? []) }),
        catchError(err => {
          this._error.set('Erreur lors du chargement des tables');
          this._tables.set([]);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false)),
        catchError(() => of(null))
      )
      .subscribe();
  }


  //ajouter une tables
  add(table: TableJeuDto): void {
    this._isLoading.set(true); 
    this._error.set(null);
    
    this.http.post<{ message: string; table: TableJeuDto }>(this.baseUrl, table, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response?.table) {
            this._tables.update(list => [response.table, ...list]);
            console.log(`Table créée : ${JSON.stringify(response.table)}`);
          } else {
            this._error.set('Erreur lors de la création de la table');
          }
        }),
        catchError((err) => {
          console.error('Erreur HTTP', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant que super organisateur');
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
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
    this._isLoading.set(true);
    this._error.set(null);
    this.http.delete<{ message: string; table: TableJeuDto }>(`${this.baseUrl}/${id}`, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response?.table) {
            this._tables.update(tables => tables.filter(t => t.id !== id));
            console.log(`Table supprimée : ${JSON.stringify(response.table)}`);
          } else {
            this._error.set('Erreur lors de la suppression de la table');
          }
        }),
        catchError((err) => {
          console.error('Erreur HTTP', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant que super organisateur');
          } else if (err?.status === 404) {
            this._error.set('Table non trouvée');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  update(table: Omit<TableJeuDto, 'created_at' | 'updated_at'> & { id: number }): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.put<{ message: string; table: TableJeuDto }>(
      `${this.baseUrl}/${table.id}`, 
      table, 
      { withCredentials: true }
    )
      .pipe(
        tap(response => {
          if (response?.table) {
            this._tables.update(list => 
              list.map(t => t.id === table.id ? response.table : t)
            );
            console.log(`Table mise à jour : ${JSON.stringify(response.table)}`);
          } else {
            this._error.set('Erreur lors de la mise à jour de la table');
          }
        }),
        catchError((err) => {
          console.error('Erreur HTTP', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant que super organisateur');
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 404) {
            this._error.set('Table non trouvée');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  public findById(id: number) {
    return this._tables().find((t) => t.id === id)
  }
}