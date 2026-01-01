import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { EditeurService } from '../../services/editeur-service';
import { AuthService } from '@core/services/auth-services';
import { EditeurCard } from '../editeur-card/editeur-card';
import { EditeurForm } from '../editeur-form/editeur-form';
import { EditeurDto } from '@interfaces/entites/editeur-dto';

@Component({
  selector: 'app-editeur-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    EditeurCard,
    EditeurForm
  ],
  templateUrl: './editeur-list.html',
  styleUrl: './editeur-list.css'
})
export class EditeurList {
  protected readonly editeurService = inject(EditeurService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // form visible ?
  protected readonly showForm = signal(false);
  // éditeur en cours d’édition (null = création)
  protected readonly editingEditeur = signal<EditeurDto | null>(null);

  // recherche
  protected readonly searchTerm = signal<string>('');

  // pagination
  private readonly pageSize = 20;
  protected readonly currentPage = signal(1);

  protected readonly filteredEditeurs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.editeurService.editeurs();

    if (!term) return list;

    return list.filter(e =>
      e.nom.toLowerCase().includes(term)
    );
  });

  protected readonly totalPages = computed(() => {
    const total = this.filteredEditeurs().length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  });

  protected readonly paginatedEditeurs = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredEditeurs().slice(start, end);
  });

  ngOnInit() {
    this.editeurService.loadAll();
  }

  // création
  protected openCreateForm() {
    this.editingEditeur.set(null);
    this.showForm.set(true);
  }

  // éditer
  protected onUpdate(id: number) {
    const edi = this.editeurService.findByIdLocal(id);
    if (edi) {
      this.editingEditeur.set(edi);
      this.showForm.set(true);
    }
  }

  // fermeture form
  protected closeForm() {
    this.showForm.set(false);
    this.editingEditeur.set(null);
  }

  protected onSearch(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.searchTerm.set(target?.value ?? '');
    this.currentPage.set(1);
  }

  protected onDelete(id: number) {
    this.editeurService.delete(id);
    const total = this.filteredEditeurs().length - 1;
    const maxPage = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.currentPage() > maxPage) {
      this.currentPage.set(maxPage);
    }
  }

  protected onDetail(id: number) {
    this.router.navigate(['/editeurs', id]);
  }

  protected goToPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  protected goToNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }
}
