import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { JeuService } from '../../services/jeu-service';
import { AuthService } from '@core/services/auth-services';
import { JeuCard } from '../jeu-card/jeu-card';
import { JeuForm } from '../jeu-form/jeu-form';

@Component({
  selector: 'app-jeu-list',
  standalone: true,
  imports: [JeuCard, JeuForm, MatIconModule],
  templateUrl: './jeu-list.html',
  styleUrl: './jeu-list.css'
})
export class JeuList {
  protected readonly jeuService = inject(JeuService);
  protected readonly authService = inject(AuthService);

  protected readonly showForm = signal(false);

  protected readonly searchTerm = signal<string>('');

  // Pagination
  private readonly pageSize = 20;
  protected readonly currentPage = signal<number>(1);

  protected readonly filteredJeux = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.jeuService.jeux();

    if (!term) return list;

    return list.filter(j =>
      j.nom.toLowerCase().includes(term)
    );
  });

  protected readonly totalPages = computed(() => {
    const total = this.filteredJeux().length;
    if (total === 0) return 1;
    return Math.ceil(total / this.pageSize);
  });

  protected readonly paginatedJeux = computed(() => {
    const list = this.filteredJeux();
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.jeuService.loadAll();
  }

  protected toggleForm() {
    this.showForm.update(v => !v);
  }

  protected onSearch(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.searchTerm.set(target?.value ?? '');
    // quand on change le filtre, on revient page 1
    this.currentPage.set(1);
  }

  protected onDelete(id: number) {
    this.jeuService.delete(id);
    const totalAfter = this.filteredJeux().length;
    const maxPage = Math.max(1, Math.ceil(totalAfter / this.pageSize));
    if (this.currentPage() > maxPage) {
      this.currentPage.set(maxPage);
    }
  }

  // Navigation pagination
  protected goToPage(page: number) {
    const max = this.totalPages();
    if (page < 1 || page > max) return;
    this.currentPage.set(page);
  }

  protected prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage() {
    this.goToPage(this.currentPage() + 1);
  }
}
