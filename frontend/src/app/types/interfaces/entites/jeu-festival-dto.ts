export interface JeuFestivalDto {
  id?: number;
  jeu_id: number;
  reservation_id: number;
  festival_id: number;
  dans_liste_demandee: boolean;
  dans_liste_obtenue: boolean;
  jeux_recu: boolean;
  created_at?: Date;
  updated_at?: Date;
}
