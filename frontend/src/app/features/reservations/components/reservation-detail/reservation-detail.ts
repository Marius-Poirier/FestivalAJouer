import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { ReservationsService } from '@reservations/services/reservations-service';
import { EditeurService } from '@editeurs/services/editeur-service';
import { FestivalService } from '@festivals/services/festival-service';
import { ReservationDto } from '@interfaces/entites/reservation-dto';
import { StatutReservationWorkflow } from '@enum/statut-workflow-reservation';
import { PopupDelete } from '@sharedComponent/popup-delete/popup-delete';
import { AuthService } from '@core/services/auth-services';
import { ReservationInfo } from 'src/app/features/gestion-reservation/components/reservation-info/reservation-info';
import { ReservationTable } from 'src/app/features/gestion-reservation/components/reservation-table/reservation-table';
import { WorkflowReservationJeux } from 'src/app/features/gestion-reservation/components/workflow-reservation-jeux/workflow-reservation-jeux';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatRadioModule,
    PopupDelete,
    ReservationInfo,
    ReservationTable,
    WorkflowReservationJeux
  ],
  templateUrl: './reservation-detail.html',
  styleUrl: './reservation-detail.css'
})
export class ReservationDetail {

  protected reservationsvc = inject(ReservationsService);
  private editeurSvc = inject(EditeurService);
  private festivalSvc = inject(FestivalService);
  private route = inject(ActivatedRoute);
  protected authSvc = inject(AuthService);

  protected readonly reservation = signal<ReservationDto | null>(null);
  protected readonly editeur = signal<any | null>(null);
  protected readonly festival = signal<any | null>(null);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly showDeletePopup = signal<boolean>(false);
  protected readonly reservationId = computed(() => this.reservation()?.id ?? null);
  protected readonly festivalId = computed(() => this.reservation()?.festival_id ?? null);


  public activeTab = signal<'informations' | 'tables' | 'jeux' | 'workflow'>('informations');

  public workflowLabel = computed(() => {
    const res = this.reservation();
    if (!res?.statut_workflow) return '';
    return this.formatWorkflowLabel(res.statut_workflow);
  });



  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isInteger(id)) {
      this.error.set('Identifiant de réservation invalide');
      this.isLoading.set(false);
      return;
    }

    this.reservationsvc.loadOne(id).subscribe({
      next: (res) => {
        this.reservation.set(res);
        
        // Charger le festival
        if (res.festival_id) {
          const localFestival = this.festivalSvc.findById(res.festival_id);
          if (localFestival) {
            this.festival.set(localFestival);
          } else {
            this.festivalSvc.loadOne(res.festival_id).subscribe({
              next: (fest) => {
                this.festival.set(fest);
              },
              error: () => {
                console.error('Erreur lors du chargement du festival');
              }
            });
          }
        }
        
        // Charger l'éditeur
        if (res.editeur_id) {
          const localEditeur = this.editeurSvc.findByIdLocal(res.editeur_id);
          if (localEditeur) {
            this.editeur.set(localEditeur);
            this.isLoading.set(false);
          } else {
            this.editeurSvc.loadOne(res.editeur_id).subscribe({
              next: (edi) => {
                this.editeur.set(edi);
                this.isLoading.set(false);
              },
              error: () => {
                this.isLoading.set(false);
              }
            });
          }
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.error.set('Impossible de charger cette réservation');
        this.isLoading.set(false);
      }
    });
  }

  public setActiveTab(tab: 'informations' | 'tables' | 'jeux' | 'workflow'): void {
    this.activeTab.set(tab);
  }

  public onTabChange(event: any): void {
    this.activeTab.set(event.value);
  }

  public onModifier(): void {
    console.log('Ouverture de la modale de modification (à implémenter)');
  }

  public onSupprimer(): void {
    this.showDeletePopup.set(true);
  }

  public onConfirmDelete(): void {
    const res = this.reservation();
    if (!res?.id) {
      this.error.set('Réservation introuvable');
      this.showDeletePopup.set(false);
      return;
    }
    this.reservationsvc.delete(res.id);
    this.showDeletePopup.set(false);
  }

  public onCancelDelete(): void {
    this.showDeletePopup.set(false);
  }

  // Méthode privée pour formater le statut workflow
  private formatWorkflowLabel(statut: StatutReservationWorkflow): string {
    const labels: Record<string, string> = {
      'PAS_CONTACTE': 'Pas contacté',
      'CONTACT_PRIS': 'Contact pris',
      'DISCUSSION_EN_COURS': 'Discussion en cours',
      'SERA_ABSENT': 'Sera absent',
      'CONSIDERE_ABSENT': 'Considéré absent',
      'PRESENT': 'Présent',
      'FACTURE': 'Facturé',
      'PAIEMENT_RECU': 'Paiement reçu',
      'PAIEMENT_EN_RETARD': 'Paiement en retard'
    };
    const key = String(statut).toUpperCase();
    return labels[key] || statut;
  }
}
