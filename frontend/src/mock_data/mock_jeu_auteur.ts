import { JeuAuteurDto } from '@interfaces/relations/jeu-auteur-dto';

export const MOCK_JEU_AUTEUR: JeuAuteurDto[] = [
  // 7 Wonders (jeu_id: 1) - Antoine Bauza
  {
    jeu_id: 1,
    personne_id: 6
  },

  // Les Aventuriers du Rail (jeu_id: 2) - Alan Moon
  {
    jeu_id: 2,
    personne_id: 8
  },

  // Splendor (jeu_id: 3) - Co-création (données fictives pour l'exemple)
  {
    jeu_id: 3,
    personne_id: 9 // Reiner Knizia
  },

  // King of Tokyo (jeu_id: 4) - Co-création
  {
    jeu_id: 4,
    personne_id: 6 // Antoine Bauza
  },
  {
    jeu_id: 4,
    personne_id: 9 // Reiner Knizia (co-auteur fictif)
  },

  // Kingdomino (jeu_id: 5) - Bruno Cathala
  {
    jeu_id: 5,
    personne_id: 7
  },

  // Azul (jeu_id: 6) - Reiner Knizia
  {
    jeu_id: 6,
    personne_id: 9
  },

  // Catan (jeu_id: 7) - Uwe Rosenberg (fictif, normalement Klaus Teuber)
  {
    jeu_id: 7,
    personne_id: 10
  },

  // Dobble (jeu_id: 8) - Bruno Cathala (fictif)
  {
    jeu_id: 8,
    personne_id: 7
  },

  // Pandemic (jeu_id: 9) - Alan Moon (fictif, normalement Matt Leacock)
  {
    jeu_id: 9,
    personne_id: 8
  },

  // Carcassonne (jeu_id: 10) - Bruno Cathala & Antoine Bauza (co-création fictive)
  {
    jeu_id: 10,
    personne_id: 6
  },
  {
    jeu_id: 10,
    personne_id: 7
  }
];

// Helpers
export const getAuteursByJeu = (jeuId: number): number[] => {
  return MOCK_JEU_AUTEUR
    .filter(ja => ja.jeu_id === jeuId)
    .map(ja => ja.personne_id);
};

export const getJeuxByAuteur = (personneId: number): number[] => {
  return MOCK_JEU_AUTEUR
    .filter(ja => ja.personne_id === personneId)
    .map(ja => ja.jeu_id);
};

export const getJeuxCoCreation = (): number[] => {
  const jeuxAvecPlusieursAuteurs = new Map<number, number>();
  
  MOCK_JEU_AUTEUR.forEach(ja => {
    jeuxAvecPlusieursAuteurs.set(
      ja.jeu_id, 
      (jeuxAvecPlusieursAuteurs.get(ja.jeu_id) || 0) + 1
    );
  });
  
  return Array.from(jeuxAvecPlusieursAuteurs.entries())
    .filter(([_, count]) => count > 1)
    .map(([jeuId, _]) => jeuId);
};

// Statistiques
export const getStatsJeuxParAuteur = () => {
  return {
    6: getJeuxByAuteur(6).length,  // Antoine Bauza: 3 jeux
    7: getJeuxByAuteur(7).length,  // Bruno Cathala: 3 jeux
    8: getJeuxByAuteur(8).length,  // Alan Moon: 2 jeux
    9: getJeuxByAuteur(9).length,  // Reiner Knizia: 3 jeux
    10: getJeuxByAuteur(10).length // Uwe Rosenberg: 1 jeu
  };
};

// Note: 
// - Les auteurs réels peuvent différer (données fictives pour test)
// - Plusieurs jeux ont des co-auteurs (King of Tokyo, Carcassonne)
// - Les auteurs (personne_id 6-10) sont distincts des contacts éditeurs (personne_id 1-5)