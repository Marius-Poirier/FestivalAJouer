import { Component, inject, signal } from '@angular/core';
import { CurrentFestival } from '@core/services/current-festival';
import { FestivalService } from '@festivals/services/festival-service';
import { FestivalDto } from '@interfaces/entites/festival-dto';
import { Observable} from 'rxjs';

@Component({
  selector: 'app-festival-selector',
  imports: [],
  templateUrl: './festival-selector.html',
  styleUrl: './festival-selector.css'
})
export class FestivalSelector {
  private currentfestsvc = inject(CurrentFestival)
  private festsvc = inject(FestivalService)

  public currentFestival = this.currentfestsvc.currentFestival
  public festivals = this.festsvc.festivals

  ngOnInit(){
    this.currentfestsvc.loadFestivalFromStorage();
    this.festsvc.loadAll();
  }

  onFestivalChange(value: string) {
    const festivalId = Number(value);
    const festival = this.festivals().find(f => f.id === festivalId);
    if (festival) {
      this.currentfestsvc.setFestival(festival);
      localStorage.setItem('festival_courant', JSON.stringify(festival));
    }
  }
}
