import { Component, inject, output } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EditeurService } from '../../services/editeur-service';
import { EditeurDto } from '@interfaces/entites/editeur-dto';

@Component({
  selector: 'app-editeur-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule
  ],
  templateUrl: './editeur-form.html',
  styleUrl: './editeur-form.css'
})
export class EditeurForm {
  private readonly fb = inject(FormBuilder);
  protected readonly editeurService = inject(EditeurService);

  public closeForm = output<void>();

  protected readonly form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(3)]]
  });

  protected close() {
    this.closeForm.emit();
  }

  protected onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    const payload: EditeurDto = {
      nom: value.nom!
    };

    this.editeurService.add(payload);

    if (this.editeurService.error() != null) {
      return;
    }

    this.form.reset();
    this.closeForm.emit();
  }
}
