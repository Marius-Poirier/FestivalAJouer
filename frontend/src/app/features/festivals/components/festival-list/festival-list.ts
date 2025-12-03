import { Component, EventEmitter, Output, inject, signal} from '@angular/core';
import { FestivalDto } from '@interfaces/entites/festival-dto';
import { FestivalCard } from '../festival-card/festival-card'; 
import { FestivalService } from '../../services/festival-service';
import { FestivalForm } from '../festival-form/festival-form';
// import { FormAdd } from "../../form/form-add/form-add";

@Component({
  selector: 'app-festival-list',
  standalone: true,
  imports: [FestivalCard, FestivalForm],
  templateUrl: './festival-list.html',
  styleUrl: './festival-list.css'
})
export class FestivalList {
  protected readonly festivalService = inject(FestivalService)
  public showForm = signal<boolean>(false)

  ngOnInit() {
    this.festivalService.loadAll();
  }


  // Afficher form ajouter festival
  public show(){
    this.showForm.update(f => !f)
  }


}
