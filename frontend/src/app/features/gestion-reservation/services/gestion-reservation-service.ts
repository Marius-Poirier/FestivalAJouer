import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap, forkJoin, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReservationTableDto } from '@interfaces/entites/reservation-table-dto';
import { AuthService } from '@core/services/auth-services';
import { TableJeuDto } from '@interfaces/entites/table-jeu-dto';
import { TablesService } from '@tables/services/tables-service';
import { ReservationsService } from '@reservations/services/reservations-service';

@Injectable({
  providedIn: 'root'
})
export class GestionReservationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reservation-tables`;
  private readonly authService = inject(AuthService);
  private readonly reservationsvc = inject(ReservationsService)
  private readonly tablesService = inject(TablesService);

  private readonly _reservationTables = signal<ReservationTableDto[]>([]);
  readonly reservationTables = this._reservationTables.asReadonly();

  private readonly  _tables = signal<TableJeuDto[]>([]);
  readonly tables = this._tables.asReadonly()

  private readonly _showform = signal(false);
  readonly showform = this._showform.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  public reservation = this.reservationsvc.reservation


  findByReservationId(reservationId: number): ReservationTableDto[] {
    return this._reservationTables().filter(rt => rt.reservation_id === reservationId);
  }

  /**
   * Charge les détails complets de toutes les tables liées à une réservation
   */
  loadTableDetailsForReservation(reservationId: number): Observable<TableJeuDto[]> {
    this._isLoading.set(true);
    this._error.set(null);

    const params = new HttpParams().set('reservationId', reservationId.toString());

    // D'abord charger les liens reservation-tables
    return this.http.get<ReservationTableDto[]>(this.baseUrl, { params, withCredentials: true })
      .pipe(
        // Ensuite charger les détails de chaque table
        switchMap(links => {
          this._reservationTables.set(links ?? []);
          const tableIds = links.map(rt => rt.table_id);
          
          if (!tableIds.length) {
            return of([]);
          }
          
          const requests = tableIds.map(id =>
            this.tablesService.getTableById(id).pipe(catchError(() => of(null)))
          );
          
          return forkJoin(requests);
        }),
        map(tables => tables.filter((t): t is TableJeuDto => t !== null)),
        tap(tables => {
          console.log('Détails des tables pour la réservation chargés:', tables);
          this._tables.set(tables);
        }),
        catchError(err => {
          console.error('Erreur lors du chargement des tables de réservation', err);
          this._error.set('Erreur lors du chargement des tables');
          this._tables.set([]);
          return of([]);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

 
  //Charger les tables de la reservation
  loadAllTables(reservationId: number): void {
    this._isLoading.set(true);
    this._error.set(null);

    const params = new HttpParams().set('reservationId', reservationId.toString());

    this.http.get<ReservationTableDto[]>(this.baseUrl, { params, withCredentials: true })
      .pipe(
        tap(data => this._reservationTables.set(data ?? [])),
        catchError(err => {
          console.error('Erreur lors du chargement des tables de réservation', err);
          this._error.set('Erreur lors du chargement des tables de réservation');
          this._reservationTables.set([]);

          return of(null);
        }),
        finalize(() => this._isLoading.set(false)),
        catchError(() => of(null))
      )
      .subscribe();
  }

  addTable(reservationId: number, tableId: number): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this._error.set('Vous devez être connecté en tant qu\'organisateur');
      return;
    }

    this._isLoading.set(true);
    this._error.set(null);

    const payload = { reservation_id: reservationId, table_id: tableId };

    this.http.post<{ message: string; affectation: ReservationTableDto }>(this.baseUrl, payload, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response?.affectation) {
            this._reservationTables.update(list => [response.affectation, ...list]);
            console.log(`Table attribuée : ${JSON.stringify(response.affectation)}`);
          } else {
            this._error.set('Erreur lors de l\'ajout de la réservation de table');
          }
        }),
        switchMap(response => {
          if (response?.affectation) {
            return this.tablesService.getTableById(tableId).pipe(
              tap(table => {
                if (table) {
                  this._tables.update(list => [table, ...list]);
                }
              }),
              catchError(() => of(null))
            );
          }
          return of(null);
        }),
        catchError((err) => {
          console.error('Erreur HTTP', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant qu\'organisateur');
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 409) {
            this._error.set('Cette table est déjà attribuée à cette réservation');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false)),
        catchError(() => of(null))
      )
      .subscribe();
  }

  deleteTable(reservationId: number, tableId: number): void {
    this._isLoading.set(true);
    this._error.set(null);

    const body = { reservation_id: reservationId, table_id: tableId };

    this.http.delete<{ message: string; affectation: ReservationTableDto }>(
      this.baseUrl,
      { body, withCredentials: true }
    )
      .pipe(
        tap(response => {
          if (response?.affectation) {
            this._reservationTables.update(rt =>
              rt.filter(r => !(r.reservation_id === reservationId && r.table_id === tableId))
            );
            console.log(`Réservation de table supprimée : ${JSON.stringify(response.affectation)}`);
          } else {
            this._error.set('Erreur lors de la suppression de la réservation de table');
          }
        }),
        catchError((err) => {
          console.error('Erreur HTTP', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant qu\'organisateur');
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 404) {
            this._error.set('Réservation de table non trouvée');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false)),
        catchError(() => of(null))
      )
      .subscribe();
  }
}

//=========  gestion des jeux  
