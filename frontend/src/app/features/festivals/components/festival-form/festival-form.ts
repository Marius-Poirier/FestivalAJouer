import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-festival-form',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, ɵInternalFormsSharedModule, ReactiveFormsModule],
  templateUrl: './festival-form.html',
  styleUrl: './festival-form.css'
})
export class FestivalForm {
  private readonly fb = inject(FormBuilder)
  public closeForm = output<void>()

  protected readonly form = this.fb.group({
    nom : ['', [Validators.required, Validators.minLength(5)]],
    // nbZoneTarifaire : ['']
  })

  protected close() {
    this.closeForm.emit()
  }

  protected onSubmit(){}

}
