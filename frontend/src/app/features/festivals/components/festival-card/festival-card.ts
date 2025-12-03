import { Component, input, output, inject, LOCALE_ID, computed } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FestivalDto } from '@interfaces/entites/festival-dto';
import { FestivalService } from '@festivals/services/festival-service';
import {MatCardModule} from '@angular/material/card';


registerLocaleData(localeFr);

@Component({
  selector: 'app-festival-card',
  imports: [MatCardModule, DatePipe],
  templateUrl: './festival-card.html',
  styleUrl: './festival-card.css',
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }]
})
export class FestivalCard {
  // public festival = input<FestivalDto>();
  private festsvc = inject(FestivalService)
  public readonly idFestival = input<number>();
  public delete = output<number>();
  public update = output<number>();


  public festival = computed(()=>{
    const id = this.idFestival()
        if(id !== undefined){
        return this.festsvc.findById(id) // ✅ Cherche dans le STORE !
    }
    else {
      return undefined
    }
  }
  )
}
