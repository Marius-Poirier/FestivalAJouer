import { Component, input, signal, effect, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionReservationService } from '../../services/gestion-reservation-service';
import { TableCard } from '@tables/components/table-card/table-card';
import { AddTableReservation } from '@gestion-reservation/components/add-table-reservation/add-table-reservation';
import { PopupDelete } from '@sharedComponent/popup-delete/popup-delete';

@Component({
  selector: 'app-reservation-table',
  standalone: true,
  imports: [CommonModule, TableCard, AddTableReservation, PopupDelete],
  templateUrl: './reservation-table.html',
  styleUrl: './reservation-table.css'
})
export class ReservationTable {
  reservationId = input<number | null>(null);
  festivalId = input<number | null>(null);

  private gestionsvc = inject(GestionReservationService);

  tables = computed(() => this.gestionsvc.tables());
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  prix_total = computed(() => this.gestionsvc.reservation()?.prix_total);
  nbr_tables = computed(() => this.tables().length);

  isAddTable = signal<boolean>(false);

  showRemoveConfirm = signal<boolean>(false);
  tableToRemove = signal<number | null>(null);

  jeuxDisponibles = computed(() => this.gestionsvc.jeuFestivalView());
  loadingJeux = signal<boolean>(false);
  jeuxParTable = signal<Record<number, number[]>>({});
  openTableJeux = signal<Record<number, boolean>>({});

  showAddJeuModal = signal<number | null>(null);

  //gere la suppresion d'un jeu d'une table 
  deleteJeuType = signal<string | null>(null);
  deleteJeuId = signal<number | null>(null);
  deleteJeuNom = signal<string>('');
  deleteJeuTableId = signal<number | null>(null);



  constructor() {
    // Charger les tables quand reservationId change
    effect(() => {
      const id = this.reservationId();
      if (id) {
        this.loading.set(true);
        this.gestionsvc.loadTableDetailsForReservation(id).subscribe({
          next: () => this.loading.set(false),
          error: (err) => {
            console.error('Erreur chargement tables:', err);
            this.error.set('Erreur lors du chargement des tables');
            this.loading.set(false);
          }
        });
      } else {
        this.error.set(null);
      }
    });

    //charger les jeux disponibles
    effect(() => {
      const festId = this.festivalId();
      const resId = this.reservationId();
      if (festId && resId) {
        this.loadingJeux.set(true);
        this.gestionsvc.loadJeuxView(festId, resId).subscribe({
          next: () => this.loadingJeux.set(false),
          error: () => this.loadingJeux.set(false)
        });
      }
    });
  }

  // ========================================
  // MÉTHODES - Gestion des tables
  // ========================================

  /**
   * Ouvrir la modal pour ajouter une table
   */
  showAddTable() {
    this.isAddTable.set(true);
  }

  /**
   * Fermer la modal d'ajout de table
   */
  closeAddModal() {
    this.isAddTable.set(false);
  }

  /**
   * Appelé quand une table est ajoutée avec succès
   */
  handleTableAdded() {
    this.closeAddModal();
    const reservationId = this.reservationId();
    if (reservationId) {
      this.gestionsvc.loadTableDetailsForReservation(reservationId).subscribe();
    }
  }

  /**
   * Demander confirmation avant de retirer une table
   */
  handleRemoveTable(tableId: number) {
    this.tableToRemove.set(tableId);
    this.showRemoveConfirm.set(true);
  }

  /**
   * Confirmer la suppression d'une table
   */
  confirmRemoveTable() {
    const tableId = this.tableToRemove();
    const reservationId = this.reservationId();
    
    if (!tableId || !reservationId) {
      this.error.set('Erreur : données manquantes');
      return;
    }
    
    this.gestionsvc.deleteTable(reservationId, tableId);
    this.closeRemoveConfirm();
  }

  /**
   * Annuler la suppression d'une table
   */
  closeRemoveConfirm() {
    this.showRemoveConfirm.set(false);
    this.tableToRemove.set(null);
  }

  // ========================================
  // MÉTHODES - Gestion des jeux associés
  // ========================================

