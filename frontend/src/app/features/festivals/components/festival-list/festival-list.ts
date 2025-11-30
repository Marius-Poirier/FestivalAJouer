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
  private festivalservice = inject(FestivalService)
  public festivales = this.festivalservice.festivales
  public showForm = signal<boolean>(false)
  // public showstate = this.festivalservice.showform

  // public show(){
  //   this.festivalservice.show()
  // }

  // public add(name: string, localisation: string, year: number){
  //   this.festivalservice.add(name, localisation, year)
  // }

  // public delete(id: number){
  //   this.festivalservice.delete(id)
  // }

  // public update(partial : Partial<FestivalDto> & {id: number}){
  //   this.festivalservice.update(partial)
  // }

  // public findById(id : number){
  //   return this.festivalservice.findById(id)
  // }


  // Afficher form ajouter festival
  public show(){
    this.showForm.update(f => !f)
  }

  // festivals : Festival[] =[
  //   {name : "Fest1" , localisation : "Mtp", year : 2003},
  //   {name : "Fest2" , localisation : "Madrid", year : 2025},
  //   {name : "Fest3" , localisation : "Andalucia", year : 2014}
  // ]


  // public remove(name: string): void {
  //   //la foncion filter() créé un nouveau tableau ou elle ajoute uniquement les qui on un nom diferent a celui mis en paramettre
  //   this.festivals = this.festivals.filter(f => f.name !== name);
  //   console.log('supprimé:', name);
  // }


  // public addFestival(name: string, localisation: string, year: number){
  //   const found = this.festivals.find((element)=> element.name=== name)
  //   if(found==undefined){
      
  //   }
  //   const festival: Festival = {name: name, localisation: localisation, year: year}
  //   return festival
  // }
}
