import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@env/environment';
import { ZoneDuPlanDto } from '@interfaces/entites/zone-du-plan-dto';
import { catchError, finalize, of, tap } from 'rxjs';
import { CurrentFestival } from '@core/services/current-festival';
import { TablesService } from '@tables/services/tables-service';

@Injectable({
  providedIn: 'root'
})
export class ZonePlanService {
  private readonly http = inject(HttpClient)
  private readonly currentFestivalsvc = inject(CurrentFestival)
  private readonly tablesSvc = inject(TablesService)

  private readonly baseUrl = `${environment.apiUrl}/zones-du-plan`;

  public readonly currentfestival = this.currentFestivalsvc.currentFestival;

  private readonly _zonesPlan = signal<ZoneDuPlanDto[]>([]);
  readonly zonesPlan = this._zonesPlan.asReadonly()

  private readonly _showform = signal(false)
  readonly showform = this._showform.asReadonly()


  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();


  public findById(id : number){
    return this._zonesPlan().find((f)=>f.id === id)
  }

  //charger les zones du plan du festival courant
  loadAll(): void {
    console.log("chargement des zones du plan")
    this._isLoading.set(true);
    this._error.set(null);
    const current = this.currentfestival();
    if (!current || !current.id) {
      this._error.set('Aucun festival sélectionné');
      this._isLoading.set(false);
      this._zonesPlan.set([]);
      return;
    }
    const params = new HttpParams().set('festivalId', current.id.toString());    
    this.http.get<ZoneDuPlanDto[]>(this.baseUrl, {
      params,
      withCredentials: true
    })
    .pipe(
      tap(data => { this._zonesPlan.set(data ?? []) 
        if(data.length == 0){
          console.log("Pas de zone du plan dans ce festival") // ✅ CORRIGÉ
        }
      }),
      catchError(err => {
        this._error.set('Erreur lors du chargement des zones du plan'); // ✅ CORRIGÉ
        this._zonesPlan.set([]);
        return of(null);
      }),
      finalize(() => this._isLoading.set(false)),
      catchError(() => of(null))
    )
    .subscribe(data => this._zonesPlan.set(data ?? []));
    console.log("chargement reussi")
  }

  //ajouter zone du plan + génération automatique des tables
  add(zonePlan: ZoneDuPlanDto, tableCapacity = 2): void {
    this._isLoading.set(true);
    this._error.set(null);

    const current = this.currentfestival();
    if (!current || !current.id) {
      this._error.set('Aucun festival sélectionné');
      this._isLoading.set(false);
      return;
    }

    const zonePlanComplete: ZoneDuPlanDto = {
      ...zonePlan,
      festival_id: current.id
    };

    console.log('Données envoyées au backend:', zonePlanComplete);

    this.http.post<{ message: string; zone: ZoneDuPlanDto }>(
      this.baseUrl, 
      zonePlanComplete, 
      { withCredentials: true }
    )
      .pipe(
        tap(response => {
          if (response?.zone) {
            // Ajouter la nouvelle zone au début de la liste
            this._zonesPlan.update(list => [response.zone, ...list]);
            console.log(`Zone du plan ajoutée : ${JSON.stringify(response.zone)}`);

            // Générer automatiquement les tables liées à cette zone
            const tablesToCreate = Math.max(0, response.zone.nombre_tables ?? 0);
            if (response.zone.id) {
              for (let i = 0; i < tablesToCreate; i++) {
                this.tablesSvc.add({
                  zone_du_plan_id: response.zone.id,
                  zone_tarifaire_id: response.zone.zone_tarifaire_id,
                  capacite_jeux: tableCapacity || 2
                });
              }
            }
          } else {
            this._error.set('Erreur lors de l\'ajout de la zone du plan');
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
    this.http.delete<{message: string; zone: ZoneDuPlanDto}>(`${this.baseUrl}/${id}`, {withCredentials: true})
    .pipe(
      tap(response => {
        if (response?.zone) {
          this._zonesPlan.update(list => list.filter(zone => zone.id !== id));
          console.log(`Zone du plan supprimée : ${response.zone.nom}`); // ✅ CORRIGÉ
        }
      }),
      catchError((err) => {
        console.error('Erreur lors de la suppression', err);
        if (err?.status === 401) {
          this._error.set('Vous devez être connecté en tant que super organisateur');
        } else if (err?.status === 404) {
          this._error.set('Zone du plan introuvable'); // ✅ CORRIGÉ
        } else {
          this._error.set('Erreur lors de la suppression');
        }
        return of(null);
      }),
      finalize(() => this._isLoading.set(false))
    )
    .subscribe();
  }


  
}
