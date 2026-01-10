import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { JeuService } from '../../services/jeu-service';
import { JeuDto } from '@interfaces/entites/jeu-dto';

@Component({
  selector: 'app-jeu-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './jeu-detail.html',
  styleUrl: './jeu-detail.css'
})
export class JeuDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly jeuService = inject(JeuService);

  protected readonly jeu = signal<JeuDto | null>(null);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number.parseInt(idParam, 10) : NaN;

    if (!Number.isFinite(id)) {
      this.error.set('Identifiant de jeu invalide');
      this.isLoading.set(false);
      return;
    }

    this.jeuService.getById(id).subscribe({
      next: (data: JeuDto) => {
        this.jeu.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement du jeu');
        this.isLoading.set(false);
      }
    });
  }
}
