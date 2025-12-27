import { StatutTable } from "@enum/statut-table";

export interface TableJeuDto {
  id?: number;
  zone_du_plan_id: number;
  zone_tarifaire_id: number;
  capacite_jeux: number;
  nb_jeux_actuels?: number;
  statut?: StatutTable;
  created_at? : Date;
  updated_at? : Date;

}
