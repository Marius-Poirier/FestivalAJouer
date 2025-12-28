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

  private readonly _showform = signal(false);
  readonly showform = this._showform.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();


  findById(id: number): ReservationDto | undefined {
    return this._reservations().find(r => r.id === id);
  }


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
        map(data => (data ?? []).map(r => this.normalizeReservation(r))),
        tap(data => this._reservations.set(data)),
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

    // Adapter le statut pour l'API (backend attend les valeurs en minuscule)
    const apiPayload = {
      ...reservationComplet,
      statut_workflow: String(reservationComplet.statut_workflow).toLowerCase()
    };

    return this.http.post<{ message: string; reservation: ReservationDto }>(this.baseUrl, apiPayload, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response?.reservation) {
            const normalized = this.normalizeReservation(response.reservation);
            this._reservations.update(list => [normalized, ...list]);
            console.log(`Réservation ajoutée : ${JSON.stringify(normalized)}`);
          } else {
            this._error.set('Erreur lors de l\'ajout de la réservation');
          }
        }),
        map(response => response?.reservation ? this.normalizeReservation(response.reservation) : null),
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

  private normalizeReservation(res: ReservationDto): ReservationDto {
    const statutRaw = (res.statut_workflow as unknown as string) ?? '';
    const upper = statutRaw.toUpperCase() as keyof typeof StatutReservationWorkflow;
    const normalizedStatut = StatutReservationWorkflow[upper] ?? StatutReservationWorkflow.PAS_CONTACTE;
    return {
      ...res,
      statut_workflow: normalizedStatut
    };
  }

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

  update(reservation: Omit<ReservationDto, 'created_at' | 'updated_at'> & { id: number }): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.put<{ message: string; reservation: ReservationDto }>(
      `${this.baseUrl}/${reservation.id}`, 
      reservation, 
      { withCredentials: true }
    )
      .pipe(
        tap(response => {
          if (response?.reservation) {
            this._reservations.update(list => 
              list.map(r => r.id === reservation.id ? response.reservation : r)
            );
            console.log(`Réservation mise à jour : ${JSON.stringify(response.reservation)}`);
          } else {
            this._error.set('Erreur lors de la mise à jour de la réservation');
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
          } else if (err?.status === 409) {
            this._error.set('Conflit lors de la mise à jour de la réservation');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

}
