import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { JeuCard } from '@jeux/components/jeu-card/jeu-card';
import { JeuForm } from '@jeux/components/jeu-form/jeu-form';
import { GestionReservationService } from '@gestion-reservation/services/gestion-reservation-service';
import { CurrentFestival } from '@core/services/current-festival';
import { JeuDto } from '@interfaces/entites/jeu-dto';
import { JeuService } from '@jeux/services/jeu-service';

type TablePlacement = { tableId: number; zoneNom: string };
type JeuPlacementView = { placements: TablePlacement[] };

const ZONE_UNASSIGNED = '__UNASSIGNED__';

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

  // placements (clé = Jeu.id) -> liste {tableId, zoneNom}
  protected readonly placementsByJeuId = signal<Record<number, JeuPlacementView>>({});

  // ===== modale edit =====
  protected readonly showForm = signal(false);
  protected readonly editingJeu = signal<JeuDto | null>(null);

  // ===== filtre texte =====
  protected readonly searchTerm = signal<string>('');
  protected onSearch(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.searchTerm.set(target?.value ?? '');
  }

  // ===== filtre zones (chips) =====
  /** set des zones cochées (vide => toutes) */
  protected readonly selectedZones = signal<Set<string>>(new Set());

  protected toggleZone(zone: string, activeNext: boolean) {
    const next = new Set(this.selectedZones());
    if (activeNext) next.add(zone);
    else next.delete(zone);
    this.selectedZones.set(next);
  }

  protected clearZones() {
    this.selectedZones.set(new Set());
  }

  /** options de zones à afficher (issues des placements) + "Non attribué" si utile */
  protected readonly zoneOptions = computed(() => {
    const zones = new Set<string>();

    // zones présentes dans les placements
    for (const view of Object.values(this.placementsByJeuId())) {
      for (const p of view.placements) zones.add(p.zoneNom);
    }

    const list = Array.from(zones).sort((a, b) => a.localeCompare(b));

    // ajouter "Non attribué" si au moins un jeu n'a pas de placement
    const hasUnassigned = this.jeux().some(j => {
      const id = j.id;
      if (!id) return true;
      const v = this.placementsByJeuId()[id];
      return !v || v.placements.length === 0;
    });

    return hasUnassigned ? [ZONE_UNASSIGNED, ...list] : list;
  });

  protected zoneLabel(zone: string): string {
    return zone === ZONE_UNASSIGNED ? 'Non attribué' : zone;
  }

  // ===== liste filtrée (texte + zones) =====
  protected readonly filteredJeux = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.jeux();

    const selected = this.selectedZones();
    const placementsMap = this.placementsByJeuId();

    return list.filter(j => {
      // filtre texte
      if (term && !(j.nom ?? '').toLowerCase().includes(term)) return false;

      // filtre zone
      if (selected.size === 0) return true; // rien coché => tout

      const id = j.id;
      const view = id ? placementsMap[id] : null;
      const placements = view?.placements ?? [];

      // jeu non attribué
      if (placements.length === 0) {
        return selected.has(ZONE_UNASSIGNED);
      }

      // jeu attribué : au moins une de ses zones match
      return placements.some(p => selected.has(p.zoneNom));
    });
  });

  constructor() {
    effect(() => {
      const festId = this.currentFestival()?.id;
      if (!festId) {
        this.jeux.set([]);
        this.placementsByJeuId.set({});
        this.selectedZones.set(new Set());
        return;
      }
      this.reloadJeux(festId);
    });
  }

  private reloadJeux(festivalId: number) {
    forkJoin({
      jeux: this.gestionSvc.loadJeuxCompletsPourFestival(festivalId),
      placements: this.gestionSvc.getJeuxPlacementsForFestival(festivalId),
    }).subscribe(({ jeux, placements }) => {
      this.jeux.set(jeux ?? []);

      const map: Record<number, JeuPlacementView> = {};

      for (const p of placements ?? []) {
        const entry = map[p.jeu_id] ?? { placements: [] };

        // éviter doublon exact
        const exists = entry.placements.some(x => x.tableId === p.table_id && x.zoneNom === p.zone_du_plan_nom);
        if (!exists) {
          entry.placements.push({ tableId: p.table_id, zoneNom: p.zone_du_plan_nom });
        }

        map[p.jeu_id] = entry;
      }

      // tri stable
      for (const key of Object.keys(map)) {
        map[Number(key)].placements.sort((a, b) => {
          if (a.zoneNom !== b.zoneNom) return a.zoneNom.localeCompare(b.zoneNom);
          return a.tableId - b.tableId;
        });
      }

      this.placementsByJeuId.set(map);
    });
  }

  protected getPlacementForJeu(jeuId?: number): JeuPlacementView | null {
    if (!jeuId) return null;
    return this.placementsByJeuId()[jeuId] ?? null;
  }

  protected formatPlacementsTooltip(view: JeuPlacementView): string {
    return view.placements.map(p => `#${p.tableId} (${p.zoneNom})`).join(' | ');
  }

  // ===== actions =====
  protected onDetail(id: number) {
    this.router.navigate(['/jeux', id], { queryParams: { returnUrl: this.router.url } });
  }

  protected onDelete(id: number) {
    this.jeuService.delete(id);
    this.jeux.update(list => list.filter(j => j.id !== id));

    this.placementsByJeuId.update(map => {
      const copy = { ...map };
      delete copy[id];
      return copy;
    });
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
