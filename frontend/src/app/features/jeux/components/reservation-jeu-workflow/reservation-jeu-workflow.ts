import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { JeuCard } from '@jeux/components/jeu-card/jeu-card';
import { GestionReservationService } from '@gestion-reservation/services/gestion-reservation-service';
import { CurrentFestival } from '@core/services/current-festival';
import { JeuDto } from '@interfaces/entites/jeu-dto';
import { MatIconModule } from '@angular/material/icon';
import { JeuService } from '@jeux/services/jeu-service';
import { JeuForm } from '@jeux/components/jeu-form/jeu-form';

@Component({
  selector: 'app-workflow-jeux',
  standalone: true,
  imports: [CommonModule, JeuCard, MatIconModule, JeuForm],
  templateUrl: './reservation-jeu-workflow.html',
  styleUrl: './reservation-jeu-workflow.css'
})
export class ReservationJeuWorkFlow {
  private readonly gestionSvc = inject(GestionReservationService);
  private readonly currentFestivalSvc = inject(CurrentFestival);
  private readonly router = inject(Router);
  private readonly jeuService = inject(JeuService);

  protected readonly currentFestival = this.currentFestivalSvc.currentFestival;
  protected readonly isLoading = this.gestionSvc.isLoading;
  protected readonly error = this.gestionSvc.error;

  // jeux complets
  protected readonly jeux = signal<JeuDto[]>([]);

  // ===== modale edit (comme page jeux) =====
  protected readonly showForm = signal(false);
  protected readonly editingJeu = signal<JeuDto | null>(null);

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
      this.reloadJeux(festId);
    });
  }

  private reloadJeux(festivalId: number) {
    this.gestionSvc.loadJeuxCompletsPourFestival(festivalId).subscribe((list) => {
      this.jeux.set(list ?? []);
    });
  }

  protected onDetail(id: number) {
    this.router.navigate(['/jeux', id], { queryParams: { returnUrl: this.router.url } });
  }

  protected onDelete(id: number) {
    this.jeuService.delete(id);

    this.jeux.update(list => list.filter(j => j.id !== id));
  }

  protected onUpdate(id: number) {
    this.jeuService.getById(id).subscribe({
      next: (jeu) => {
        this.editingJeu.set(jeu);
        this.showForm.set(true);
      },
      error: (err) => console.error('Erreur lors du chargement du jeu pour édition', err)
    });
  }

  protected onFormClosed() {
    this.showForm.set(false);
    this.editingJeu.set(null);

    const festId = this.currentFestival()?.id;
    if (festId) this.reloadJeux(festId);
  }
}
