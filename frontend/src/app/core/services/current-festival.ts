import { inject, Injectable, signal, Signal, effect } from '@angular/core';
import { FestivalDto } from '@interfaces/entites/festival-dto';
import { FestivalService } from '@festivals/services/festival-service';

@Injectable({
  providedIn: 'root'
})
export class CurrentFestival {
  private festsvc = inject(FestivalService)
  private readonly _currentFestival = signal<FestivalDto | null>(null)
  public readonly currentFestival = this._currentFestival.asReadonly()

  constructor() {
    effect(() => {
      const current = this._currentFestival();
      const last = this.festsvc.lastFestival();
      
      if (!current && last) {
        this.setFestival(last);
      }
    });
  }

  public setFestival(festival : FestivalDto){
    this._currentFestival.set(festival)
    localStorage.setItem('festival_courant', JSON.stringify(festival));
  }

  loadFestivalFromStorage() {
    const stored = localStorage.getItem('festival_courant');
    if (stored) {
      try {
        const festival = JSON.parse(stored);
        this._currentFestival.set(festival);
      } catch (e) {
        console.error('Erreur lors du parsing du festival depuis localStorage', e);
        this.loadLastFestival();
      }
    } else {
      this.loadLastFestival();
    }
  }

  loadLastFestival() {
    const last = this.festsvc.lastFestival();
    if (last) {
      this.setFestival(last);
    }
  }
}
