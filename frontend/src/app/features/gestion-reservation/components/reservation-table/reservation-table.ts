import { Component, input, signal, effect, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionReservationService } from '../../services/gestion-reservation-service';
import { TableCard } from '@tables/components/table-card/table-card';
import { AddTableReservation } from '@gestion-reservation/components/add-table-reservation/add-table-reservation';

@Component({
  selector: 'app-reservation-table',
  standalone: true,
  imports: [CommonModule, TableCard, AddTableReservation],
  templateUrl: './reservation-table.html',
  styleUrl: './reservation-table.css'
})
export class ReservationTable {
  public reservationId = input<number | null>(null);
  public festivalId = input<number | null>(null);

  private gestionsvc = inject(GestionReservationService);


  public tables = computed(() => this.gestionsvc.tables());
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public isAddTable = signal<boolean>(false);
  public showRemoveConfirm = signal<boolean>(false);
  public tableToRemove = signal<number | null>(null);

  protected prix_total = computed(()=> this.gestionsvc.reservation()?.prix_total);

  constructor() {
    effect(() => {
      const id = this.reservationId();
      if (id) {
        this.loading.set(true);
        this.gestionsvc.loadTableDetailsForReservation(id).subscribe({
          next: () => this.loading.set(false),
          error: (err) => {
            console.error('Erreur lors du chargement des détails des tables:', err);
            this.error.set('Erreur lors du chargement des détails des tables');
            this.loading.set(false);
          }
        });
      } else {
        this.error.set(null);
      }
    });
    effect(()=>{
      
    })
  }

  protected nbr_tables = computed(() => {
    return this.tables().length;
  });

  handleRemoveTable(tableId: number) {
    console.log('Showing remove confirmation for table:', tableId);
    this.tableToRemove.set(tableId);
    this.showRemoveConfirm.set(true);
  }

  confirmRemoveTable() {
    const tableId = this.tableToRemove();
    const reservationId = this.reservationId();
    
    if (!tableId || !reservationId) {
      console.error('Missing table or reservation ID');
      this.error.set('Erreur : données manquantes');
      return;
    }
    
    console.log('Confirming removal of table:', tableId);
    this.gestionsvc.deleteTable(reservationId, tableId);
    this.closeRemoveConfirm();
  }

  closeRemoveConfirm() {
    console.log('Cancelling table removal');
    this.showRemoveConfirm.set(false);
    this.tableToRemove.set(null);
  }

  /**
   * Open the "Add Table" modal
   */
  showAddTable() {
    console.log('Opening add table modal');
    this.isAddTable.set(true);
  }

  /**
   * Close the "Add Table" modal
   */
  closeAddModal() {
    console.log('Closing add table modal');
    this.isAddTable.set(false);
  }

  /**
   * Handle when a table is successfully added via the modal
   */
  handleTableAdded() {
    console.log('Table added, reloading list...');
    this.closeAddModal();
    
    // Reload the tables list to show the newly added table
    const reservationId = this.reservationId();
    if (reservationId) {
      this.gestionsvc.loadTableDetailsForReservation(reservationId).subscribe();
    }
  }
}
