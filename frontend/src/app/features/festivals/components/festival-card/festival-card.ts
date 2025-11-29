import { Component, input, output, inject } from '@angular/core';
import { FestivalDto } from '@interfaces/entites/festival-dto';
import {MatCardModule} from '@angular/material/card';
import { FestivalService } from '../../services/festival-service';


@Component({
  selector: 'app-festival-card',
  imports: [MatCardModule],
  templateUrl: './festival-card.html',
  styleUrl: './festival-card.css'
})
export class FestivalCard {
  // private servicefestival = inject(FestivalService);
  public festival = input<FestivalDto>();
  public delete = output<number>();
  public update = output<number>();

}
