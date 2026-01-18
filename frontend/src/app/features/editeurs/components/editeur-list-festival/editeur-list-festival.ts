import { Component, computed, inject, signal } from '@angular/core';
import { EditeurService } from '@editeurs/services/editeur-service';
import { EditeurDto } from '@interfaces/entites/editeur-dto';
import { AuthService } from '@core/services/auth-services';
import { EditeurCard } from '../editeur-card/editeur-card';
import { EditeurForm } from '../editeur-form/editeur-form';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editeur-list-festival',
  imports: [EditeurCard, EditeurForm],
  templateUrl: './editeur-list-festival.html',
  styleUrl: './editeur-list-festival.css'
})
export class EditeurListFestival {

  protected readonly editeursvc = inject(EditeurService)
  protected readonly authService = inject(AuthService)
  private readonly router = inject(Router)
  private idcurrentfestival = computed(() => this.editeursvc.currentFestival()?.id ?? null)

  // form visible ?
  protected readonly showForm = signal(false);
  // éditeur en cours d'édition (null = création)
  protected readonly editingEditeur = signal<EditeurDto | null>(null);

  // éditer
  protected onUpdate(id: number) {
    const edi = this.editeursvc.findByIdLocal(id);
    if (edi) {
      this.editingEditeur.set(edi);
      this.showForm.set(true);
    }
  }

  // détail
  protected onDetail(id: number) {
    this.router.navigate(['/editeurs', id]);
  }

  // supprimer
  protected onDelete(id: number) {
    this.editeursvc.delete(id);
  }

  // fermeture form
  protected closeForm() {
    this.showForm.set(false);
    this.editingEditeur.set(null);
  }

  protected openCreateForm() {
    this.editingEditeur.set(null);
    this.showForm.set(true);
  }
}
