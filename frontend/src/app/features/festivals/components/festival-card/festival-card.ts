import { Component, input, output, inject, LOCALE_ID, computed, signal } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FestivalService } from '@festivals/services/festival-service';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import { FestivalDto } from '@interfaces/entites/festival-dto';
import { PopupDelete } from '@sharedComponent/popup-delete/popup-delete';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { notPastDateValidator, endDateAfterStartDateValidator } from '../../utils/validators';

registerLocaleData(localeFr);

@Component({
  selector: 'app-festival-card',
  imports: [MatCardModule, DatePipe, MatIconModule, PopupDelete, ReactiveFormsModule],
  templateUrl: './festival-card.html',
  styleUrl: './festival-card.css',
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }]
})
export class FestivalCard {
  public readonly idFestival = input<number>();
  public update = output<number>();

  public canManage = input<boolean>(false);
  protected festsvc = inject(FestivalService)
  private fb = inject(FormBuilder)

  // Signals pour la popup
  public deleteType = signal<string | null>(null);
  public deleteId = signal<number | null>(null);
  public deletenom = signal<string>('');
  
  public isEditMode = signal<boolean>(false);
  
  // Formulaire d'edition
  protected readonly form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(5)]],
    lieu: ['', [Validators.required, Validators.minLength(5)]],
    date_debut: ['', [Validators.required]],
    date_fin: ['', [Validators.required]]
  });

  public festival = computed(()=>{
    const id = this.idFestival()
        if(id !== undefined){
        return this.festsvc.findById(id) 
    }
    else {
      return undefined
    }
  })

  // -------- Gestion de popup supression
  public openDeletePopup(festival: FestivalDto): void {
    this.deleteType.set('festival');
    this.deleteId.set(festival.id ?? null);
    this.deletenom.set(festival.nom);
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
      this.festsvc.delete(id);
    }
    this.closePopup();
  }

  // gestion d'édition d'un festivale 
  // convertir card en un form

  public formEdition(): void {
    const fest = this.festival();
    if (!fest) return;
    
    if (!this.isEditMode()) {
      this.form.patchValue({
        nom: fest.nom,
        lieu: fest.lieu,
        date_debut: fest.date_debut.split('T')[0],
        date_fin: fest.date_fin.split('T')[0]
      });
      this.isEditMode.set(true);
    } else {
      this.isEditMode.set(false);
      this.form.reset();
    }
  }

  public saveChanges(): void {
    const fest = this.festival();
    if (!fest?.id || this.form.invalid) return;
    const updatedFestival: Omit<FestivalDto, 'created_at' | 'updated_at'> & { id: number } = {
      id: fest.id,
      nom: this.form.value.nom!,
      lieu: this.form.value.lieu!,
      date_debut: this.form.value.date_debut!,
      date_fin: this.form.value.date_fin!
    };
    this.festsvc.update(updatedFestival);
    this.isEditMode.set(false);
  }
  

}
