import { Component, computed, inject, signal, effect } from '@angular/core';
import { EditeurService } from '@editeurs/services/editeur-service';
import { EditeurDto } from '@interfaces/entites/editeur-dto';
import { AuthService } from '@core/services/auth-services';
import { EditeurCard } from '../editeur-card/editeur-card';
import { EditeurForm } from '../editeur-form/editeur-form';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { StatutReservationWorkflow } from '@enum/statut-workflow-reservation';

@Component({
  selector: 'app-editeur-list-festival',
  imports: [EditeurCard, EditeurForm, MatIconModule],
  templateUrl: './editeur-list-festival.html',
  styleUrl: './editeur-list-festival.css'
})
export class EditeurListFestival {

  protected readonly editeursvc = inject(EditeurService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly http = inject(HttpClient);

  // form visible ?
  protected readonly showForm = signal(false);
  // éditeur en cours d'édition (null = création)
  protected readonly editingEditeur = signal<EditeurDto | null>(null);

  // =========================
  // ===== filtre texte ======
  // =========================
  protected readonly searchTerm = signal<string>('');

  protected onSearch(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.searchTerm.set(target?.value ?? '');
  }

  // =========================
  // ===== filtre statut =====
  // =========================

  /** set des statuts cochés (vide => tous) */
  protected readonly selectedStatuts = signal<Set<StatutReservationWorkflow>>(new Set());

  /** editeur_id -> statut_workflow pour le festival courant */
  protected readonly statutByEditeur = signal<Map<number, StatutReservationWorkflow>>(new Map());

  /** liste des statuts à afficher (issus de l'enum) */
  protected readonly statutOptions = Object.values(StatutReservationWorkflow);

  /** labels */
  protected readonly statutLabels: Record<StatutReservationWorkflow, string> = {
    [StatutReservationWorkflow.PAS_CONTACTE]: 'Pas contacté',
    [StatutReservationWorkflow.CONTACT_PRIS]: 'Contact pris',
    [StatutReservationWorkflow.DISCUSSION_EN_COURS]: 'Discussion en cours',
    [StatutReservationWorkflow.SERA_ABSENT]: 'Sera absent',
    [StatutReservationWorkflow.CONSIDERE_ABSENT]: 'Considéré absent',
    [StatutReservationWorkflow.PRESENT]: 'Présent',
    [StatutReservationWorkflow.FACTURE]: 'Facturé',
    [StatutReservationWorkflow.PAIEMENT_RECU]: 'Paiement reçu',
    [StatutReservationWorkflow.PAIEMENT_EN_RETARD]: 'Paiement en retard'
  };

  protected toggleStatut(statut: StatutReservationWorkflow, checked: boolean) {
    const next = new Set(this.selectedStatuts());
    if (checked) next.add(statut);
    else next.delete(statut);
    this.selectedStatuts.set(next);
  }

  protected clearStatuts() {
    this.selectedStatuts.set(new Set());
  }

  // =========================
  // ===== liste filtrée =====
  // =========================
  protected readonly filteredEditeurs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.editeursvc.editeurs();

    const selected = this.selectedStatuts();
    const map = this.statutByEditeur();

    return list.filter(e => {
      // filtre texte
      if (term && !e.nom.toLowerCase().includes(term)) return false;

      // filtre statut
      if (selected.size === 0) return true; // aucun coché => tous
      const statut = e.id ? map.get(e.id) : undefined;
      return statut ? selected.has(statut) : false;
    });
  });

  constructor() {
    // Charger les statuts workflow des réservations du festival courant
    effect(() => {
      const festId = this.editeursvc.currentFestival()?.id;
      if (!festId) {
        this.statutByEditeur.set(new Map());
        return;
      }

      const params = new HttpParams().set('festivalId', String(festId));

      this.http.get<any[]>(`${environment.apiUrl}/reservations`, { params, withCredentials: true })
        .subscribe({
          next: (rows) => {
            const map = new Map<number, StatutReservationWorkflow>();
            for (const r of (rows ?? [])) {
              const edId = Number(r?.editeur_id);
              const st = this.toFrontWorkflow(r?.statut_workflow);
              if (Number.isFinite(edId) && st) map.set(edId, st);
            }
            this.statutByEditeur.set(map);
          },
          error: () => this.statutByEditeur.set(new Map())
        });
    });
  }

  // éditer
  protected onUpdate(id: number) {
    const edi = this.editeursvc.findByIdLocal(id);
    if (edi) {
      this.editingEditeur.set(edi);
      this.showForm.set(true);
    }
  }

  // détail
  protected onDetail(id: number) {
    this.router.navigate(['/editeurs', id]);
  }

  // supprimer
  protected onDelete(id: number) {
    this.editeursvc.delete(id);
  }

  // fermeture form
  protected closeForm() {
    this.showForm.set(false);
    this.editingEditeur.set(null);
  }

  protected openCreateForm() {
    this.editingEditeur.set(null);
    this.showForm.set(true);
  }

  private toFrontWorkflow(value: unknown): StatutReservationWorkflow | null {
    if (typeof value !== 'string') return null;

    const upper = value.toUpperCase() as StatutReservationWorkflow;

    // Vérifie que ça existe bien dans l'enum
    return (Object.values(StatutReservationWorkflow) as string[]).includes(upper)
      ? upper
      : null;
  }
}
