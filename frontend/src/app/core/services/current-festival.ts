import { inject, Injectable, signal, Signal } from '@angular/core';
import { FestivalDto } from '@interfaces/entites/festival-dto';
import { FestivalService } from '@festivals/services/festival-service';

@Injectable({
  providedIn: 'root'
})
export class CurrentFestival {
  private festsvc = inject(FestivalService)
  private readonly _currentFestival = signal<FestivalDto | null>(null)
  public readonly currentFestival = this._currentFestival.asReadonly()

  public setFestival(festival : FestivalDto){
    this._currentFestival.set(festival)
    localStorage.setItem('festival_courant', JSON.stringify(festival));
  }

  loadFestivalFromStorage() {
    const stored = localStorage.getItem('festival_courant');
    if (stored) {
      const festival = JSON.parse(stored);
      this._currentFestival.set(festival);
    } else {
      this.loadLastFestival();
    }
  }

  loadLastFestival() {
    const last = this.festsvc.getLastFestival();
    if (last) {
      this.setFestival(last);
    }
  }
}
