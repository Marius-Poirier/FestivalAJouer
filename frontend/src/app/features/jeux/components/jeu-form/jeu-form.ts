import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { JeuService } from '../../services/jeu-service';
import { JeuDto } from '@interfaces/entites/jeu-dto';
import { EditeurService } from '@editeurs/services/editeur-service';

// Types de jeu fixes
const TYPES_JEU = [
  { id: 1, nom: 'Tout public' },
  { id: 2, nom: 'Ambiance' },
  { id: 3, nom: 'Experts' },
  { id: 4, nom: 'Enfants' },
  { id: 5, nom: 'Classiques' },
  { id: 6, nom: 'Initiés' },
  { id: 7, nom: 'Jeu de rôle' }
];

@Component({
  selector: 'app-jeu-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
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

  public jeu = input<JeuDto | null>(null);
  public mode = input<'create' | 'edit'>('create');

  public closeForm = output<void>();

  protected readonly typesJeu = TYPES_JEU;

  protected readonly form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(3)]],
    nb_joueurs_min: [2, [Validators.required, Validators.min(1)]],
    nb_joueurs_max: [4, [Validators.min(1)]],
    duree_minutes: [null as number | null],
    age_min: [8, [Validators.required, Validators.min(0)]],
    age_max: [null as number | null],
    description: [''],
    lien_regles: [''],
    theme: [''],
    url_image: [''],
    url_video: [''],
    prototype: [false],
    type_jeu_id: [null as number | null],
    editeurs_ids: [[] as number[]]   // 👈 sélection des éditeurs
  });

  ngOnInit() {
    // on charge les éditeurs si pas déjà faits
    if (!this.editeurService.editeurs().length) {
      this.editeurService.loadAll();
    }

    const current = this.jeu();
    if (current) {
      this.form.patchValue({
        nom: current.nom,
        nb_joueurs_min: current.nb_joueurs_min,
        nb_joueurs_max: current.nb_joueurs_max,
        duree_minutes: current.duree_minutes ?? null,
        age_min: current.age_min,
        age_max: current.age_max ?? null,
        description: current.description ?? '',
        lien_regles: current.lien_regles ?? '',
        theme: current.theme ?? '',
        url_image: current.url_image ?? '',
        url_video: current.url_video ?? '',
        prototype: current.prototype ?? false,
        type_jeu_id: current.type_jeu_id ?? null,
        editeurs_ids: current.editeurs?.map(e => e.id) ?? []
      });
    }
  }

  protected close() {
    this.closeForm.emit();
  }

  protected onSubmit() {
    if (this.form.invalid) return;

    const value = this.form.value;
    const current = this.jeu();
    const mode = this.mode();

    const payload: Partial<JeuDto> = {
      nom: value.nom!,
      nb_joueurs_min: value.nb_joueurs_min!,
      nb_joueurs_max: value.nb_joueurs_max!,
      duree_minutes: value.duree_minutes ?? undefined,
      age_min: value.age_min!,
      age_max: value.age_max ?? undefined,
      description: value.description ?? undefined,
      lien_regles: value.lien_regles ?? undefined,
      theme: value.theme ?? undefined,
      url_image: value.url_image ?? undefined,
      url_video: value.url_video ?? undefined,
      prototype: !!value.prototype,
      type_jeu_id: value.type_jeu_id ?? undefined
    };

    // 👇 on ajoute editeurs_ids pour le backend
    (payload as any).editeurs_ids = value.editeurs_ids ?? [];

    if (mode === 'edit' && current?.id != null) {
      this.jeuService.update({
        ...(current as JeuDto),
        ...payload,
        id: current.id
      });
    } else {
      this.jeuService.add(payload as JeuDto);
    }

    if (this.jeuService.error()) {
      return;
    }

    this.form.reset();
    this.closeForm.emit();
  }
}
