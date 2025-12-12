import { Component, inject, signal } from '@angular/core';
import { ZoneTarifaireDto } from '@interfaces/entites/zone-tarifaire-dto';
import { ZoneTarifaireCard } from '../zone-tarifaire-card/zone-tarifaire-card';
import { ZoneTarifaireService } from '@zoneTarifaires/services/zone-tarifaire-service';
import { ZoneTarifaireForm } from '../zone-tarifaire-form/zone-tarifaire-form';

@Component({
  selector: 'app-zone-tarifaire-list',
  imports: [ZoneTarifaireCard, ZoneTarifaireForm],
  templateUrl: './zone-tarifaire-list.html',
  styleUrl: './zone-tarifaire-list.css'
})
export class ZoneTarifaireList {
  
  private zonetarifairesvc = inject(ZoneTarifaireService)
  private idcurrentfestival = this.zonetarifairesvc.currentfestival()?.id
  public readonly isLoading = this.zonetarifairesvc.isLoading
  public readonly error = this.zonetarifairesvc.error
  public zonestarifaires = this.zonetarifairesvc.zonesTarifaires  

  public showForm = signal<boolean>(false)
  public zones = signal<ZoneTarifaireDto[]>([])

  ngOnInit(){
    this.zonetarifairesvc.loadAll()
    console.log("id festival", this.idcurrentfestival)
  }


  add(){

  }

  public show(){
    this.showForm.update(z => !z)
  }

}
