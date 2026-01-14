import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { JeuCard } from '@jeux/components/jeu-card/jeu-card';
import { GestionReservationService } from '@gestion-reservation/services/gestion-reservation-service';
import { CurrentFestival } from '@core/services/current-festival';

@Component({
  selector: 'app-workflow-jeux',
  standalone: true,
  imports: [CommonModule, JeuCard],
  templateUrl: './workflow-jeux.html',
  styleUrl: './workflow-jeux.css'
})
export class WorkflowJeux {
  private readonly gestionSvc = inject(GestionReservationService);
  private readonly currentFestivalSvc = inject(CurrentFestival);
  private readonly router = inject(Router);

  protected readonly currentFestival = this.currentFestivalSvc.currentFestival;

  protected readonly isLoading = this.gestionSvc.isLoading;
  protected readonly error = this.gestionSvc.error;

  protected readonly jeux = computed(() => this.gestionSvc.mapViewToJeuCards());

  constructor() {
    effect(() => {
      const fest = this.currentFestival();
      const festId = fest?.id;
      if (!festId) return;

      // charge tous les jeux de toutes les réservations de ce festival
      this.gestionSvc.loadJeuxView(festId).subscribe();
    });
  }

  protected onDetail(id: number) {
    this.router.navigate(['/jeux', id], { queryParams: { returnUrl: this.router.url } });
  }
}
