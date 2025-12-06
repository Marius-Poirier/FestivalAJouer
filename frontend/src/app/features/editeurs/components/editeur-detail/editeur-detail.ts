// src/app/features/editeurs/components/editeur-detail/editeur-detail.ts
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditeurService } from '../../services/editeur-service';
import { EditeurDto } from '@interfaces/entites/editeur-dto';

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

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isInteger(id)) {
      this.error.set('Identifiant d’éditeur invalide');
      this.isLoading.set(false);
      return;
    }

    const local = this.editeurService.findByIdLocal(id);
    if (local) {
      this.editeur.set(local);
      this.isLoading.set(false);
      return;
    }

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
