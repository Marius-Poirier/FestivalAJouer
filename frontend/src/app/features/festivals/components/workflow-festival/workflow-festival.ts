import { Component, signal } from '@angular/core';
import { FestivalSelector } from '../festival-selector/festival-selector';
import { ZoneTarifaireList } from '@zoneTarifaires/components/zone-tarifaire-list/zone-tarifaire-list';

@Component({
  selector: 'app-workflow-festival',
  imports: [FestivalSelector, ZoneTarifaireList],
  templateUrl: './workflow-festival.html',
  styleUrl: './workflow-festival.css'
})
export class WorkflowFestival {
  listselected = signal<number>(1)

  onListSelected(value: number){
    console.log('Valeur reçue:', value);
    this.listselected.set(value);
  }


}
