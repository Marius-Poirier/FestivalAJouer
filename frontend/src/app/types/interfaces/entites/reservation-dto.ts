import { StatutReservationWorkflow } from "../../enum/statut-workflow-reservation";
export interface ReservationDto {
    id?: number;
    editeur_id: number;
    festival_id: number;
    statut_workflow: StatutReservationWorkflow;
    editeur_presente_jeux: boolean;
    remise_pourcentage?: number;
    remise_montant?: number;
    prix_total: number;
    prix_final: number;
    commentaires_paiement?: string;
    paiement_relance: boolean;
    date_facture?: Date;
    date_paiement?: Date;
    created_at?: Date;
    created_by?: number;
    updated_at?: Date;
    updated_by?: number;
}
