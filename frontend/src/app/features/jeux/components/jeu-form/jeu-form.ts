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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

import { JeuService } from '../../services/jeu-service';
import { EditeurService } from '@editeurs/services/editeur-service';
import { JeuDto } from '@interfaces/entites/jeu-dto';

interface TypeJeuOption {
  id: number;
  libelle: string;
}

@Component({
  selector: 'app-jeu-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule
  ],
  templateUrl: './jeu-form.html',
  styleUrl: './jeu-form.css'
})
export class JeuForm {
  private readonly fb = inject(FormBuilder);
  protected readonly jeuService = inject(JeuService);
  protected readonly editeurService = inject(EditeurService);

  public closeForm = output<void>();

  // Liste des types de jeu
  protected readonly typeJeux: TypeJeuOption[] = [
    { id: 1, libelle: 'Tout public' },
    { id: 2, libelle: 'Ambiance' },
    { id: 3, libelle: 'Experts' },
    { id: 4, libelle: 'Enfants' },
    { id: 5, libelle: 'Classiques' },
    { id: 6, libelle: 'Initiés' },
    { id: 7, libelle: 'Jeu de rôle' }
  ];

  protected readonly form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(3)]],

    nb_joueurs_min: [2, [Validators.required, Validators.min(1)]],
    nb_joueurs_max: [4, [Validators.required, Validators.min(1)]],

    duree_minutes: [null as number | null],
    age_min: [8, [Validators.required, Validators.min(0)]],
    age_max: [null as number | null],

    description: [''],
    lien_regles: [''],

    theme: [''],
    url_image: [''],
    url_video: [''],
    prototype: [false],

    // éditeur choisi (optionnel)
    editeur_id: [null as number | null],

    // type de jeu choisi (optionnel)
    type_jeu_id: [null as number | null]
  });

  protected close() {
    this.closeForm.emit();
  }

  protected onSubmit() {
    if (this.form.invalid) return;

    const v = this.form.value;

    const payload: JeuDto & { editeurs_ids?: number[] } = {
      nom: v.nom!,
      nb_joueurs_min: v.nb_joueurs_min ?? 0,
      nb_joueurs_max: v.nb_joueurs_max ?? 0,
      duree_minutes: v.duree_minutes ?? undefined,
      age_min: v.age_min ?? 0,
      age_max: v.age_max ?? undefined,
      description: v.description ?? undefined,
      lien_regles: v.lien_regles ?? undefined,
      theme: v.theme ?? undefined,
      url_image: v.url_image ?? undefined,
      url_video: v.url_video ?? undefined,
      prototype: v.prototype ?? false
    };

    if (v.type_jeu_id != null) {
      payload.type_jeu_id = v.type_jeu_id;
    }

    if (v.editeur_id != null) {
      (payload as any).editeurs_ids = [v.editeur_id];
    }

    this.jeuService.add(payload);

    if (this.jeuService.error()) {
      return;
    }

    this.form.reset({
      nb_joueurs_min: 2,
      nb_joueurs_max: 4,
      age_min: 8,
      prototype: false,
      editeur_id: null,
      type_jeu_id: null
    });

    this.closeForm.emit();
  }
}
