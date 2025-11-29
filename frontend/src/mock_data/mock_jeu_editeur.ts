import { JeuEditeurDto } from '@interfaces/relations/jeu-editeur-dto';

export const MOCK_JEU_EDITEUR: JeuEditeurDto[] = [
  // 7 Wonders (jeu_id: 1) - Asmodee
  {
    jeu_id: 1,
    editeur_id: 1
  },

  // Les Aventuriers du Rail (jeu_id: 2) - Days of Wonder
  {
    jeu_id: 2,
    editeur_id: 2
  },

  // Splendor (jeu_id: 3) - Asmodee
  {
    jeu_id: 3,
    editeur_id: 1
  },

  // King of Tokyo (jeu_id: 4) - Iello
  {
    jeu_id: 4,
    editeur_id: 4
  },

  // Kingdomino (jeu_id: 5) - Gigamic
  {
    jeu_id: 5,
    editeur_id: 3
  },

  // Azul (jeu_id: 6) - Gigamic
  {
    jeu_id: 6,
    editeur_id: 3
  },

  // Catan (jeu_id: 7) - Asmodee
  {
    jeu_id: 7,
    editeur_id: 1
  },

  // Dobble (jeu_id: 8) - Asmodee
  {
    jeu_id: 8,
    editeur_id: 1
  },

  // Pandemic (jeu_id: 9) - Asmodee
  {
    jeu_id: 9,
    editeur_id: 1
  },

  // Carcassonne (jeu_id: 10) - Gigamic
  {
    jeu_id: 10,
    editeur_id: 3
  }
];

// Helpers
export const getJeuxByEditeur = (editeurId: number): number[] => {
  return MOCK_JEU_EDITEUR
    .filter(je => je.editeur_id === editeurId)
    .map(je => je.jeu_id);
};

export const getEditeursByJeu = (jeuId: number): number[] => {
  return MOCK_JEU_EDITEUR
    .filter(je => je.jeu_id === jeuId)
    .map(je => je.editeur_id);
};

// Statistiques
export const getStatsJeuxParEditeur = () => {
  return {
    1: getJeuxByEditeur(1).length, // Asmodee: 5 jeux
    2: getJeuxByEditeur(2).length, // Days of Wonder: 1 jeu
    3: getJeuxByEditeur(3).length, // Gigamic: 3 jeux
    4: getJeuxByEditeur(4).length, // Iello: 1 jeu
    5: getJeuxByEditeur(5).length  // Matagot: 0 jeux
  };
};

// Note: Dans le modèle, un jeu peut avoir plusieurs éditeurs (co-édition)
// Ici chaque jeu a un seul éditeur pour simplifier