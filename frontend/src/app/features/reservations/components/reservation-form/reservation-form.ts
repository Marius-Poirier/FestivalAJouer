import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { StatutReservationWorkflow } from '@enum/statut-workflow-reservation';
import { ReservationsService } from '@reservations/services/reservations-service';
import { EditeurService } from '@editeurs/services/editeur-service';
import { ZoneTarifaireService } from '@zoneTarifaires/services/zone-tarifaire-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.css'
})
export class ReservationForm {
  public ressvc = inject(ReservationsService)
  public editeursvc = inject(EditeurService)
  public zonetarifsvc = inject(ZoneTarifaireService)
  private router = inject(Router)
  private fb = new FormBuilder();

  // Quantité de tables choisies par zone tarifaire (clé = id de zone)
  private readonly zoneSelections = signal<Record<number, number>>({});

  // Options d'éditeurs (dérivées du signal du service)
  protected editeurOptions = computed(() =>
    this.editeursvc.editeurs().map(e => ({ id: e.id!, nom: e.nom }))
  );

  protected workflowOptions = Object.values(StatutReservationWorkflow);

  protected festivalName = computed(() => this.ressvc.currentfestival()?.nom ?? '');

  protected zonesTarifaires = this.zonetarifsvc.zonesTarifaires;

  private readonly currentFestivalId = this.ressvc.currentfestival()?.id ?? null;

  // Form principal
  protected readonly form = this.fb.group({
    editeur_id: [null as number | null, Validators.required],
    festival_id: [this.currentFestivalId, Validators.required],
    statut_workflow: [StatutReservationWorkflow.PAS_CONTACTE, Validators.required],
    editeur_presente_jeux: [false],
    prix_total: [null as number | null, [Validators.required, Validators.min(0)]],
    prix_final: [null as number | null, [Validators.required, Validators.min(0)]],
    remise_pourcentage: [0 as number | null, [Validators.min(0)]],
    remise_montant: [null as number | null, [Validators.min(0)]],
    commentaires_paiement: ['']
  });

  private readonly remisePourcentageSignal = toSignal(
    this.form.controls.remise_pourcentage.valueChanges,
    { initialValue: this.form.controls.remise_pourcentage.value ?? 0 }
  );

  constructor() {
    this.editeursvc.loadAll();
    this.zonetarifsvc.loadAll();

    // Injecter les zones tarifaires dans les sélections avec valeur par défaut 0
    effect(() => {
      const zones = this.zonetarifsvc.zonesTarifaires();
      const current = this.zoneSelections();
      let changed = false;
      const next: Record<number, number> = { ...current };

      for (const zone of zones) {
        if (zone.id == null) continue;
        if (next[zone.id] == null) {
          next[zone.id] = 0;
          changed = true;
        }
      }

      if (changed) {
        this.zoneSelections.set(next);
      }
    });

    // Recalcule prix total et prix final en fonction des quantités et de la remise
    effect(() => {
      const zones = this.zonetarifsvc.zonesTarifaires();
      const selections = this.zoneSelections();
      const remisePourcentage = this.remisePourcentageSignal() ?? 0;

      const total = zones.reduce((acc, zone) => {
        if (zone.id == null) return acc;
        const qty = selections[zone.id] ?? 0;
        return acc + qty * (zone.prix_table ?? 0);
      }, 0);

      const remise = total * (remisePourcentage / 100);
      const final = Math.max(total - remise, 0);

      this.form.patchValue(
        { prix_total: total, prix_final: final },
        { emitEvent: false }
      );
    });
  }

  protected selectedTables(zoneId: number): number {
    return this.zoneSelections()[zoneId] ?? 0;
  }

  protected updateZoneTables(zoneId: number, value: string | number): void {
    const parsed = Number(value);
    const qty = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
    this.zoneSelections.update(curr => ({ ...curr, [zoneId]: qty }));
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload = {
      editeur_id: raw.editeur_id!,
      festival_id: raw.festival_id!,
      statut_workflow: raw.statut_workflow ?? StatutReservationWorkflow.PAS_CONTACTE,
      editeur_presente_jeux: !!raw.editeur_presente_jeux,
      prix_total: raw.prix_total ?? 0,
      prix_final: raw.prix_final ?? 0,
      remise_pourcentage: raw.remise_pourcentage ?? 0,
      remise_montant: raw.remise_montant ?? undefined,
      commentaires_paiement: raw.commentaires_paiement ?? '',
      paiement_relance: false,
      date_facture: undefined,
      date_paiement: undefined
    } as const;

    this.ressvc.add(payload)?.subscribe(res => {
      if (res) {
        this.router.navigate(['/workflow'], { state: { tab: 5 } });
      }
    });
  }

}
