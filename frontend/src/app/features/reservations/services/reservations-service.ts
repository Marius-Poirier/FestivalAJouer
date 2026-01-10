import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { catchError, finalize, map, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReservationDto } from '@interfaces/entites/reservation-dto';
import { StatutReservationWorkflow } from '@enum/statut-workflow-reservation';
import { CurrentFestival } from '@core/services/current-festival';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private readonly http = inject(HttpClient);
  private readonly currentFestivalsvc = inject(CurrentFestival);
  private readonly baseUrl = `${environment.apiUrl}/reservations`;

  public readonly currentfestival = this.currentFestivalsvc.currentFestival;

  private readonly _reservations = signal<ReservationDto[]>([]);
  readonly reservations = this._reservations.asReadonly();

  public reservation = signal<ReservationDto | null>(null)

  private readonly _showform = signal(false);
  readonly showform = this._showform.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();


  findById(id: number): ReservationDto | undefined {
    return this._reservations().find(r => r.id === id);
  }

// charger tout les reservations 
  loadAll(): void {
    this._isLoading.set(true);
    this._error.set(null);

    const current = this.currentfestival();
    if (!current || !current.id) {
      this._error.set('Aucun festival sélectionné');
      this._isLoading.set(false);
      this._reservations.set([]);
      return;
    }
    const params = new HttpParams().set('festivalId', current.id.toString());  
    this.http.get<ReservationDto[]>(this.baseUrl, {params, withCredentials:true})
      .pipe(
        tap(data => this._reservations.set(data ?? [])),
        catchError(err => {
          console.error('Erreur lors du chargement des réservations', err);
          this._error.set('Erreur lors du chargement des réservations');
          this._reservations.set([]);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false)),
        catchError(() => of(null))
      )
      .subscribe(data => this._reservations.set(data ?? []));
  }
//ajouter une reservation
  add(reservation: Omit<ReservationDto, 'id' | 'created_at' | 'updated_at'>) {
    this._isLoading.set(true);
    this._error.set(null);

    const current = this.currentfestival();
    if (!current || !current.id) {
      this._error.set('Aucun festival sélectionné');
      this._isLoading.set(false);
      return of(null);
    }

    const reservationComplet: ReservationDto = {
      ...reservation,
      festival_id: current.id
    };
    console.log('Données envoyées au backend:', reservationComplet);
    const apiPayload = {
      ...reservationComplet,
      statut_workflow: String(reservationComplet.statut_workflow).toLowerCase()
    };

    return this.http.post<{ message: string; reservation: ReservationDto }>(this.baseUrl, apiPayload, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response?.reservation) {
            this._reservations.update(list => [response.reservation, ...list]);
            console.log(`Réservation ajoutée : ${JSON.stringify(response.reservation)}`);
          } else {
            this._error.set('Erreur lors de l\'ajout de la réservation');
          }
        }),
        map(response => response?.reservation ?? null),
        catchError((err) => {
          console.error('Erreur HTTP', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant qu\'organisateur');
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 409) {
            this._error.set('Une réservation existe déjà pour cet éditeur et ce festival');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      );
  }


//supprimer une reservation
  delete(id: number): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.http.delete<{ message: string; reservation: ReservationDto }>(`${this.baseUrl}/${id}`, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response?.reservation) {
            this._reservations.update(res => res.filter(r => r.id !== id));
            console.log(`Réservation supprimée : ${JSON.stringify(response.reservation)}`);
          } else {
            this._error.set('Erreur lors de la suppression de la réservation');
          }
        }),
        catchError((err) => {
          console.error('Erreur HTTP', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant qu\'organisateur');
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 404) {
            this._error.set('Réservation non trouvée');
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
   * GET /api/reservations/:id
   * Charge une seule réservation par son ID et la stocke dans le signal reservation
   */
  loadOne(id: number) {
    return this.http.get<ReservationDto>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    }).pipe(
      tap(data => {
        if (data) {
          this.reservation.set(data);
          console.log('Réservation chargée:', data);
        }
      }),
      catchError(err => {
        console.error('Erreur lors du chargement de la réservation', err);
        this.reservation.set(null);
        throw err;
      })
    );
  }

}
