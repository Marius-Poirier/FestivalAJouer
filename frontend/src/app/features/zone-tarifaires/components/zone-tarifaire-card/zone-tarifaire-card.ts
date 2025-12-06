import { Component, computed, inject, input, output } from '@angular/core';
import { Card } from '@sharedComponent/card/card';
import { Action, Attributs } from '@sharedComponent/utils/generic-interfaces';
import { ZoneTarifaireService } from '../../services/zone-tarifaire-service';
import { ZoneTarifaireDto } from '@interfaces/entites/zone-tarifaire-dto';


@Component({
  selector: 'app-zone-tarifaire-card',
  imports: [Card],
  templateUrl: './zone-tarifaire-card.html',
  styleUrl: './zone-tarifaire-card.css'
})
export class ZoneTarifaireCard {

  private zoneTarifairessvc = inject(ZoneTarifaireService)
  public readonly idZoneTarif = input<number>();
  public readonly zone = input<ZoneTarifaireDto>();
  public delete = output<number>();
  public update = output<number>();


  public zonesTarif = computed(()=>{
    const id = this.idZoneTarif()
    if(id !== undefined){
      return this.zoneTarifairessvc.findById(id) 
    }
    return undefined;
  })

  public attributs = computed((): Attributs[] =>{
    const zone  = this.zonesTarif()
    if (!zone) return [];
    
    return [
      {
        label: 'Nombre tables total',
        value: zone.nombre_tables_total, 
        type : 'text',
      }, 
      {
        label: 'Prix par table',
        value: zone.prix_table, 
        type : 'date'
      }
    ]
  })

  public actions = computed((): Action[] => {
    const zone  = this.zonesTarif()
    if (!zone || !zone.id) return [];
    
    return[
      {
        label: 'Modifier',
        callback: () => this.update.emit(zone.id!)
      },
      {
        label : 'Supprimer',
        callback : () => this.delete.emit(zone.id!)
      }
    ]
  })

}
