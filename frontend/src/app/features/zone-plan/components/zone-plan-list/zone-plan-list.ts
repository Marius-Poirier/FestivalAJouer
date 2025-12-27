import { Component, computed, effect, inject, signal } from '@angular/core';
import { ZonePlanService } from '@zonePlan/services/zone-plan-service';
import { ZoneDuPlanDto } from '@interfaces/entites/zone-du-plan-dto';
import { ZonePlanCard } from '../zone-plan-card/zone-plan-card';
import { ZonePlanForm } from '../zone-plan-form/zone-plan-form'; // ✅ AJOUTÉ

@Component({
  selector: 'app-zone-plan-list',
  imports: [ZonePlanCard, ZonePlanForm], // ✅ AJOUTÉ ZonePlanForm
  templateUrl: './zone-plan-list.html',
  styleUrl: './zone-plan-list.css'
})
export class ZonePlanList {
  private zonePlansvc = inject(ZonePlanService)
  private idcurrentfestival = computed(() => this.zonePlansvc.currentfestival()?.id ?? null)
  public readonly isLoading = this.zonePlansvc.isLoading
  public readonly error = this.zonePlansvc.error
  public zonesPlan = this.zonePlansvc.zonesPlan 

  public showForm = signal<boolean>(false)
  public zones = signal<ZoneDuPlanDto[]>([])

  // Recharge les zones dès que le festival courant change
  private readonly reloadOnFestivalChange = effect(() => {
    const id = this.idcurrentfestival();
    if (id) {
      this.zonePlansvc.loadAll();
    }
  });

  ngOnInit(){
    this.zonePlansvc.loadAll()
    console.log("id festival", this.idcurrentfestival())
  }
  add(){

  }

  public show(){
    this.showForm.update(z => !z)
  }

}
