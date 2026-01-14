import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JeuCard } from '@jeux/components/jeu-card/jeu-card';
import { GestionReservationService } from '@gestion-reservation/services/gestion-reservation-service';
import { CurrentFestival } from '@core/services/current-festival';
import { JeuDto } from '@interfaces/entites/jeu-dto';

@Component({
  selector: 'app-workflow-jeux',
  standalone: true,
  imports: [CommonModule, JeuCard],
  templateUrl: './reservation-jeu-workflow.html',
  styleUrl: './reservation-jeu-workflow.css'
})
export class ReservationJeuWorkFlow {
  private readonly gestionSvc = inject(GestionReservationService);
  private readonly currentFestivalSvc = inject(CurrentFestival);
  private readonly router = inject(Router);

  protected readonly currentFestival = this.currentFestivalSvc.currentFestival;

  protected readonly isLoading = this.gestionSvc.isLoading;
  protected readonly error = this.gestionSvc.error;

  // on stocke les jeux complets
  protected readonly jeux = signal<JeuDto[]>([]);

  constructor() {
    effect(() => {
      const festId = this.currentFestival()?.id;
      if (!festId) {
        this.jeux.set([]);
        return;
      }

      // charge les jeux complets (mêmes infos que la page /jeux)
      this.gestionSvc.loadJeuxCompletsPourFestival(festId).subscribe((list) => {
        this.jeux.set(list ?? []);
      });
    });
  }

  protected onDetail(id: number) {
    this.router.navigate(['/jeux', id], { queryParams: { returnUrl: this.router.url } });
  }
}
