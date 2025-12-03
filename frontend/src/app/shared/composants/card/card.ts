import { Component, input, signal, output, TemplateRef, contentChild } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { DatePipe, CurrencyPipe } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Attributs, Action } from '@sharedComponent/utils/generic-interfaces';




// registerLocaleData(localeFr);

@Component({
  selector: 'app-card',
  imports: [MatCardModule, DatePipe, CurrencyPipe],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card{
  // Configuration simple
  public data = input<string>();
  public subtitle = input<string>('');
  public fields = input<Attributs[]>([]);
  public actions = input<Action[]>([]);
  
  public cardClick = output<void>();

  protected onCardClick(): void {
    this.cardClick.emit();
  }
  
}
