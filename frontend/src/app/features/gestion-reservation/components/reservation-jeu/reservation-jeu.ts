import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '@core/services/auth-services';
import { environment } from '@env/environment';
import { GestionReservationService } from '@gestion-reservation/services/gestion-reservation-service';
import { JeuDto } from '@interfaces/entites/jeu-dto';
import { JeuFestivalViewDto } from '@interfaces/entites/jeu-festival-view-dto';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-reservation-jeu',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './reservation-jeu.html',
  styleUrl: './reservation-jeu.css'
})
export class ReservationJeu {
  public festivalId = input<number | null>(null);
  public reservationId = input<number | null>(null);
  public editeurId = input<number | null>(null);

  private readonly gestionSvc = inject(GestionReservationService);
  private readonly authSvc = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  protected readonly canManage = computed(() => this.authSvc.isAdminSuperorgaOrga());
  protected readonly isLoading = this.gestionSvc.isLoading;
  protected readonly error = this.gestionSvc.error;

  protected readonly reservationJeux = signal<JeuFestivalViewDto[]>([]);

  // Select des jeux de l’éditeur
  protected readonly editeurJeux = signal<JeuDto[]>([]);
  protected readonly isLoadingEditeurJeux = signal(false);
  protected readonly selectedJeuId = signal<number | null>(null);

  protected readonly availableEditeurJeux = computed(() => {
    const already = new Set(this.reservationJeux().map(l => l.jeu_id));
    return this.editeurJeux().filter(j => j.id != null && !already.has(j.id));
  });


  constructor() {
    // charger les jeux de la réservation via la view
    effect(() => {
      const festId = this.festivalId();
      const resId = this.reservationId();
      if (!festId || !resId) return;

      this.gestionSvc.loadJeuxView(festId, resId).subscribe((rows) => {
        // rows est la réponse du backend (view)
        this.reservationJeux.set((rows ?? []) as JeuFestivalViewDto[]);
      });
    });

    // charger les jeux de l’éditeur pour le select
    effect(() => {
      const edId = this.editeurId();
      if (!edId) return;

      this.isLoadingEditeurJeux.set(true);
      this.http
        .get<JeuDto[]>(`${environment.apiUrl}/editeurs/${edId}/jeux`, { withCredentials: true })
        .subscribe({
          next: (rows) => this.editeurJeux.set(rows ?? []),
          error: () => this.editeurJeux.set([]),
          complete: () => this.isLoadingEditeurJeux.set(false)
        });
    });

    effect(() => {
      const selected = this.selectedJeuId();
      if (!selected) return;
      const ok = this.availableEditeurJeux().some(j => j.id === selected);
      if (!ok) this.selectedJeuId.set(null);
    });
  }

  protected openJeuDetail(jeuId: number) {
    const returnUrl = this.router.url;
    this.router.navigate(['/jeux', jeuId], {
      queryParams: { returnUrl },
      queryParamsHandling: 'merge'
    });
  }


  protected addJeuToReservation() {
    if (!this.canManage()) return;

    const festId = this.festivalId();
    const resId = this.reservationId();
    const jeuId = this.selectedJeuId();

    if (!festId || !resId || !jeuId) return;

    this.gestionSvc.addJeuToReservation(festId, resId, jeuId).subscribe(() => {
      // refresh view réservation
      this.gestionSvc.loadJeuxView(festId, resId).subscribe((rows) => {
        this.reservationJeux.set((rows ?? []) as JeuFestivalViewDto[]);
        this.selectedJeuId.set(null);
      });
    });
  }

  protected removeJeu(linkId: number) {
    if (!this.canManage()) return;

    const festId = this.festivalId();
    const resId = this.reservationId();
    if (!festId || !resId) return;

    this.gestionSvc.deleteJeuFromReservation(linkId).subscribe(() => {
      this.gestionSvc.loadJeuxView(festId, resId).subscribe((rows: JeuFestivalViewDto[]) => {
        this.reservationJeux.set(rows ?? []);
      });
    });
  }
}
