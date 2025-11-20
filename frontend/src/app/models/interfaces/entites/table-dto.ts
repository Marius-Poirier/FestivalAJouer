import { TableStatut } from "../../enum/table-statut";

export interface TableDto {
  id?: number;
  zone_du_plan_id: number;
  zone_tarifaire_id: number;
  capacite_jeux: number;
  nb_jeux_actuels?: number;
  statut: TableStatut;

}
