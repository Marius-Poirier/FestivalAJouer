import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { EditeurDto } from '@interfaces/entites/editeur-dto';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-editeur-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './editeur-card.html',
  styleUrl: './editeur-card.css'
})
export class EditeurCard {
  public editeur = input<EditeurDto>();
  public canManage = input<boolean>(false);

  public delete = output<number>();
  public update = output<number>();
  public detail = output<number>();
}
