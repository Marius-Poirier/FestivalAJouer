import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ZoneTarifaireDto } from '@interfaces/entites/zone-tarifaire-dto';
import { ZoneTarifaireService } from '../../services/zone-tarifaire-service';

@Component({
  selector: 'app-zone-tarifaire-form',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, ɵInternalFormsSharedModule, ReactiveFormsModule],
  templateUrl: './zone-tarifaire-form.html',
  styleUrl: './zone-tarifaire-form.css'
})
export class ZoneTarifaireForm {
  private readonly fb = inject(FormBuilder)
  protected readonly zoneTarifaireService = inject(ZoneTarifaireService)
  
  public closeForm = output<void>()

  protected readonly form = this.fb.group({
    nom : ['', [Validators.required, Validators.minLength(3)]],
    nombre_tables_total : [0, [Validators.required, Validators.min(1)]], 
    prix_table : [0, [Validators.required, Validators.min(0.01)]]
  })

  protected close() {
    this.closeForm.emit()
  }

  protected onSubmit() {
    if (this.form.valid) {
      const zoneTarifaireData: Omit<ZoneTarifaireDto, 'id' | 'festival_id' | 'created_at' | 'updated_at'> = {
        nom: this.form.value.nom!,
        nombre_tables_total: this.form.value.nombre_tables_total!,
        prix_table: this.form.value.prix_table!
      };
      
      this.zoneTarifaireService.add(zoneTarifaireData);
      if(this.zoneTarifaireService.error() != null){
        return
      }
      this.form.reset();
      this.closeForm.emit();
    }
  }

}
