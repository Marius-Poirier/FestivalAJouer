import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { JeuCard } from '@jeux/components/jeu-card/jeu-card';
import { GestionReservationService } from '@gestion-reservation/services/gestion-reservation-service';
import { CurrentFestival } from '@core/services/current-festival';
import { JeuDto } from '@interfaces/entites/jeu-dto';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-workflow-jeux',
  standalone: true,
  imports: [CommonModule, JeuCard, MatIconModule],
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

  // jeux complets
  protected readonly jeux = signal<JeuDto[]>([]);

  // ===== barre de recherche =====
  protected readonly searchTerm = signal<string>('');

  protected onSearch(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.searchTerm.set(target?.value ?? '');
  }

  protected readonly filteredJeux = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.jeux();

    if (!term) return list;

    return list.filter(j =>
      (j.nom ?? '').toLowerCase().includes(term)
    );
  });

  constructor() {
    effect(() => {
      const festId = this.currentFestival()?.id;
      if (!festId) {
        this.jeux.set([]);
        return;
      }

      this.gestionSvc.loadJeuxCompletsPourFestival(festId).subscribe((list) => {
        this.jeux.set(list ?? []);
      });
    });
  }

  protected onDetail(id: number) {
    this.router.navigate(['/jeux', id], { queryParams: { returnUrl: this.router.url } });
  }
}
