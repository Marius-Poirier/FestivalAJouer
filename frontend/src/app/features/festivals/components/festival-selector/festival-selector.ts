import { Component, inject, output, signal } from '@angular/core';
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
  public listselected = output<number>()

  ngOnInit(){
    this.festsvc.loadAll();
    this.currentfestsvc.loadFestivalFromStorage();
  }

  onFestivalChange(value: string) {
    const festivalId = Number(value);
    const festival = this.festivals().find(f => f.id === festivalId);
    if (festival) {
      this.currentfestsvc.setFestival(festival);
      localStorage.setItem('festival_courant', JSON.stringify(festival));
    }
  }

  onRadioChange(value: string){
    this.listselected.emit(Number(value))
  }
}
