import { Component, input, output, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { JeuDto } from '@interfaces/entites/jeu-dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-jeu-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './jeu-card.html',
  styleUrl: './jeu-card.css'
})
export class JeuCard {
  private readonly router = inject(Router);

  public jeu = input<JeuDto>();
  public delete = output<number>();
  public canManage = input<boolean>(false);

  protected goToDetail(id: number) {
    this.router.navigate(['/jeux', id]);
  }
}
