import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FestivalDto } from '@interfaces/entites/festival-dto';
import { FestivalService } from '../../services/festival-service';
import { notPastDateValidator, endDateAfterStartDateValidator } from '../../utils/validators';

@Component({
  selector: 'app-festival-form',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, ɵInternalFormsSharedModule, ReactiveFormsModule],
  templateUrl: './festival-form.html',
  styleUrl: './festival-form.css'
})
export class FestivalForm {
  private readonly fb = inject(FormBuilder)
  protected readonly festivalService = inject(FestivalService)
  
  public closeForm = output<void>()

  protected readonly form = this.fb.group({
    nom : ['', [Validators.required, Validators.minLength(5)]],
    lieu : ['', [Validators.required, Validators.minLength(5)]], 
    date_debut : ['', [Validators.required, notPastDateValidator()]],
    date_fin : ['', [Validators.required, endDateAfterStartDateValidator('date_debut')]]
  })



  protected close() {
    this.closeForm.emit()
  }

  protected onSubmit() {
    if (this.form.valid) {
      const festivalData: FestivalDto = {
        nom: this.form.value.nom!,
        lieu: this.form.value.lieu!,
        date_debut: this.form.value.date_debut!, 
        date_fin: this.form.value.date_fin!       
      };
      
      this.festivalService.add(festivalData);
      if(this.festivalService.error() != null){
        return
      }
      this.form.reset();
      this.closeForm.emit();
    }
  }

}
