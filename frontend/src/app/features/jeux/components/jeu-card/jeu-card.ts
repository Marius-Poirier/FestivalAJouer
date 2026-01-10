import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { JeuDto } from '@interfaces/entites/jeu-dto';

@Component({
  selector: 'app-jeu-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './jeu-card.html',
  styleUrl: './jeu-card.css'
})
export class JeuCard {
  public jeu = input<JeuDto>();
  public canManage = input<boolean>(false);

  public delete = output<number>();
  public update = output<number>();
  public detail = output<number>();
}
