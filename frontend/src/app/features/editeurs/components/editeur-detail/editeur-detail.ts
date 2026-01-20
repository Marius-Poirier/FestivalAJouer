import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditeurService } from '../../services/editeur-service';
import { EditeurDto } from '@interfaces/entites/editeur-dto';
import { JeuDto } from '@interfaces/entites/jeu-dto';
import { PersonneDto } from '@interfaces/entites/personne-dto';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth-services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editeur-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './editeur-detail.html',
  styleUrl: './editeur-detail.css'
})
export class EditeurDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly editeurService = inject(EditeurService);
  private readonly fb = inject(FormBuilder);

  protected readonly editeur = signal<EditeurDto | null>(null);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  protected readonly jeux = signal<JeuDto[]>([]);
  protected readonly jeuxLoading = signal<boolean>(true);
  protected readonly jeuxError = signal<string | null>(null);

  protected readonly personnes = signal<PersonneDto[]>([]);
  protected readonly personnesLoading = signal<boolean>(true);
  protected readonly personnesError = signal<string | null>(null);

  protected readonly showAddContact = signal<boolean>(false);

  private readonly authService = inject(AuthService);

  protected readonly returnUrl = signal<string>('/editeurs');
  private readonly router = inject(Router);

  protected readonly contactForm = this.fb.group({
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    telephone: ['', [Validators.required, Validators.minLength(6)]],
    email: [''],
    fonction: ['']
  });

  ngOnInit() {
    const ret = this.route.snapshot.queryParamMap.get('returnUrl');
    if (ret && ret.trim().length > 0) {
      this.returnUrl.set(ret);
    }
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isInteger(id)) {
      this.error.set('Identifiant d’éditeur invalide');
      this.isLoading.set(false);
      this.jeuxLoading.set(false);
      this.personnesLoading.set(false);
      return;
    }

    this.loadJeux(id);

    if (this.canSeeContacts()) {
      this.loadPersonnes(id);
    } else {
      this.personnes.set([]);
      this.personnesLoading.set(false);
    }

    const local = this.editeurService.findByIdLocal(id);
    if (local) {
      this.editeur.set(local);
      this.isLoading.set(false);
    } else {
      this.editeurService.loadOne(id).subscribe({
        next: (edi) => {
          this.editeur.set(edi);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Impossible de charger cet éditeur');
          this.isLoading.set(false);
        }
      });
    }
  }

  private loadJeux(editeurId: number) {
    this.jeuxLoading.set(true);
    this.jeuxError.set(null);

    this.editeurService.getJeuxForEditeur(editeurId).subscribe({
      next: (list) => {
        this.jeux.set(list ?? []);
        this.jeuxLoading.set(false);
      },
      error: () => {
        this.jeuxError.set('Impossible de charger les jeux de cet éditeur');
        this.jeuxLoading.set(false);
      }
    });
  }

  protected canSeeContacts(): boolean {
    return this.authService.isAdminSuperorgaOrga(); 
  }

  protected canManageContacts(): boolean {
    return this.authService.isAdminSuperorga(); 
  }

  private loadPersonnes(editeurId: number) {
    this.personnesLoading.set(true);
    this.personnesError.set(null);

    this.editeurService.getPersonnesForEditeur(editeurId).subscribe({
      next: (list) => {
        this.personnes.set(list ?? []);
        this.personnesLoading.set(false);
      },
      error: () => {
        this.personnesError.set('Impossible de charger les contacts');
        this.personnesLoading.set(false);
      }
    });
  }

  protected toggleAddContact() {
    this.showAddContact.update(v => !v);
    if (!this.showAddContact()) {
      this.contactForm.reset();
    }
  }

  protected submitContact() {
    const edi = this.editeur();
    if (!edi?.id || this.contactForm.invalid) return;

    const raw = this.contactForm.getRawValue();
    const payload = {
      prenom: raw.prenom!.trim(),
      nom: raw.nom!.trim(),
      telephone: raw.telephone!.trim(),
      email: raw.email?.trim() || undefined,
      fonction: raw.fonction?.trim() || undefined
    };

    this.editeurService.addPersonneToEditeur(edi.id, payload).subscribe({
      next: (res) => {
        const p = res?.personne;
        if (p?.id) {
          this.personnes.update(list => {
            if (list.some(x => x.id === p.id)) return list;
            return [p, ...list];
          });
        }
        this.toggleAddContact();
      },
      error: () => {
        this.personnesError.set('Impossible d’ajouter ce contact');
      }
    });
  }

  protected removePersonne(personneId: number) {
    const edi = this.editeur();
    if (!edi?.id) return;

    this.editeurService.removePersonneFromEditeur(edi.id, personneId).subscribe({
      next: () => {
        this.personnes.update(list => list.filter(p => p.id !== personneId));
      },
      error: () => {
        this.personnesError.set('Impossible de retirer ce contact');
      }
    });
  }

  // action du bouton Retour
  protected goBack() {
    const url = this.returnUrl();
    if (url && url.trim().length > 0) {
      this.router.navigateByUrl(url);
      return;
    }
    window.history.back();
  }
}
