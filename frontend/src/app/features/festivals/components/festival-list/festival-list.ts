import { Component, inject, signal, computed } from '@angular/core';
import { AuthService } from '@core/services/auth-services';
// import { FestivalDto } from '@interfaces/entites/festival-dto';
import { FestivalCard } from '../festival-card/festival-card'; 
import { FestivalService } from '../../services/festival-service';
import { FestivalForm } from '../festival-form/festival-form';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-festival-list',
  standalone: true,
  imports: [FestivalCard, FestivalForm, MatIconModule],
  templateUrl: './festival-list.html',
  styleUrl: './festival-list.css'
})
export class FestivalList {
  protected readonly authService = inject(AuthService)
  protected readonly festivalService = inject(FestivalService)
  public showForm = signal<boolean>(false)
  public searchTerm = signal<string>('')

  // Festivals filtrés en temps réel
  protected readonly filteredFestivals = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const festivals = this.festivalService.festivals();
    
    if (!term) return festivals;
    
    return festivals.filter(fest => 
      fest.nom.toLowerCase().includes(term) ||
      fest.lieu.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.festivalService.loadAll();
  }

  // Afficher form ajouter festival
  public show(){
    this.showForm.update(f => !f)
  }

  // Mettre à jour le terme de recherche
  public onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
