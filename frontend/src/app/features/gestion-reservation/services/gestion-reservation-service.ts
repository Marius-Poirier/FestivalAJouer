import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap, forkJoin, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReservationTableDto } from '@interfaces/entites/reservation-table-dto';
import { AuthService } from '@core/services/auth-services';
import { TableJeuDto } from '@interfaces/entites/table-jeu-dto';
import { TablesService } from '@tables/services/tables-service';
import { ReservationsService } from '@reservations/services/reservations-service';
import { JeuDto } from '@interfaces/entites/jeu-dto';
import { JeuFestivalViewDto } from '@interfaces/entites/jeu-festival-view-dto';
import { JeuService } from '@jeux/services/jeu-service';

@Injectable({
  providedIn: 'root'
})
export class GestionReservationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrlTable = `${environment.apiUrl}/reservation-tables`;
  private readonly baseUrlJeuFestival =`${environment.apiUrl}/jeu-festival`;
  private readonly baseUrlJeuFestivalTables =`${environment.apiUrl}/jeu-festival-tables`;
  
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

  private readonly jeuService = inject(JeuService);

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
    return this.http.get<ReservationTableDto[]>(this.baseUrlTable, { params, withCredentials: true })
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

    this.http.get<ReservationTableDto[]>(this.baseUrlTable, { params, withCredentials: true })
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

    this.http.post<{ message: string; affectation: ReservationTableDto }>(this.baseUrlTable, payload, { withCredentials: true })
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
      this.baseUrlTable,
      { body, withCredentials: true }
    )
      .pipe(
        tap(response => {
          if (response?.affectation) {
            this._reservationTables.update(rt =>
              rt.filter(r => !(r.reservation_id === reservationId && r.table_id === tableId))
            );
            this._tables.update(tables => tables.filter(t => t.id !== tableId));
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

  // =========================
  // ===== gestion des jeux ===
  // =========================

  private readonly _jeuFestivalView = signal<JeuFestivalViewDto[]>([]);
  readonly jeuFestivalView = this._jeuFestivalView.asReadonly();

  /**
   * Vue joinée: jeux liés via JeuFestival
   * - si reservationId fourni => jeux de la réservation
   * - sinon => jeux de TOUTES les réservations du festival
   */
  loadJeuxView(festivalId: number, reservationId?: number) {
    this._isLoading.set(true);
    this._error.set(null);

    let params = new HttpParams().set('festivalId', festivalId.toString());
    if (reservationId) params = params.set('reservationId', reservationId.toString());

    return this.http
      .get<JeuFestivalViewDto[]>(`${this.baseUrlJeuFestival}/view`, { params, withCredentials: true })
      .pipe(
        tap((rows) => this._jeuFestivalView.set(rows ?? [])),
        catchError((err) => {
          console.error('Erreur loadJeuxView', err);
          this._error.set('Erreur lors du chargement des jeux');
          this._jeuFestivalView.set([]);
          return of([] as JeuFestivalViewDto[]);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  /**
   * POST lien JeuFestival
   */
  addJeuToReservation(festivalId: number, reservationId: number, jeuId: number) {
    this._isLoading.set(true);
    this._error.set(null);

    const payload = {
      festival_id: festivalId,
      reservation_id: reservationId,
      jeu_id: jeuId,
      dans_liste_demandee: false,
      dans_liste_obtenue: false,
      jeux_recu: false
    };

    return this.http
      .post(this.baseUrlJeuFestival, payload, { withCredentials: true })
      .pipe(
        catchError((err) => {
          console.error('Erreur addJeuToReservation', err);
          if (err?.status === 401) this._error.set("Vous devez être connecté en tant qu'organisateur");
          else if (err?.status === 409) this._error.set('Ce jeu est déjà lié');
          else this._error.set("Erreur lors de l'ajout du jeu");
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  deleteJeuFromReservation(jeuFestivalId: number) {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http
      .delete(`${this.baseUrlJeuFestival}/${jeuFestivalId}`, { withCredentials: true })
      .pipe(
        catchError((err) => {
          console.error('Erreur deleteJeuFromReservation', err);
          if (err?.status === 401) this._error.set("Vous devez être connecté en tant qu'organisateur");
          else if (err?.status === 404) this._error.set('Lien jeu introuvable');
          else this._error.set("Erreur lors de la suppression du jeu");
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  loadJeuxCompletsPourFestival(festivalId: number): Observable<JeuDto[]> {
    // 1) on charge la view (qui sait quels jeux existent via les réservations)
    return this.loadJeuxView(festivalId).pipe(
      switchMap((rows) => {
        const ids = Array.from(new Set((rows ?? []).map(r => r.jeu_id).filter(Boolean)));

        if (!ids.length) return of([] as JeuDto[]);

        // 2) on récupère chaque jeu complet
        const reqs = ids.map(id =>
          this.jeuService.getById(id).pipe(
            catchError(() => of(null))
          )
        );

        return forkJoin(reqs).pipe(
          map(list => list.filter((j): j is JeuDto => j !== null))
        );
      }),
      catchError(err => {
        console.error('Erreur loadJeuxCompletsPourFestival', err);
        this._error.set('Erreur lors du chargement des jeux');
        return of([] as JeuDto[]);
      })
    );
  }

  //Ajoutre un jeux a une table 

  /**
   * Associe un jeu (via JeuFestival) à une table
   */
  addJeuToTable(jeuFestivalId: number, tableId: number): Observable<any> {
    this._isLoading.set(true);
    this._error.set(null);

    const payload = {
      jeu_festival_id: jeuFestivalId,
      table_id: tableId
    };

    return this.http.post<{ message: string; association: any }>(
        this.baseUrlJeuFestivalTables,
        payload,
        { withCredentials: true }
      )
      .pipe(
        tap(response => {
          if (response?.association) {
            console.log(`Jeu associé à la table : ${JSON.stringify(response.association)}`);
          } else {
            this._error.set("Erreur lors de l'association du jeu à la table");
          }
        }),
        catchError((err) => {
          console.error('Erreur addJeuToTable', err);
          if (err?.status === 401) {
            this._error.set("Vous devez être connecté en tant qu'organisateur");
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 409) {
            this._error.set('Cette table est déjà associée à ce jeu');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  /**
   * Récupère les IDs des jeux (jeu_festival_id) associés à une table
  */
  getJeuxByTableId(tableId: number): Observable<number[]> {
    this._isLoading.set(true);
    this._error.set(null);

    const params = new HttpParams().set('tableId', tableId.toString());

    return this.http
      .get<number[]>(`${this.baseUrlJeuFestivalTables}/jeu-table`, { 
        params, 
        withCredentials: true 
      })
      .pipe(
        tap(ids => {
          console.log(`Jeux associés à la table ${tableId}:`, ids);
        }),
        catchError((err) => {
          console.error('Erreur getJeuxByTableId', err);
          if (err?.status === 400) {
            this._error.set('ID de table invalide');
          } else {
            this._error.set('Erreur lors de la récupération des jeux de la table');
          }
          return of([]);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  /**
   * Retirer un jeu d'une table
   */
  removeJeuFromTable(jeuFestivalId: number, tableId: number): Observable<any> {
    this._isLoading.set(true);
    this._error.set(null);

    const body = {
      jeu_festival_id: jeuFestivalId,
      table_id: tableId
    };

    return this.http
      .delete<{ message: string; association: any }>(this.baseUrlJeuFestivalTables, { body, withCredentials: true })
      .pipe(
        tap(response => {
          if (response?.association) {
            console.log(`Jeu retiré de la table : ${JSON.stringify(response.association)}`);
          } else {
            this._error.set("Erreur lors du retrait du jeu");
          }
        }),
        catchError((err) => {
          console.error('Erreur removeJeuFromTable', err);
          if (err?.status === 401) {
            this._error.set("Vous devez être connecté en tant qu'organisateur");
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 404) {
            this._error.set('Association non trouvée');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

}
