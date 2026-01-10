import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditeurService } from '../../services/editeur-service';
import { EditeurDto } from '@interfaces/entites/editeur-dto';
import { JeuDto } from '@interfaces/entites/jeu-dto';

@Component({
  selector: 'app-editeur-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './editeur-detail.html',
  styleUrl: './editeur-detail.css'
})
export class EditeurDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly editeurService = inject(EditeurService);

  protected readonly editeur = signal<EditeurDto | null>(null);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  protected readonly jeux = signal<JeuDto[]>([]);
  protected readonly jeuxLoading = signal<boolean>(true);
  protected readonly jeuxError = signal<string | null>(null);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isInteger(id)) {
      this.error.set('Identifiant d’éditeur invalide');
      this.isLoading.set(false);
      this.jeuxLoading.set(false);
      return;
    }

    // Charger les jeux de cet éditeur
    this.loadJeux(id);

    // Charger l’éditeur (local puis API)
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
}
