export interface JeuFestivalViewDto {
  id: number;
  jeu_id: number;
  reservation_id: number;
  festival_id: number;

  dans_liste_demandee: boolean;
  dans_liste_obtenue: boolean;
  jeux_recu: boolean;

  created_at?: Date;
  updated_at?: Date;

  // Jeu
  jeu_nom: string;
  type_jeu_nom?: string | null;
  nb_joueurs_min?: number | null;
  nb_joueurs_max?: number | null;
  duree_minutes?: number | null;
  age_min?: number | null;
  age_max?: number | null;
  description?: string | null;
  lien_regles?: string | null;
  theme?: string | null;
  url_image?: string | null;
  url_video?: string | null;
  prototype?: boolean | null;

  // Réservation / éditeur (utile workflow)
  editeur_id: number;
  editeur_nom: string;
}
