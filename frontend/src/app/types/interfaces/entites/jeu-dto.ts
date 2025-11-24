export interface JeuDto {
    id?: number;
    nom: string;
    nb_joueurs_min: number;
    nb_joueurs_max: number;
    duree_minutes?: number;
    age_min: number;
    age_max?: number;
    description?: string;
    lien_regles?: string;
    created_at? : Date;
    updated_at? : Date;
}
