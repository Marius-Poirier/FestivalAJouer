import { Component, input, output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { JeuDto } from '@interfaces/entites/jeu-dto';
import { PopupDelete } from '@sharedComponent/popup-delete/popup-delete';

@Component({
  selector: 'app-jeu-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule, PopupDelete],
  templateUrl: './jeu-card.html',
  styleUrl: './jeu-card.css'
})
export class JeuCard {
  public jeu = input<JeuDto>();
  public canManage = input<boolean>(false);

  public delete = output<number>();
  public update = output<number>();
  public detail = output<number>();

  // ===== Popup delete =====
  public deleteType = signal<string | null>(null);
  public deleteId = signal<number | null>(null);
  public deletenom = signal<string>('');

  public openDeletePopup(jeu: JeuDto): void {
    this.deleteType.set('jeu');
    this.deleteId.set(jeu.id ?? null);
    this.deletenom.set(jeu.nom ?? '');
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
      this.delete.emit(id);
    }
    this.closePopup();
  }
}
