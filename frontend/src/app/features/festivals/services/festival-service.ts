import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { FestivalDto } from '@interfaces/entites/festival-dto';
import { MOCK_FESTIVALS } from 'src/mock_data/mock_festivals'; 

@Injectable({
  providedIn: 'root'
})
export class FestivalService {
  private readonly http = inject(HttpClient)
  // private readonly baseUrl = 'https://localhost:4000/festivals'

  private readonly _festivales = signal<FestivalDto[]>(MOCK_FESTIVALS)
  readonly festivales = this._festivales.asReadonly()

  private readonly _showform = signal(false)
  readonly showform = this._showform.asReadonly()

  public add(nom: string, localisation : string, year : number){
    const alreadyAdded = this._festivales().find((f)=> f.nom === nom )
    try{
      if(alreadyAdded === undefined){
        const id = this._festivales().length > 0 ? Math.max(...this._festivales().map( f => f.id || 0)) + 1 : 1
        const newfestival : FestivalDto = {id : id , nom : nom}
        this._festivales.update(festivales => [...festivales, newfestival])
        console.log('Festivale ajouter avec succée', id)
      }
      else{console.log('Festivale déjà ajouter')}
    }catch(error){
      console.log("Error lors de l'ajout", error)
    }

  }

//   public delete(id : number){
//     try{
//       this._festivales.update(festivales => festivales.filter(f  => f.id != id))
//       console.log("Festivale supprimée :", id)
//     }catch(error){
//       console.error("Erreur lors de la suppression :", error)
//     }

//   }

//   public update(partial : Partial<FestivalDto> &{id: number}) : void{
//     this._festivales.update(list=>list.map(f => (f.id === partial.id ? {...f, ...partial} : f)))
//     //fusioner avec partial
//   }

//   public findById(id : number){
//     return this._festivales().find((f)=>f.id === id)
//   }

// //methode avec service mais on peut utiliser model() dans le composant fest list
//   public show(){
//     this._showform.update(f => !f)
//   }

//   public close(){
//     this._showform.set(false)
//   }

  
}
