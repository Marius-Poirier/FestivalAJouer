import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { FestivalDto } from '@interfaces/entites/festival-dto';
// import { MOCK_FESTIVALS } from 'src/mock_data/mock_festivals'; 
import { environment } from 'src/environments/environment';
import { catchError, finalize, of, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FestivalService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiUrl}/festivals`;

  private readonly _festivals = signal<FestivalDto[]>([]);
  readonly festivals = this._festivals.asReadonly()

  private readonly _showform = signal(false)
  readonly showform = this._showform.asReadonly()


  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly lastFestival = computed(() => {
    const festivals = this._festivals();
    if (festivals.length === 0) return undefined;
    
    return festivals.reduce((latest, current) => {
      const latestDate = new Date(latest.created_at || 0);
      const currentDate = new Date(current.created_at || 0);
      return currentDate > latestDate ? current : latest;
    });
  });


    
  loadAll(): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.http.get<FestivalDto[]>(this.baseUrl, {withCredentials:true})
      .pipe(
        tap(data => { this._festivals.set(data ?? []) }),
        catchError(err => {
          this._error.set('Erreur lors du chargement des festivals');
          this._festivals.set([]);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false)),
        catchError(() => of(null))
      )
      .subscribe(data => this._festivals.set(data ?? []));
  }

  add(festival: FestivalDto): void {
    this._isLoading.set(true); 
    this._error.set(null);
    
    this.http.post<{ message: string; festival: FestivalDto }>(this.baseUrl, festival, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response?.festival) {
            this._festivals.update(list => [response.festival, ...list]);
            console.log(`Festival ajouté : ${JSON.stringify(response.festival)}`);
          } else {
            this._error.set('Erreur lors de l\'ajout du festival');
          }
        }),
        catchError((err) => {
          console.error('Erreur HTTP', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant que super organisateur');
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 409) {
            this._error.set('Ce festival existe déjà');
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
    this.http.delete<{ message: string; festival: FestivalDto }>(`${this.baseUrl}/${id}`, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response?.festival) {
            this._festivals.update(fest => fest.filter(f => f.id !== id));
            console.log(`Festival supprimé : ${JSON.stringify(response.festival)}`);
          } else {
            this._error.set('Erreur lors de la suppression du festival');
          }
        }),
        catchError((err) => {
          console.error('Erreur HTTP', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant que super organisateur');
          } else if (err?.status === 404) {
            this._error.set('Festival non trouvé');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  update(festival: Omit<FestivalDto, 'created_at' | 'updated_at'> & { id: number }): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.put<{ message: string; festival: FestivalDto }>(
      `${this.baseUrl}/${festival.id}`, 
      festival, 
      { withCredentials: true }
    )
      .pipe(
        tap(response => {
          if (response?.festival) {
            this._festivals.update(list => 
              list.map(f => f.id === festival.id ? response.festival : f)
            );
            console.log(`Festival mis à jour : ${JSON.stringify(response.festival)}`);
          } else {
            this._error.set('Erreur lors de la mise à jour du festival');
          }
        }),
        catchError((err) => {
          console.error('Erreur HTTP', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant que super organisateur');
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 404) {
            this._error.set('Festival non trouvé');
          } else if (err?.status === 409) {
            this._error.set('Un festival avec ce nom existe déjà');
          } else {
            this._error.set('Erreur serveur');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  public findById(id : number){
    return this._festivals().find((f)=>f.id === id)
  }

  
}
