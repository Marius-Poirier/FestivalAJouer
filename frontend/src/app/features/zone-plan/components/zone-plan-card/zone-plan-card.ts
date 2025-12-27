import { Component, computed, inject, input, output, signal } from '@angular/core';
import { ZoneDuPlanDto } from '@interfaces/entites/zone-du-plan-dto';
import { ZonePlanService } from '../../services/zone-plan-service';
import { ZoneTarifaireService } from '@zoneTarifaires/services/zone-tarifaire-service';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import { PopupDelete } from '@sharedComponent/popup-delete/popup-delete';
import { CurrencyPipe } from '@angular/common';

// ❌ ANCIEN CODE - Code de test à supprimer
// const zonetest : ZoneDuPlanDto = {
//   festival_id : 1,
//   nom : "teste plan",
//   nombre_tables : 3,
//   zone_tarifaire_id :  1,
// }

@Component({
  selector: 'app-zone-plan-card',
  imports: [MatCardModule, MatIconModule, PopupDelete, CurrencyPipe],
  templateUrl: './zone-plan-card.html',
  styleUrl: './zone-plan-card.css'
})
export class ZonePlanCard {
  private zonePlansvc = inject(ZonePlanService)
  private zoneTarifairesvc = inject(ZoneTarifaireService)
  public readonly idZonePlan = input<number>();
  public readonly zone = input<ZoneDuPlanDto>();
  
  // ❌ ANCIEN CODE - Variable de test à supprimer
  // public readonly zonetest = zonetest;
  
  public readonly zonetarifaire = input<string>();
  public delete = output<number>();
  public update = output<number>();
  

  
  // Signals pour la popup
  public deleteType = signal<string | null>(null);
  public deleteId = signal<number | null>(null);
  public deletenom = signal<string>('');

  public zonePlan = computed(()=>{
    const id = this.idZonePlan()
    if(id !== undefined){
      return this.zonePlansvc.findById(id) 
    }
    return undefined;
  })

  // ✅ NOUVEAU : Récupérer toutes les infos de la zone tarifaire associée
  public zoneTarifaire = computed(() => {
    const zonePlan = this.zonePlan()
    if (zonePlan && zonePlan.zone_tarifaire_id) {
      return this.zoneTarifairesvc.findById(zonePlan.zone_tarifaire_id)
    }
    return undefined
  })

  public openDeletePopup(zone: ZoneDuPlanDto): void {
    this.deleteType.set('zone');
    this.deleteId.set(zone.id ?? null);
    this.deletenom.set(zone.nom);
  }

  public handleCancel(): void {
    this.closePopup();
  }

  private closePopup(): void {
    this.deleteType.set('null');
    this.deleteId.set(null);
    this.deletenom.set('');
  }

  public handleConfirm(): void {
    const id = this.deleteId();
    if (id !== null) {
      this.zonePlansvc.delete(id);
      // ❌ ANCIEN CODE (mauvais message)
      // console.log('Suppression de la zone tarifaire:', id);
      
      // ✅ NOUVEAU CODE (message correct)
      console.log('Suppression de la zone du plan:', id);
    }
    this.closePopup();
  }

}
