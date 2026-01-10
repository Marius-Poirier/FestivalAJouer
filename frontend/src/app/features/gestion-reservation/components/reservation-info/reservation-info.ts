import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, input, effect } from '@angular/core';
import { ReservationDto } from '@interfaces/entites/reservation-dto';
import { CurrentFestival } from '@core/services/current-festival';
import { ReservationTable } from '../reservation-table/reservation-table';
import { TableJeuDto } from '@interfaces/entites/table-jeu-dto';
import { GestionReservationService } from '@gestion-reservation/services/gestion-reservation-service';

@Component({
  selector: 'app-reservation-info',
  standalone: true, 
  imports: [CommonModule, DatePipe],
  templateUrl: './reservation-info.html',
  styleUrl: './reservation-info.css'
})
export class ReservationInfo {
  public reservation = input<ReservationDto | null>(null);
  private gestionresvationsvc = inject(GestionReservationService)
  public editeurNom = input<string | null>(null);


  

  private currentFestival = inject(CurrentFestival);
  protected nbr_tables = computed(()=>{
    return this.gestionresvationsvc.tables().length

  })
  protected prix_total = computed(()=> this.reservation()?.prix_total);
  protected prix_final = computed(()=> this.reservation()?.prix_final)
  protected createdAt = computed(() => this.toDate(this.reservation()?.created_at));
  protected updatedAt = computed(() => this.toDate(this.reservation()?.updated_at));

  constructor() {
    effect(() => {
      const res = this.reservation();
      if (res?.id) {
        this.gestionresvationsvc.loadTableDetailsForReservation(res.id).subscribe();
      }
    });
  }

  private toDate(value: Date | string | undefined | null): Date | null {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

}
