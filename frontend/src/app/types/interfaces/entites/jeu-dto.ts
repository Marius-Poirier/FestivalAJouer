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

    theme?: string;
    url_image?: string;
    url_video?: string;
    prototype?: boolean;
    type_jeu_id?: number;
    type_jeu_nom?: string;

    editeurs?: { id: number; nom: string }[];
    mecanismes?: { id: number; nom: string }[];
}