  /**
   * Ouvrir/fermer la liste des jeux d'une table
   */
  toggleTableJeux(tableId: number) {
    const current = this.openTableJeux();
    const newState = !current[tableId];
    
    this.openTableJeux.set({ ...current, [tableId]: newState });
    
    // Charger les jeux si pas encore chargés
    if (newState && !this.jeuxParTable()[tableId]) {
      this.loadJeuxForTable(tableId);
    }
  }

  /**
   * Charger les jeux associés à une table spécifique
   */
  loadJeuxForTable(tableId: number) {
    this.gestionsvc.getJeuxByTableId(tableId).subscribe({
      next: (jeuFestivalIds) => {
        this.jeuxParTable.update(current => ({
          ...current,
          [tableId]: jeuFestivalIds
        }));
      },
      error: (err) => {
        console.error('Erreur chargement jeux table:', err);
      }
    });
  }

  /**
   * Obtenir les détails complets des jeux d'une table
   */
  getJeuxDetailsForTable(tableId: number) {
    const jeuFestivalIds = this.jeuxParTable()[tableId] || [];
    const allJeux = this.jeuxDisponibles();
    return allJeux.filter(jeu => jeuFestivalIds.includes(jeu.id));
  }

  // ========================================
  // MÉTHODES - Modal "Ajouter un jeu"
  // ========================================

  /**
   * Ouvrir la modal pour ajouter un jeu à une table
   */
  openAddJeuModal(tableId: number) {
    this.showAddJeuModal.set(tableId);
  }

  /**
   * Fermer la modal d'ajout de jeu
   */
  closeAddJeuModal() {
    this.showAddJeuModal.set(null);
  }

  /**
   * Ajouter un jeu à une table
   */
  handleAddJeuToTable(jeuFestivalId: number) {
    const tableId = this.showAddJeuModal();
    if (!tableId) return;

    this.gestionsvc.addJeuToTable(jeuFestivalId, tableId).subscribe({
      next: (response) => {
        if (response) {
          this.closeAddJeuModal();
          
          // Recharger les jeux disponibles
          const festId = this.festivalId();
          const resId = this.reservationId();
          if (festId && resId) {
            this.gestionsvc.loadJeuxView(festId, resId).subscribe();
          }
          
          // Recharger les jeux de cette table si elle est ouverte
          if (this.openTableJeux()[tableId]) {
            this.loadJeuxForTable(tableId);
          }

          // refresh tables → met à jour nb_jeux_actuels → compteur auto
          if (resId) {
            this.gestionsvc.loadTableDetailsForReservation(resId).subscribe();
          }
        }
      },
      error: (err) => {
        console.error('Erreur ajout jeu:', err);
        this.error.set('Erreur lors de l\'ajout du jeu');
      }
    });
  }

  //gere la suppresion d'un jeu d'une table 

  /**
   * Ouvrir popup pour retirer un jeu
   */
  openRemoveJeuPopup(jeuId: number, tableId: number, nomJeu: string) {
    this.deleteJeuType.set('jeu-table');
    this.deleteJeuId.set(jeuId);
    this.deleteJeuNom.set(nomJeu);
    this.deleteJeuTableId.set(tableId);
  }

  /**
   * Confirmer le retrait du jeu
   */
  handleConfirmRemoveJeu() {
    const jeuId = this.deleteJeuId();
    const tableId = this.deleteJeuTableId();
    
    if (jeuId && tableId) {
      this.gestionsvc.removeJeuFromTable(jeuId, tableId).subscribe({
        next: () => {
          this.loadJeuxForTable(tableId);
            const resId = this.reservationId();
            if (resId) {
              this.gestionsvc.loadTableDetailsForReservation(resId).subscribe();
            }
        }
      });
    }
    
    this.handleCancelRemoveJeu();
  }

  /**
   * Annuler le retrait du jeu
   */
  handleCancelRemoveJeu() {
    this.deleteJeuType.set(null);
    this.deleteJeuId.set(null);
    this.deleteJeuNom.set('');
    this.deleteJeuTableId.set(null);
  }
}