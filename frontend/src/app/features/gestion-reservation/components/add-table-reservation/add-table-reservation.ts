import { Component, inject, input, effect, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZoneTarifaireService } from '@zoneTarifaires/services/zone-tarifaire-service';
import { ReservationsService } from '@reservations/services/reservations-service';
import { ZonePlanService } from '@zonePlan/services/zone-plan-service';
import { TablesService } from '@tables/services/tables-service';
import { TableJeuDto } from '@interfaces/entites/table-jeu-dto';
import { GestionReservationService } from '@gestion-reservation/services/gestion-reservation-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-table-reservation',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './add-table-reservation.html',
  styleUrl: './add-table-reservation.css'
})
export class AddTableReservation {
  private readonly zoneTarifaireService = inject(ZoneTarifaireService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly zonePlanService = inject(ZonePlanService);
  private readonly tablesService = inject(TablesService);
  private readonly gestionReservationService = inject(GestionReservationService);

  reservationId = input<number>();
  protected selectedZonePlanId = signal<number | null>(null);
  protected selectedTableId = signal<number | null>(null);


  // Liste des zones du plan
  protected readonly zonesDuPlan = computed(() => {
    return this.zonePlanService.zonesPlan();
  });
  protected readonly availableTables = signal<TableJeuDto[]>([]);

  /**
   * Charge les tables disponibles (statut LIBRE) pour une zone du plan donnée
   */
  public loadAvailableTables(zonePlanId: number): void {
    if (!zonePlanId) {
      console.warn('Zone plan ID manquant');
      this.availableTables.set([]);
      return;
    }
    console.log('Chargement des tables pour la zone du plan:', zonePlanId);
    this.tablesService.getAvailableTablesByZonePlan(zonePlanId).subscribe(list => {
      console.log('Tables disponibles mise à jour:', list);
      this.availableTables.set(list ?? []);
    });
  }

  public close = output<void>();
  public added = output<void>();

  public onSelectZonePlan(id: number) {
    this.selectedZonePlanId.set(id || null);
    this.selectedTableId.set(null);
    if (id) {
      this.loadAvailableTables(id);
    } else {
      this.availableTables.set([]);
    }
  }

  public onSelectTable(id: number) {
    this.selectedTableId.set(id || null);
  }

  public onSubmitAdd() {
    const resId = this.reservationId();
    const tableId = this.selectedTableId();
    if (!resId || !tableId) return;
    this.gestionReservationService.addTable(resId, tableId);
    this.added.emit();
    this.close.emit();
  }


  constructor() {
    effect(() => {
      const resId = this.reservationId();
      if (!resId) return;

      const cached = this.reservationsService.findById(resId);
      if (cached?.festival_id) {
        this.zonePlanService.loadAll(cached.festival_id);
        this.zoneTarifaireService.loadAll(cached.festival_id);
        return;
      }
      this.reservationsService.loadOne(resId).subscribe(reservation => {
        if (reservation?.festival_id) {
          this.zonePlanService.loadAll(reservation.festival_id);
          this.zoneTarifaireService.loadAll(reservation.festival_id);
        }
      });
    });
  }

}
