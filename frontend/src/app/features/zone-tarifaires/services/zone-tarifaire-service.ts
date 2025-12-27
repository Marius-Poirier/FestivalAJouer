import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, effect } from '@angular/core';
import { environment } from '@env/environment';
import { ZoneTarifaireDto } from '@interfaces/entites/zone-tarifaire-dto';
import { catchError, finalize, of, tap } from 'rxjs';
import { CurrentFestival } from '@core/services/current-festival';

@Injectable({
  providedIn: 'root'
})
export class ZoneTarifaireService {
  private readonly http = inject(HttpClient)
  private readonly currentFestivalsvc = inject(CurrentFestival)
  private readonly baseUrl = `${environment.apiUrl}/zones-tarifaires`;

  public readonly currentfestival = this.currentFestivalsvc.currentFestival;

  private readonly _zonesTarifaires = signal<ZoneTarifaireDto[]>([]);
  readonly zonesTarifaires = this._zonesTarifaires.asReadonly()

  private readonly _showform = signal(false)
  readonly showform = this._showform.asReadonly()


  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    // Recharger automatiquement les zones quand le festival change
    effect(() => {
      const festival = this.currentfestival();
      if (festival?.id) {
        console.log('Festival changé, rechargement des zones tarifaires pour:', festival.nom);
        this.loadAll();
      }
    });
  }


  //charger les zones tarifaires du festival courant
  loadAll(): void {
    this._isLoading.set(true);
    this._error.set(null);

    const current = this.currentfestival();
    if (!current || !current.id) {
      this._error.set('Aucun festival sélectionné');
      this._isLoading.set(false);
      this._zonesTarifaires.set([]);
      return;
    }
    const params = new HttpParams().set('festivalId', current.id.toString());    
    this.http.get<ZoneTarifaireDto[]>(this.baseUrl, {
      params,
      withCredentials: true
    })
    .pipe(
      tap(data => { this._zonesTarifaires.set(data ?? []) 
        if(data.length == 0){
          console.log("pas de zone tarifaire dans ce festival")
        }
      }),
      catchError(err => {
        this._error.set('Erreur lors du chargement des zones tarifaires');
        this._zonesTarifaires.set([]);
        return of(null);
      }),
      finalize(() => this._isLoading.set(false)),
      catchError(() => of(null))
    )
    .subscribe(data => this._zonesTarifaires.set(data ?? []));
  }

  //ajouter zone tarifaire
  add(zoneTarifaire: ZoneTarifaireDto): void {
    this._isLoading.set(true);
    this._error.set(null);

    const current = this.currentfestival();
    if (!current || !current.id) {
      this._error.set('Aucun festival sélectionné');
      this._isLoading.set(false);
      return;
    }

    const zoneTarifaireComplete: ZoneTarifaireDto = {
      ...zoneTarifaire,
      festival_id: current.id
    };

    console.log('Données envoyées au backend:', zoneTarifaireComplete);

    this.http.post<{ message: string; zone: ZoneTarifaireDto }>(
      this.baseUrl, 
      zoneTarifaireComplete, 
      { withCredentials: true }
    )
      .pipe(
        tap(response => {
          if (response?.zone) {
            // Ajouter la nouvelle zone au début de la liste
            this._zonesTarifaires.update(list => [response.zone, ...list]);
            console.log(`Zone tarifaire ajoutée : ${JSON.stringify(response.zone)}`);
          } else {
            this._error.set('Erreur lors de l\'ajout de la zone tarifaire');
          }
        }),
        catchError((err) => {
          console.error('Erreur HTTP', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant que super organisateur');
          } else if (err?.status === 400) {
            this._error.set('Données invalides');
          } else if (err?.status === 409) {
            this._error.set('Nom déjà utilisé pour ce festival');
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
    this.http.delete<{message: string; zone: ZoneTarifaireDto}>(`${this.baseUrl}/${id}`, {withCredentials: true})
      .pipe(
        tap(response => {
          if (response?.zone) {
            this._zonesTarifaires.update(list => list.filter(zone => zone.id !== id));
            console.log(`Zone tarifaire supprimée : ${response.zone.nom}`);
          }
        }),
        catchError((err) => {
          console.error('Erreur lors de la suppression', err);
          if (err?.status === 401) {
            this._error.set('Vous devez être connecté en tant que super organisateur');
          } else if (err?.status === 404) {
            this._error.set('Zone tarifaire introuvable');
          } else {
            this._error.set('Erreur lors de la suppression');
          }
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

 

  public findById(id : number){
    return this._zonesTarifaires().find((f)=>f.id === id)
  }
  
}
