import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-card.html',
  styleUrl: './table-card.css'
})
export class TableCard {
 
  table = input.required<any>();
  onRemove = output<number>();

  statusBadgeColor = computed(() => {
    const t = this.table();
    if (!t) return 'green';

    const current = t.nb_jeux_actuels || 0;
    const capacity = t.capacite_jeux || 2;

    if (current === 0) return 'green';
    if (current < capacity) return 'orange';
    return 'red';
  });

  occupancyText = computed(() => {
    const t = this.table();
    if (!t) return '0/2';
    const current = t.nb_jeux_actuels || 0;
    const capacity = t.capacite_jeux || 2;
    return `${current}/${capacity}`;
  });


  statusEmoji = computed(() => {
    const color = this.statusBadgeColor();
    if (color === 'green') return '🟢';
    if (color === 'orange') return '🟡';
    return '🔴';
  });

}
