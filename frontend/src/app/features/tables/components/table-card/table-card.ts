import { Component, input, output, computed, inject, signal, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonePlanService } from '@zonePlan/services/zone-plan-service';
import { ZoneTarifaireService } from '@zoneTarifaires/services/zone-tarifaire-service';
import { ZoneDuPlanDto } from '@interfaces/entites/zone-du-plan-dto';
import { ZoneTarifaireDto } from '@interfaces/entites/zone-tarifaire-dto';
import { TableJeuDto } from '@interfaces/entites/table-jeu-dto';
import { TablesService } from '@tables/services/tables-service';

@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-card.html',
  styleUrl: './table-card.css'
})
export class TableCard {

  table = input<TableJeuDto>();
  onRemove = output<number>();

  private zonePlanSvc = inject(ZonePlanService);
  private zoneTarifaireSvc = inject(ZoneTarifaireService);
  private readonly zonePlanFetched = signal<ZoneDuPlanDto | null>(null);
  private readonly zoneTarifaireFetched = signal<ZoneTarifaireDto | null>(null);
  private lastZonePlanLoaded: number | null = null;
  private lastZoneTarifaireLoaded: number | null = null;
  public showzoneplan = input<boolean>(false)



  zonePlan = computed(() => {
    const t = this.table();
    if (!t?.zone_du_plan_id) return null;
    const cached = this.zonePlanSvc.findById(t.zone_du_plan_id);
    if (cached) return cached;
    return this.zonePlanFetched();
  });

  zoneTarifaire = computed(() => {
    const t = this.table();
    if (!t?.zone_tarifaire_id) return null;
    const cached = this.zoneTarifaireSvc.findById(t.zone_tarifaire_id);
    if (cached) return cached;
    return this.zoneTarifaireFetched();
  });

  capacite = computed(() => {
    const t = this.table();
    if (!t) return '0/2';
    const current = t.nb_jeux_actuels || 0;
    const capacity = t.capacite_jeux || 2;
    return `${current}/${capacity}`;
  });




  constructor() {
    effect(() => {
      const t = this.table();
      const id = t?.zone_du_plan_id;

      if (!id) {
        this.zonePlanFetched.set(null);
        this.lastZonePlanLoaded = null;
        return;
      }
      if (this.zonePlanSvc.findById(id)) {
        this.zonePlanFetched.set(this.zonePlanSvc.findById(id) ?? null);
        this.lastZonePlanLoaded = id;
        return;
      }

      if (this.lastZonePlanLoaded === id) {
        return;
      }
      this.zonePlanSvc.loadOne(id).subscribe({
        next: (zone) => {
          this.zonePlanFetched.set(zone);
          this.lastZonePlanLoaded = id;
        },
        error: () => {
          this.zonePlanFetched.set(null);
        }
      });
    });

    effect(() => {
      const t = this.table();
      const id = t?.zone_tarifaire_id;

      if (!id) {
        this.zoneTarifaireFetched.set(null);
        this.lastZoneTarifaireLoaded = null;
        return;
      }

      const cached = this.zoneTarifaireSvc.findById(id);
      if (cached) {
        this.zoneTarifaireFetched.set(cached);
        this.lastZoneTarifaireLoaded = id;
        return;
      }

      if (this.lastZoneTarifaireLoaded === id) {
        return;
      }
      this.zoneTarifaireSvc.loadOne(id).subscribe({
        next: (zone) => {
          this.zoneTarifaireFetched.set(zone);
          this.lastZoneTarifaireLoaded = id;
        },
        error: () => {
          this.zoneTarifaireFetched.set(null);
        }
      });
    });
  }



}


