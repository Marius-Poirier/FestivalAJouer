import { Component, input, output, inject, LOCALE_ID, computed } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FestivalDto } from '@interfaces/entites/festival-dto';
import { FestivalService } from '@festivals/services/festival-service';
import {MatCardModule} from '@angular/material/card';
import { Card } from '@sharedComponent/card/card';
import { Attributs, Action } from '@sharedComponent/utils/generic-interfaces';

registerLocaleData(localeFr);




@Component({
  selector: 'app-festival-card',
  imports: [Card],
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
        return this.festsvc.findById(id) 
    }
    else {
      return undefined
    }
  })

  public attributs = computed((): Attributs[] =>{
    const fest  = this.festival()
    if (!fest) return [];
    
    return [
      {
        label: 'Localisation',
        value: fest.lieu, 
        type : 'text',
      }, 
      {
        label: 'Début',
        value: fest.date_debut, 
        type : 'date'
      },
      {
        label: 'Fin',
        value: fest.date_fin,
        type : 'date'
      }
    ]
  })

  public actions = computed((): Action[] => {
    const fest = this.festival()
    if (!fest || !fest.id) return [];
    
    return[
      {
        label: 'Modifier',
        callback: () => this.update.emit(fest.id!)
      },
      {
        label : 'Supprimer',
        callback : () => this.delete.emit(fest.id!)
      }
    ]
  })
}
