import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { ReservationDto } from '@interfaces/entites/reservation-dto';
import { PopupDelete } from '@sharedComponent/popup-delete/popup-delete';
import { FormBuilder, Validators } from '@angular/forms';
import { ReservationsService } from '../../services/reservations-service';
import { EditeurService } from '@editeurs/services/editeur-service';
import { StatutReservationWorkflow } from '@enum/statut-workflow-reservation';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, PopupDelete, CurrencyPipe],
  templateUrl: './reservation-card.html',
  styleUrl: './reservation-card.css'
})
export class ReservationCard {
  protected ressvc = inject(ReservationsService)
  private editeursvc = inject(EditeurService)
  private router = inject(Router)

  public readonly idReservation = input<number>();
  public readonly tablesCount = input<number>(0);
  public update = output<number>();
  public canManage = input<boolean>(false);


  // Signals pour la popup
  public deleteType = signal<string | null>(null);
  public deleteId = signal<number | null>(null);
  public deletenom = signal<string>('');


  protected reservation = computed(()=>{
    const id = this.idReservation()
    if(id !== undefined){
      return this.ressvc.findById(id) 
    }
    return undefined;
  })

  protected editeur = computed(() => {
    const reservation = this.reservation()
    if (reservation && reservation.editeur_id) {
      return this.editeursvc.findByIdLocal(reservation.editeur_id)
    }
    return undefined
  })

  protected workflowLabel = computed(() => {
    const res = this.reservation()
    if (!res) return 'Statut inconnu'
    const labels: Record<StatutReservationWorkflow, string> = {
      [StatutReservationWorkflow.PAS_CONTACTE]: 'Pas contacté',
      [StatutReservationWorkflow.CONTACT_PRIS]: 'Contact pris',
      [StatutReservationWorkflow.DISCUSSION_EN_COURS]: 'Discussion en cours',
      [StatutReservationWorkflow.SERA_ABSENT]: 'Sera absent',
      [StatutReservationWorkflow.CONSIDERE_ABSENT]: 'Considéré absent',
      [StatutReservationWorkflow.PRESENT]: 'Présent',
      [StatutReservationWorkflow.FACTURE]: 'Facturé',
      [StatutReservationWorkflow.PAIEMENT_RECU]: 'Paiement reçu',
      [StatutReservationWorkflow.PAIEMENT_EN_RETARD]: 'Paiement en retard'
    }
    return labels[res.statut_workflow] ?? 'Statut inconnu'
  })
  

  // -------- Gestion de popup supression
  public openDeletePopup(reservation: ReservationDto): void {
    this.deleteType.set('reservation');
    this.deleteId.set(reservation.id ?? null);
    this.deletenom.set(this.editeur()?.nom ?? `Réservation #${reservation.id ?? ''}`);
  }

  public handleCancel(): void {
    this.closePopup();
  }

  private closePopup(): void {
    this.deleteType.set(null);
    this.deleteId.set(null);
    this.deletenom.set('');
  }


  public handleConfirm(): void {
    const id = this.deleteId();
    if (id !== null) {
      this.ressvc.delete(id);
    }
    this.closePopup();
  }

  public navigateToDetail(id: number): void {
    this.router.navigate(['/reservations', id]);
  }

}
