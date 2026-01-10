import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-popup-delete',
  imports: [],
  standalone: true,
  templateUrl: './popup-delete.html',
  styleUrl: './popup-delete.css'
})
export class PopupDelete {

  public entiteType = input<string | null>(null);
  public entiteId = input<number | null>(null);
  public entitenom = input<string>(''); 

  public confirm = output<{ type: string; id: number }>();
  public cancel = output<void>();
  
  
public confirmationMessage = computed(() => {
    const type = this.entiteType();
    const nom = this.entitenom();
    
    if (!type) return '';
    switch (type) {
      case 'jeu':
        return `Êtes-vous sûr de vouloir supprimer le jeu ${nom ? `"${nom}"` : ''} ?`;
      
      case 'editeur':
        return `Êtes-vous sûr de vouloir supprimer l'éditeur ${nom ? `"${nom}"` : ''} ?`;
      
      case 'festival':
        return `Êtes-vous sûr de vouloir supprimer le festival ${nom ? `"${nom}"` : ''} ?`;
      case 'contactEditeur':
        return `Êtes-vous sûr de vouloir supprimer le contact ${nom ? `"${nom}"` : ''} ?`;
      case 'zone':
        return `Êtes-vous sûr de vouloir supprimer la zone ${nom ? `"${nom}"` : ''} ?`;
      case 'reservation':
        return `Êtes-vous sûr de vouloir supprimer la réservation ${nom ? `"${nom}"` : ''} ?`;
      default:
        return
    }
  }
)

  protected onConfirm(): void {
    const type = this.entiteType();
    const id = this.entiteId();
    if (type && id !== null) {
      this.confirm.emit({ type, id });
    }
  }
  
  protected onCancel(): void {
    this.cancel.emit();
  }


}
