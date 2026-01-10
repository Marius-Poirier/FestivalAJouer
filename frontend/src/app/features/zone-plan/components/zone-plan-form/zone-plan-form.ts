import { Component, inject, output, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ZoneDuPlanDto } from '@interfaces/entites/zone-du-plan-dto';
import { ZonePlanService } from '../../services/zone-plan-service';
import { ZoneTarifaireService } from '@zoneTarifaires/services/zone-tarifaire-service';

@Component({
  selector: 'app-zone-plan-form',
  imports: [
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatSelectModule,
    ɵInternalFormsSharedModule, 
    ReactiveFormsModule
  ],
  templateUrl: './zone-plan-form.html',
  styleUrl: './zone-plan-form.css'
})
export class ZonePlanForm {
  private readonly fb = inject(FormBuilder)
  protected readonly zonePlanService = inject(ZonePlanService)
  protected readonly zoneTarifaireService = inject(ZoneTarifaireService)

  
  public closeForm = output<void>()

  // Récupérer les zones tarifaires disponibles
  protected readonly zonesTarifaires = this.zoneTarifaireService.zonesTarifaires;

  protected readonly form = this.fb.group({
    nom : ['', [Validators.required, Validators.minLength(3)]],
    nombre_tables : [0, [Validators.required, Validators.min(1)]], 
    zone_tarifaire_id : [0, [Validators.required, Validators.min(1)]],
    capacite_jeux : [2, [Validators.required, Validators.min(2)]]
  })

  ngOnInit() {
    // Charger les zones tarifaires si pas déjà chargées
    const festivalId = this.zoneTarifaireService.currentfestival()?.id;
    if (this.zonesTarifaires().length === 0 && festivalId) {
      this.zoneTarifaireService.loadAll(festivalId);
    }
  }

  protected close() {
    this.closeForm.emit()
  }

  protected onSubmit() {
    if (this.form.valid) {
      const zonePlanData: ZoneDuPlanDto = {
        nom: this.form.value.nom!,
        nombre_tables: this.form.value.nombre_tables!,
        zone_tarifaire_id: this.form.value.zone_tarifaire_id!,
        festival_id: this.zonePlanService.currentfestival()?.id ?? 0
      };
      
      this.zonePlanService.add(zonePlanData, this.form.value.capacite_jeux ?? 2);
      if(this.zonePlanService.error() != null){
        return
      }
      this.form.reset();
      this.closeForm.emit();
    }
  }

}
