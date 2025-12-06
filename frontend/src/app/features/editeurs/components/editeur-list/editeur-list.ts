import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EditeurService } from '../../services/editeur-service';
import { EditeurCard } from '../editeur-card/editeur-card';
import { EditeurForm } from '../editeur-form/editeur-form';
import { AuthService } from 'src/app/core/services/auth-services';

@Component({
  selector: 'app-editeur-list',
  standalone: true,
  imports: [EditeurCard, EditeurForm],
  templateUrl: './editeur-list.html',
  styleUrl: './editeur-list.css'
})
export class EditeurList {
  protected readonly editeurService = inject(EditeurService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public showForm = signal<boolean>(false);

  ngOnInit() {
    this.editeurService.loadAll();
  }

  public toggleForm() {
    if (!this.authService.isAdminSuperorgaOrga()) return;
    this.showForm.update(v => !v);
  }

  public onDelete(id: number) {
    if (!this.authService.isAdminSuperorgaOrga()) return;
    this.editeurService.delete(id);
  }

  public onUpdate(id: number) {
    if (!this.authService.isAdminSuperorgaOrga()) return;
    console.log('TODO: ouvrir un form d’édition', id);
  }

  public onDetail(id: number) {
    this.router.navigate(['/editeurs', id]);
  }
}
