import { Component, effect, inject, signal } from '@angular/core';
import { CurrentFestival } from '@core/services/current-festival';
import { FestivalService } from '@festivals/services/festival-service';
import {MatRadioModule} from '@angular/material/radio';

@Component({
  selector: 'app-festival-selector',
  imports: [MatRadioModule],
  templateUrl: './festival-selector.html',
  styleUrl: './festival-selector.css'
})
export class FestivalSelector {
  private currentfestsvc = inject(CurrentFestival)
  private festsvc = inject(FestivalService) 

  public currentFestival = this.currentfestsvc.currentFestival
  public festivals = this.festsvc.festivals
  public listselected = signal<number>(1)

    constructor() {
      // Synchroniser listselected avec currentFestival
      effect(() => {
        const current = this.currentFestival();
        if (current && current.id !== undefined) {
          this.listselected.set(current.id);
        }
      });
  }

  ngOnInit(){
    this.festsvc.loadAll();
    this.currentfestsvc.loadFestivalFromStorage();
  }

  onFestivalChange(value: string) {
    const festivalId = Number(value);
    const festival = this.festivals().find(f => f.id === festivalId);
    if (festival) {
      this.currentfestsvc.setFestival(festival);
    }
  }

  onRadioChange(value: string){
    this.listselected.set(Number(value))
  }
}
