import { Component, inject, input, signal } from '@angular/core';
import { TableJeuDto } from '@interfaces/entites/table-jeu-dto';
import { TableCard } from '../table-card/table-card';
import { GestionReservationService } from '@gestion-reservation/services/gestion-reservation-service';
import { JeuService } from '@jeux/services/jeu-service';
import { JeuDto } from '@interfaces/entites/jeu-dto';
import { firstValueFrom } from 'rxjs';
import { TablesService } from '@tables/services/tables-service';
import { PopupDelete } from '@sharedComponent/popup-delete/popup-delete';

@Component({
  selector: 'app-tables-list',
  imports: [TableCard, PopupDelete],
  templateUrl: './tables-list.html',
  styleUrl: './tables-list.css'
})
export class TablesList {


  tables = input<TableJeuDto[]>();
  private tablesvc = inject(TablesService)

  protected reservationgestionsvc = inject(GestionReservationService);
  protected jeuService = inject(JeuService);

  openTableJeux = signal<Record<number, boolean>>({});
  jeuxParTable = signal<Record<number, JeuDto[]>>({});


  public deleteType = signal<string | null>(null);
  public deleteId = signal<number | null>(null);
  public deletenom = signal<string>('');

  async loadJeuxForTable(tableId: number) {
    
    const ids = await firstValueFrom(this.reservationgestionsvc.getJeuxByTableId(tableId));
    if (!ids || ids.length === 0) {
      this.jeuxParTable.set({ ...this.jeuxParTable(), [tableId]: [] });
      return;
    }
    // Récupère les détails de chaque jeu
    const jeux = await Promise.all(
      ids.map(id => firstValueFrom(this.jeuService.getById(id)).catch(() => null))
    );
    this.jeuxParTable.set({
      ...this.jeuxParTable(),
      [tableId]: jeux.filter(j => j !== null) as JeuDto[]
    });
  }

  getJeuxDetailsForTable(tableId: number) {
    return this.jeuxParTable()[tableId] || [];
  }

  toggleTableJeux(tableId: number) {
    const current = this.openTableJeux();
    const willOpen = !current[tableId];
    this.openTableJeux.set({ ...current, [tableId]: willOpen });
    if (willOpen && !this.jeuxParTable()[tableId]) {
      this.loadJeuxForTable(tableId);
    }
  }

  openAddJeuModal(tableId: number) {
    console.log('Ouvrir modal jeu pour table', tableId);
  }

  handleRemoveTable(tableId: number) {
    console.log('Supprimer table', tableId);
  }

    // -------- Gestion de popup supression
    public openDeletePopup(table: TableJeuDto): void {
      this.deleteType.set('table');
      this.deleteId.set(table.id ?? null);

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
        this.tablesvc.delete(id);
      }
      this.closePopup();
    }

}
