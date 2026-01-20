import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
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

  public editeur = input<EditeurDto | null>(null);


  public closeForm = output<void>();

  protected readonly form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(3)]],
    logo_url: ['']
  });

  ngOnInit() {
    const current = this.editeur();
    if (current) {
      this.form.patchValue({
        nom: current.nom,
        logo_url: current.logo_url
      });
    }
  }

  protected close() {
    this.closeForm.emit();
  }

  protected onSubmit() {
    if (this.form.invalid) return;

    const { nom, logo_url } = this.form.value;
    const current = this.editeur();
   
    this.editeurService.add({
      nom: nom!,
      logo_url: logo_url || null
    });

    if (this.editeurService.error() != null) {
      return;
    }

    this.form.reset();
    this.closeForm.emit();
  }

}
