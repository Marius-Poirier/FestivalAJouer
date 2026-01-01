import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { EditeurService } from '../../services/editeur-service';
import { EditeurCard } from '../editeur-card/editeur-card';
import { EditeurForm } from '../editeur-form/editeur-form';
import { AuthService } from '@core/services/auth-services';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-editeur-list',
  standalone: true,
  imports: [EditeurCard, EditeurForm, MatIconModule],
  templateUrl: './editeur-list.html',
  styleUrl: './editeur-list.css'
})
export class EditeurList {
  protected readonly editeurService = inject(EditeurService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public showForm = signal(false);
  public searchTerm = signal<string>('');

  // Taille de page
  private readonly pageSize = 20;

  // Page courante (1-based)
  protected readonly currentPage = signal<number>(1);

  // Liste filtrée par la recherche
  protected readonly filteredEditeurs = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.editeurService.editeurs();

    if (!term) return all;

    return all.filter(e =>
      e.nom.toLowerCase().includes(term)
    );
  });

  // Nombre total de pages
  protected readonly totalPages = computed(() => {
    const total = this.filteredEditeurs().length;
    if (total === 0) return 1;
    return Math.ceil(total / this.pageSize);
  });

  // Liste paginée à afficher
  protected readonly paginatedEditeurs = computed(() => {
    const list = this.filteredEditeurs();
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.editeurService.loadAll();
  }

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.searchTerm.set(value);
    // Quand on change de recherche → on revient à la page 1
    this.currentPage.set(1);
  }

  onDelete(id: number) {
    this.editeurService.delete(id);
  }

  onUpdate(id: number) {
    console.log('TODO update éditeur', id);
  }

  onDetail(id: number) {
    this.router.navigate(['/editeurs', id]);
  }

  // Navigation pagination
  goToPage(page: number) {
    const max = this.totalPages();
    if (page < 1 || page > max) return;
    this.currentPage.set(page);
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }
}
