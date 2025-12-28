import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { JeuService } from '../../services/jeu-service';
import { AuthService } from '@core/services/auth-services';
import { JeuCard } from '../jeu-card/jeu-card';
import { JeuForm } from '../jeu-form/jeu-form'; // si tu l’as déjà

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

  protected readonly filteredJeux = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.jeuService.jeux();

    if (!term) return list;

    return list.filter(j =>
      j.nom.toLowerCase().includes(term)
    );
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
  }

  protected onDelete(id: number) {
    this.jeuService.delete(id);
  }
}
