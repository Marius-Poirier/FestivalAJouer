export interface ContactEditeurDto { 
    id?: number;
    editeur_id: number;
    festival_id: number;
    utilisateur_id: number;
    date_contact: Date;
    notes?: string;
}
