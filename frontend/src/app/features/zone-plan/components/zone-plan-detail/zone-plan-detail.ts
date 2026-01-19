import { Component, inject, signal, input, effect, OnInit, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableJeuDto } from '@interfaces/entites/table-jeu-dto';
import { TablesService } from '@tables/services/tables-service';
import { ZonePlanService } from '../../services/zone-plan-service';
import { ZoneDuPlanDto } from '@interfaces/entites/zone-du-plan-dto';
import { ZoneTarifaireService } from '@zoneTarifaires/services/zone-tarifaire-service';
import { ZoneTarifaireDto } from '@interfaces/entites/zone-tarifaire-dto';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth-services';
import { FormsModule } from '@angular/forms';
import { ReservationTable } from '@gestion-reservation/components/reservation-table/reservation-table';
import { TablesList } from '@tables/components/tables-list/tables-list';
import { JeuService } from '@jeux/services/jeu-service';

@Component({
  selector: 'app-zone-plan-detail',
  imports: [CommonModule, FormsModule, TablesList],
  templateUrl: './zone-plan-detail.html',
  styleUrl: './zone-plan-detail.css'
})
export class ZonePlanDetail {
  // Inputs
  public zonePlanId = input<number | null>(null);
  
  // Services
  private route = inject(ActivatedRoute);
  public tablesSvc = inject(TablesService);
  private zonePlanSvc = inject(ZonePlanService);
  private zoneTarifaireSvc = inject(ZoneTarifaireService);
  protected authService = inject(AuthService);
  private readonly jeuSvc = inject(JeuService);

  // État
  protected readonly zonePlan = signal<ZoneDuPlanDto | null>(null);
  protected readonly zoneTarifaire = signal<ZoneTarifaireDto | null>(null);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly toastMessage = signal<string | null>(null);
  protected readonly showToast = signal<boolean>(false);
  
  // Tables
  // Tables: bind directly to the service signal for live updates
  readonly tables = this.tablesSvc.tables;
  

  protected showAddForm = signal<boolean>(false);
  protected newTableCapacite = signal<number>(2);


  protected readonly nombreTablesComputed = computed(() => this.tables().length);

  private lastZoneTarifaireLoaded: number | null = null;

  constructor() {
    // Effect 1: Charge les tables quand zonePlanId change
    effect(() => {
      const id = this.zonePlanId();
      if (id) {
        this.loadZonePlanTables(id);
      }
    });

    // Effect 2: Lazy-load zone tarifaire
    effect(() => {
      const id = this.zonePlan()?.zone_tarifaire_id;

      if (!id) {
        this.resetZoneTarifaire();
        return;
      }

      const cached = this.zoneTarifaireSvc.findById(id);
      if (cached) {
        this.updateZoneTarifaire(cached, id);
        return;
      }

      if (this.lastZoneTarifaireLoaded === id) return;

      this.zoneTarifaireSvc.loadOne(id).subscribe({
        next: (zone) => this.updateZoneTarifaire(zone, id),
        error: () => this.resetZoneTarifaire()
      });
    });
  }

  ngOnInit() {
    const id = this.getIdFromRoute();
    if (!id) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.zonePlanSvc.loadOne(id).subscribe({
      next: (zone) => {
        this.zonePlan.set(zone);
        this.loadZonePlanTables(id);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la zone du plan', err);
        this.error.set('Impossible de charger cette zone du plan');
        this.isLoading.set(false);
      }
    });
  }

  private getIdFromRoute(): number | null {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isInteger(id)) {
      this.error.set('Identifiant de zone du plan invalide');
      this.isLoading.set(false);
      return null;
    }
    return id;
  }

  private loadZonePlanTables(zonePlanId: number): void {
    this.tablesSvc.getTablesByZonePlan(zonePlanId).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tables', err);
        this.isLoading.set(false);
      }
    });
  }

  private updateZoneTarifaire(zone: ZoneTarifaireDto, id: number): void {
    this.zoneTarifaire.set(zone);
    this.lastZoneTarifaireLoaded = id;
  }

  private resetZoneTarifaire(): void {
    this.zoneTarifaire.set(null);
    this.lastZoneTarifaireLoaded = null;
  }

  protected toggleAddForm(): void {
    this.showAddForm.update(v => !v);
    if (!this.showAddForm()) {
      this.newTableCapacite.set(10);
    }
  }

  protected capaciteFor(table?: TableJeuDto | null): string {
    if (!table) return '0/2';
    const current = table.nb_jeux_actuels ?? 0;
    const capacity = table.capacite_jeux ?? 2;
    return `${current}/${capacity}`;
  }

  protected addTable(): void {
    const zp = this.zonePlan();
    if (!zp?.id || !zp?.zone_tarifaire_id) {
      console.error('Zone du plan ou zone tarifaire manquante');
      return;
    }

    const newTable: TableJeuDto = {
      zone_du_plan_id: zp.id,
      zone_tarifaire_id: zp.zone_tarifaire_id,
      capacite_jeux: this.newTableCapacite()
    };

    this.tablesSvc.add(newTable);

    this.showAddForm.set(false);
    this.newTableCapacite.set(10);
  }

  protected onDeleteTable(table: TableJeuDto): void {
    if (!table?.id) return;

    this.error.set(null);
    this.toastMessage.set(null);
    this.showToast.set(false);

    this.tablesSvc.hasReservationForTable(table.id).subscribe({
      next: (hasReservation) => {
        if (hasReservation) {
          const msg = 'Impossible de supprimer : une réservation existe pour cette table.';
          this.toastMessage.set(msg);
          this.showToast.set(true);
          setTimeout(() => this.showToast.set(false), 2000);
          return;
        }
        this.tablesSvc.delete(table.id!);
      },
      error: (err) => {
        console.error('Erreur lors du contrôle des réservations pour la table', err);
        this.error.set('Erreur lors de la vérification des réservations.');
      }
    });
  }

  protected closeToast(): void {
    this.showToast.set(false);
  }

  protected goToWorkflow() {
   
    window.location.href = '/workflow';
  }
}
