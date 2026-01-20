import { Component, inject, input, output,signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { EditeurDto } from '@interfaces/entites/editeur-dto';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { EditeurService } from '@editeurs/services/editeur-service';
import { PopupDelete } from '@sharedComponent/popup-delete/popup-delete';


@Component({
  selector: 'app-editeur-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, PopupDelete],
  templateUrl: './editeur-card.html',
  styleUrl: './editeur-card.css'
})
export class EditeurCard {
  public editeur = input<EditeurDto>();
  public canManage = input<boolean>(false);

  private fb = inject(FormBuilder)
  protected editeursvc = inject(EditeurService)

  public delete = output<number>();
  public update = output<number>();
  public detail = output<number>();

  // Signals pour la popup
  public deleteType = signal<string | null>(null);
  public deleteId = signal<number | null>(null);
  public deletenom = signal<string>('');


    // Ajoutez ces propriétés
  public isEditMode = signal<boolean>(false);


  // Formulaire d'édition
  protected readonly form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(3)]],
    logo_url: ['']
  });

  // Méthodes pour gérer l'édition
  public formEdition(): void {
    const edi = this.editeur();
    if (!edi) return;
    
    if (!this.isEditMode()) {
      this.form.patchValue({
        nom: edi.nom,
        logo_url: edi.logo_url ?? ''
      });
      this.isEditMode.set(true);
    } else {
      this.isEditMode.set(false);
      this.form.reset();
    }
  }

  public saveChanges(): void {
    const edi = this.editeur();
    if (!edi?.id || this.form.invalid) return;

    const { nom, logo_url } = this.form.getRawValue();

    this.editeursvc.update(
      edi.id,
      nom!,
      logo_url?.trim() ? logo_url.trim() : null
    );

    this.isEditMode.set(false);
  }

  //gestion de la popup suppresion 
    // -------- Gestion de popup supression
    public openDeletePopup(editeur: EditeurDto): void {
      this.deleteType.set('editeur');
      this.deleteId.set(editeur.id ?? null);
      this.deletenom.set(editeur.nom);
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
        this.editeursvc.delete(id);
      }
      this.closePopup();
    }

}
