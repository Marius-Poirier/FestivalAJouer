import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { JeuService } from '../../services/jeu-service';

@Component({
  selector: 'app-jeu-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule
  ],
  templateUrl: './jeu-form.html',
  styleUrl: './jeu-form.css'
})
export class JeuForm {
  private readonly fb = inject(FormBuilder);
  protected readonly jeuService = inject(JeuService);

  public closeForm = output<void>();

  protected readonly form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(3)]]
  });

  protected close() {
    this.closeForm.emit();
  }

  protected onSubmit() {
    if (this.form.invalid) return;

    this.jeuService.add({
      nom: this.form.value.nom!
    });

    if (this.jeuService.error()) {
      return;
    }

    this.form.reset();
    this.closeForm.emit();
  }
}
