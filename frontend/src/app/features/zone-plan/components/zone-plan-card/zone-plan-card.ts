import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ZoneDuPlanDto } from '@interfaces/entites/zone-du-plan-dto';
import { ZonePlanService } from '../../services/zone-plan-service';
import { ZoneTarifaireService } from '@zoneTarifaires/services/zone-tarifaire-service';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import { PopupDelete } from '@sharedComponent/popup-delete/popup-delete';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '@core/services/auth-services';



@Component({
  selector: 'app-zone-plan-card',
  imports: [MatCardModule, MatIconModule, PopupDelete, CurrencyPipe],
  templateUrl: './zone-plan-card.html',
  styleUrl: './zone-plan-card.css'
})
export class ZonePlanCard {
  private zonePlansvc = inject(ZonePlanService)
  private zoneTarifairesvc = inject(ZoneTarifaireService)
  private router = inject(Router);
  protected authService = inject(AuthService);
  public readonly idZonePlan = input<number>();
  public readonly zone = input<ZoneDuPlanDto>();
  

  public readonly zonetarifaire = input<string>();
  public delete = output<number>();
  public update = output<number>();
  
  
  // Signals pour la popup
  public deleteType = signal<string | null>(null);
  public deleteId = signal<number | null>(null);
  public deletenom = signal<string>('');

  public isEditMode = signal<boolean>(false)

  public zonePlan = computed(()=>{
    const id = this.idZonePlan()
    if(id !== undefined){
      return this.zonePlansvc.findById(id) 
    }
    return undefined;
  })

  //------ Récupérer la zone tarifaire associer a cette zone du plan
  public zoneTarifaire = computed(() => {
    const zonePlan = this.zonePlan()
    if (zonePlan && zonePlan.zone_tarifaire_id) {
      return this.zoneTarifairesvc.findById(zonePlan.zone_tarifaire_id)
    }
    return undefined
  })
  
  public navigateToDetail(id: number): void {
    this.router.navigate(['/zone-plan', id]);
  }

  public openDeletePopup(zone: ZoneDuPlanDto): void {
    this.deleteType.set('zone');
    this.deleteId.set(zone.id ?? null);
    this.deletenom.set(zone.nom);
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
      this.zonePlansvc.delete(id);
      console.log('Suppression de la zone du plan:', id);
    }
    this.closePopup();
  }



}
