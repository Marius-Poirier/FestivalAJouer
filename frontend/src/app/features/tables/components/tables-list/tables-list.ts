import { Component, effect, inject, input, signal } from '@angular/core';
import { TableJeuDto } from '@interfaces/entites/table-jeu-dto';
import { TableCard } from '../table-card/table-card';
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
  protected tablesvc = inject(TablesService)



  openTableJeux = signal<Record<number, boolean>>({});
  jeuxParTable = signal<Record<number, JeuDto[]>>({});


  public deleteType = signal<string | null>(null);
  public deleteId = signal<number | null>(null);
  public deletenom = signal<string>('');

  showError = signal(false);

  constructor() {
    effect(() => {
      if (this.tablesvc.error()) {
        this.showError.set(true);
        setTimeout(() => this.showError.set(false), 1000);
      }
    });
  }

  async loadJeuxForTable(tableId: number) {
    try {
      // Récupère TOUS les jeux (JeuDto[]) pour cette table
      const jeux = await firstValueFrom(
        this.tablesvc.getJeuxCompletsByTableId(tableId)
      );
      
      this.jeuxParTable.set({ 
        ...this.jeuxParTable(), 
        [tableId]: jeux || [] 
      });
    } catch (error) {
      console.error('Erreur chargement jeux pour table', tableId, error);
      this.jeuxParTable.set({ ...this.jeuxParTable(), [tableId]: [] });
    }
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
