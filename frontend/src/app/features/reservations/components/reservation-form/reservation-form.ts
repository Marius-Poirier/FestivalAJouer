import { Component, inject, output, effect, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { StatutReservationWorkflow } from '@enum/statut-workflow-reservation';
import { ReservationsService } from '@reservations/services/reservations-service';
import { EditeurService } from '@editeurs/services/editeur-service';
import { Router } from '@angular/router';
import { ReservationDto } from '@interfaces/entites/reservation-dto';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatButtonModule,MatSelectModule,MatCheckboxModule],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.css'
})
export class ReservationForm {
  private readonly fb = inject(FormBuilder)
  protected readonly ressvc = inject(ReservationsService)
  protected readonly editeursvc = inject(EditeurService)
  private readonly router = inject(Router)

  reservation = input<ReservationDto | null>(null);
  
  public closeForm = output<void>()

  protected readonly workflowOptions = [
    { value: StatutReservationWorkflow.PAS_CONTACTE, label: 'Pas contacté' },
    { value: StatutReservationWorkflow.CONTACT_PRIS, label: 'Contact pris' },
    { value: StatutReservationWorkflow.DISCUSSION_EN_COURS, label: 'Discussion en cours' },
    { value: StatutReservationWorkflow.SERA_ABSENT, label: 'Sera absent' },
    { value: StatutReservationWorkflow.CONSIDERE_ABSENT, label: 'Considéré absent' },
    { value: StatutReservationWorkflow.PRESENT, label: 'Présent' },
    { value: StatutReservationWorkflow.FACTURE, label: 'Facturé' },
    { value: StatutReservationWorkflow.PAIEMENT_RECU, label: 'Paiement reçu' },
    { value: StatutReservationWorkflow.PAIEMENT_EN_RETARD, label: 'Paiement en retard' }
  ];

  protected readonly form = this.fb.group({
    editeur_id: [null as number | null, Validators.required],
    statut_workflow: [StatutReservationWorkflow.PAS_CONTACTE, Validators.required],
    editeur_presente_jeux: [false],
    remise_pourcentage: [null as number | null, [Validators.min(0), Validators.max(100)]],
    remise_montant: [null as number | null, [Validators.min(0)]],
    commentaires_paiement: ['']
  });

  constructor() {
    this.editeursvc.loadAll();
    effect(() => {
      const pourcentage = this.form.controls.remise_pourcentage.value;
      if (pourcentage != null && pourcentage > 0) {
        this.form.controls.remise_montant.disable({ emitEvent: false });
      } else {
        this.form.controls.remise_montant.enable({ emitEvent: false });
      }
    });
    effect(() => {
      const montant = this.form.controls.remise_montant.value;
      if (montant != null && montant > 0) {
        this.form.controls.remise_pourcentage.disable({ emitEvent: false });
      } else {
        this.form.controls.remise_pourcentage.enable({ emitEvent: false });
      }
    });
    effect(() => {
      const res = this.reservation();
      if (res) {
        // Mode édition : on pré-remplit le formulaire
        this.form.patchValue({
          editeur_id: res.editeur_id,
          statut_workflow: res.statut_workflow,
          editeur_presente_jeux: res.editeur_presente_jeux,
          remise_pourcentage: res.remise_pourcentage || null,
          remise_montant: res.remise_montant || null,
          commentaires_paiement: '' // Vide pour ajouter un nouveau commentaire
        });
        
        // Désactiver le champ éditeur en mode édition
        this.form.controls.editeur_id.disable();
      }
    });
  }

  protected close() {
    this.closeForm.emit()
  }

  protected onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const res = this.reservation(); 
    const raw = this.form.getRawValue();

    // MODE ÉDITION
    if (res && res.id) {
      const payload: any = {
        statut_workflow: raw.statut_workflow?.toLowerCase(),
        editeur_presente_jeux: !!raw.editeur_presente_jeux,
        remise_pourcentage: raw.remise_pourcentage !== null ? Number(raw.remise_pourcentage) : null,
        remise_montant: raw.remise_montant !== null ? Number(raw.remise_montant) : null
      };
      if (raw.commentaires_paiement && raw.commentaires_paiement.trim() !== '') {
        const ancienCommentaire = res.commentaires_paiement || '';
        const nouveauCommentaire = raw.commentaires_paiement.trim();
        
        // Format: ancien + séparateur + [date] nouveau
        payload.commentaires_paiement = ancienCommentaire 
          ? `${ancienCommentaire}\n---\n ${nouveauCommentaire}`
          : `${nouveauCommentaire}`;
      }

      console.log('Payload envoyé au backend:', payload); 
      this.ressvc.update(res.id, payload).subscribe({
        next: () => {
          this.closeForm.emit();
        },
        error: (err) => {
          console.error('Erreur lors de la modification', err);
          console.error('Détails erreur:', err.error); 
        }
      });
      return;
    }
    const currentFestival = this.ressvc.currentfestival();
    if (!currentFestival || !currentFestival.id) {
      return;
    }

    const payload = {
      editeur_id: raw.editeur_id!,
      festival_id: currentFestival.id,
      statut_workflow: raw.statut_workflow ?? StatutReservationWorkflow.PAS_CONTACTE,
      editeur_presente_jeux: !!raw.editeur_presente_jeux,
      prix_total: 0,
      prix_final: 0,
      remise_pourcentage: raw.remise_pourcentage ?? 0,
      remise_montant: raw.remise_montant ?? undefined,
      commentaires_paiement: raw.commentaires_paiement ?? '',
      paiement_relance: false,
      date_facture: undefined,
      date_paiement: undefined
    };

    this.ressvc.add(payload)?.subscribe(res => {
      if (res && this.ressvc.error() == null) {
        this.form.reset({
          statut_workflow: StatutReservationWorkflow.PAS_CONTACTE,
          editeur_presente_jeux: false
        });
        this.closeForm.emit();
        if (res.id) {
          this.router.navigate(['/reservations', res.id]);
        }
      }
    });
  }
}
