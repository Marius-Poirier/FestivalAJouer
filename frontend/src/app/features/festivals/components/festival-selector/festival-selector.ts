import { Component, inject, signal } from '@angular/core';
import { CurrentFestival } from '@core/services/current-festival';
import { FestivalService } from '@festivals/services/festival-service';
import {MatRadioModule} from '@angular/material/radio';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth-services';

@Component({
  selector: 'app-festival-selector',
  imports: [MatRadioModule],
  templateUrl: './festival-selector.html',
  styleUrl: './festival-selector.css'
})
export class FestivalSelector {
  private currentfestsvc = inject(CurrentFestival)
  private festsvc = inject(FestivalService) 
  private router = inject(Router)
  private auth = inject(AuthService)

  public currentFestival = this.currentfestsvc.currentFestival
  public festivals = this.festsvc.festivals
  public listselected = signal<number>(1)
  public canSeeZones = this.auth.isAdminSuperorga

  ngOnInit(){
    this.festsvc.loadAll();
    this.currentfestsvc.loadFestivalFromStorage();

    const nav = this.router.getCurrentNavigation();
    const stateTab = (nav?.extras?.state as { tab?: number } | undefined)?.tab;
    const historyTab = (history.state as { tab?: number } | undefined)?.tab;
    const tab = stateTab ?? historyTab;
    if (tab) {
      this.listselected.set(Number(tab));
    }

    // Empêche un onglet zone inaccessible d'être actif pour les rôles non autorisés
    if (!this.canSeeZones() && (this.listselected() === 3 || this.listselected() === 4)) {
      this.listselected.set(1);
    }
  }

  onFestivalChange(value: string) {
    const festivalId = Number(value);
    const festival = this.festivals().find(f => f.id === festivalId);
    if (festival) {
      this.currentfestsvc.setFestival(festival);
    }
    console.log("selector : id festival new", festivalId)
  }

  onRadioChange(event: any){
    this.listselected.set(Number(event.value))
  }
}
