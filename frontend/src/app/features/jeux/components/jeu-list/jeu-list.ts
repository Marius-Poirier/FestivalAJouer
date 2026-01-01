import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { JeuService } from '../../services/jeu-service';
import { AuthService } from '@core/services/auth-services';
import { JeuCard } from '../jeu-card/jeu-card';
import { JeuForm } from '../jeu-form/jeu-form';
import { Router } from '@angular/router';
import { JeuDto } from '@interfaces/entites/jeu-dto';

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
  private readonly router = inject(Router);

  protected readonly showForm = signal(false);
  protected readonly searchTerm = signal<string>('');

  private readonly pageSize = 20;
  protected readonly currentPage = signal(1);

  // Jeu en cours d’édition (null en création)
  protected readonly editingJeu = signal<JeuDto | null>(null);

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
    return total === 0 ? 1 : Math.ceil(total / this.pageSize);
  });

  protected readonly paginatedJeux = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredJeux().slice(start, end);
  });

  ngOnInit() {
    this.jeuService.loadAll();
  }

  protected toggleForm() {
    this.editingJeu.set(null);
    this.showForm.update(v => !v);
  }

  protected onSearch(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.searchTerm.set(target?.value ?? '');
    this.currentPage.set(1);
  }

  protected onDelete(id: number) {
    this.jeuService.delete(id);
  }

  protected onDetail(id: number) {
    this.router.navigate(['/jeux', id]);
  }

  protected onUpdate(id: number) {
    this.jeuService.getById(id).subscribe({
      next: (jeu) => {
        this.editingJeu.set(jeu);
        this.showForm.set(true);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du jeu pour édition', err);
      }
    });
  }

  protected onFormClosed() {
    this.showForm.set(false);
    this.editingJeu.set(null);
  }

  protected previousPage() {
    const current = this.currentPage();
    if (current > 1) this.currentPage.set(current - 1);
  }

  protected nextPage() {
    const current = this.currentPage();
    const total = this.totalPages();
    if (current < total) this.currentPage.set(current + 1);
  }
}
