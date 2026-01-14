import { Component, computed, viewChild } from '@angular/core';
import { FestivalSelector } from '../festival-selector/festival-selector';
import { ZoneTarifaireList } from '@zoneTarifaires/components/zone-tarifaire-list/zone-tarifaire-list';
import { ZonePlanList } from '@zonePlan/components/zone-plan-list/zone-plan-list';
import { ReservationList } from '@reservations/components/reservation-list/reservation-list';
import { EditeurListFestival } from '@editeurs/components/editeur-list-festival/editeur-list-festival';
import { WorkflowJeux } from '@gestion-reservation/components/workflow-jeux/workflow-jeux';

@Component({
  selector: 'app-workflow-festival',
  imports: [FestivalSelector, ZoneTarifaireList, ZonePlanList, ReservationList, EditeurListFestival, WorkflowJeux],
  templateUrl: './workflow-festival.html',
  styleUrl: './workflow-festival.css'
})
export class WorkflowFestival {
  private festivalSelector = viewChild.required(FestivalSelector)
  
  listselected = computed(() => {
    return this.festivalSelector().listselected()
  })
}
