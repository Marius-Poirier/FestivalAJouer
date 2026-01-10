import { Component, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from '@core/services/auth-services';
import { ReservationsService } from '../../services/reservations-service';
import { MatIconModule } from '@angular/material/icon';
import { ReservationCard } from '../reservation-card/reservation-card';
import { ReservationForm } from '../reservation-form/reservation-form';
import { RouterModule } from '@angular/router';
import { EditeurService } from '@editeurs/services/editeur-service';


@Component({
  selector: 'app-reservation-list',
  imports: [ReservationCard, MatIconModule, RouterModule, ReservationForm],
  templateUrl: './reservation-list.html',
  styleUrl: './reservation-list.css'
})
export class ReservationList {
  protected readonly authService = inject(AuthService)
  protected readonly ressvc = inject(ReservationsService)
  protected readonly editeursvc = inject(EditeurService)
  private idcurrentfestival = computed(() => this.ressvc.currentfestival()?.id ?? null)
  public showForm = signal<boolean>(false)
  public searchTerm = signal<string>('')

  // // Festivals filtrés en temps réel
  // protected readonly filteredReservations = computed(() => {
  //   const term = this.searchTerm().toLowerCase().trim();
  //   const festivals = this.festivalService.festivals();
    
  //   if (!term) return festivals;
    
  //   return festivals.filter(fest => 
  //     fest.nom.toLowerCase().includes(term) ||
  //     fest.lieu.toLowerCase().includes(term)
  //   );
  // });
  constructor() {
    this.editeursvc.loadAll();
    if (!this.authService.currentUser()) {
      this.authService.whoami();
    }
  }
  private readonly reloadOnFestivalChange = effect(() => {
    const id = this.idcurrentfestival();
    if (id) {
      this.ressvc.loadAll();
    }
  });

  ngOnInit() {
    this.ressvc.loadAll();
    console.log("id festival", this.idcurrentfestival())

  }

  // Afficher form ajouter reservation
  public show(){
    this.showForm.update(r => !r)
  }

  // // Mettre à jour le terme de recherche
  // public onSearch(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   this.searchTerm.set(input.value);
  // }

}
