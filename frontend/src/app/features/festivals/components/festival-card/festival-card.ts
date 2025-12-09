import { Component, input, output, inject, LOCALE_ID, computed, signal } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FestivalService } from '@festivals/services/festival-service';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import { FestivalDto } from '@interfaces/entites/festival-dto';
import { PopupDelete } from '@sharedComponent/popup-delete/popup-delete';

registerLocaleData(localeFr);

@Component({
  selector: 'app-festival-card',
  imports: [MatCardModule, DatePipe, MatIconModule, PopupDelete],
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

  // Signals pour la popup
  public deleteType = signal<string | null>(null);
  public deleteId = signal<number | null>(null);
  public deletenom = signal<string>('');

  public festival = computed(()=>{
    const id = this.idFestival()
        if(id !== undefined){
        return this.festsvc.findById(id) 
    }
    else {
      return undefined
    }
  })

  public openDeletePopup(festival: FestivalDto): void {
    this.deleteType.set('festival');
    this.deleteId.set(festival.id ?? null);
    this.deletenom.set(festival.nom);
  }

  public handleCancel(): void {
    this.closePopup();
  }

  private closePopup(): void {
    this.deleteType.set(null);
    this.deleteId.set(null);
    this.deletenom.set('');
  }


  public handleConfirm(): void {
    const id = this.deleteId();
    if (id !== null) {
      this.festsvc.delete(id);
    }
    this.closePopup();
  }

  // public attributs = computed((): Attributs[] =>{
  //   const fest  = this.festival()
  //   if (!fest) return [];
    
  //   return [
  //     {
  //       label: 'Localisation',
  //       value: fest.lieu, 
  //       type : 'text',
  //     }, 
  //     {
  //       label: 'Début',
  //       value: fest.date_debut, 
  //       type : 'date'
  //     },
  //     {
  //       label: 'Fin',
  //       value: fest.date_fin,
  //       type : 'date'
  //     }
  //   ]
  // })

  // public actions = computed((): Action[] => {
  //   const fest = this.festival()
  //   if (!fest || !fest.id) return [];
    
  //   return[
  //     {
  //       label: 'Modifier',
  //       callback: () => this.update.emit(fest.id!)
  //     },
  //     {
  //       label : 'Supprimer',
  //       callback : () => this.delete.emit(fest.id!)
  //     }
  //   ]
  // })
}
