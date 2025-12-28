import { Component, computed, viewChild } from '@angular/core';
import { FestivalSelector } from '../festival-selector/festival-selector';
import { ZoneTarifaireList } from '@zoneTarifaires/components/zone-tarifaire-list/zone-tarifaire-list';
import { ZonePlanList } from '@zonePlan/components/zone-plan-list/zone-plan-list';
import { ReservationList } from '@reservations/components/reservation-list/reservation-list';

@Component({
  selector: 'app-workflow-festival',
  imports: [FestivalSelector, ZoneTarifaireList, ZonePlanList, ReservationList],
  templateUrl: './workflow-festival.html',
  styleUrl: './workflow-festival.css'
})
export class WorkflowFestival {
  private festivalSelector = viewChild.required(FestivalSelector)
  
  listselected = computed(() => {
    return this.festivalSelector().listselected()
  })
}
