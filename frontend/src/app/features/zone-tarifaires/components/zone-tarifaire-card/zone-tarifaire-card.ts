import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ZoneTarifaireService } from '../../services/zone-tarifaire-service';
import { ZoneTarifaireDto } from '@interfaces/entites/zone-tarifaire-dto';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import { PopupDelete } from '@sharedComponent/popup-delete/popup-delete';
import { AuthService } from '@core/services/auth-services';


@Component({
  selector: 'app-zone-tarifaire-card',
  imports: [MatCardModule, MatIconModule, PopupDelete, CurrencyPipe],
  templateUrl: './zone-tarifaire-card.html',
  styleUrl: './zone-tarifaire-card.css'
})
export class ZoneTarifaireCard {

  private zoneTarifairessvc = inject(ZoneTarifaireService)
  protected authService = inject(AuthService)
  public readonly idZoneTarif = input<number>();
  public readonly zone = input<ZoneTarifaireDto>();
  public delete = output<number>();
  public update = output<number>();

  // Signals pour la popup
  public deleteType = signal<string | null>(null);
  public deleteId = signal<number | null>(null);
  public deletenom = signal<string>('');

  public zonesTarif = computed(()=>{
    const id = this.idZoneTarif()
    if(id !== undefined){
      return this.zoneTarifairessvc.findById(id) 
    }
    return undefined;
  })

  public openDeletePopup(zone: ZoneTarifaireDto): void {
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
      this.zoneTarifairessvc.delete(id);
      console.log('Suppression de la zone tarifaire:', id);
    }
    this.closePopup();
  }

}
