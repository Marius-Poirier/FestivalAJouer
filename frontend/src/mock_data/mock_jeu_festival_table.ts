import { JeuFestivalTableDto } from '@interfaces/relations/jeu-festival-table-dto';

export const MOCK_JEU_FESTIVAL_TABLES: JeuFestivalTableDto[] = [
  // Festival Montpellier 2024 - Réservation Asmodee (tables 1, 2, 4)
  
  // Table 1 - Entrée Principale Premium (capacite: 5, actuels: 4)
  {
    jeu_festival_id: 1, // 7 Wonders
    table_id: 1
  },
  {
    jeu_festival_id: 2, // Splendor
    table_id: 1
  },
  {
    jeu_festival_id: 3, // Catan
    table_id: 1
  },
  {
    jeu_festival_id: 4, // Dobble
    table_id: 1
  },
  
  // Table 2 - Entrée Principale Premium (capacite: 5, actuels: 5 - PLEINE)
  {
    jeu_festival_id: 1, // 7 Wonders (exemplaire 2)
    table_id: 2
  },
  {
    jeu_festival_id: 2, // Splendor (exemplaire 2)
    table_id: 2
  },
  {
    jeu_festival_id: 3, // Catan (exemplaire 2)
    table_id: 2
  },
  {
    jeu_festival_id: 4, // Dobble (exemplaire 2)
    table_id: 2
  },
  {
    jeu_festival_id: 1, // 7 Wonders (exemplaire 3)
    table_id: 2
  },

  // Table 4 - Hall Central Premium (capacite: 6, actuels: 3)
  {
    jeu_festival_id: 2, // Splendor (exemplaire 3)
    table_id: 4
  },
  {
    jeu_festival_id: 3, // Catan (exemplaire 3)
    table_id: 4
  },
  {
    jeu_festival_id: 4, // Dobble (exemplaire 3)
    table_id: 4
  },

  // Festival Montpellier 2024 - Réservation Gigamic (tables 6, 7)
  
  // Table 6 - Aile Droite Standard (capacite: 4, actuels: 4 - PLEINE)
  {
    jeu_festival_id: 6, // Kingdomino
    table_id: 6
  },
  {
    jeu_festival_id: 7, // Azul
    table_id: 6
  },
  {
    jeu_festival_id: 8, // Carcassonne
    table_id: 6
  },
  {
    jeu_festival_id: 6, // Kingdomino (exemplaire 2)
    table_id: 6
  },

  // Table 7 - Aile Droite Standard (capacite: 4, actuels: 2)
  {
    jeu_festival_id: 7, // Azul (exemplaire 2)
    table_id: 7
  },
  {
    jeu_festival_id: 8, // Carcassonne (exemplaire 2)
    table_id: 7
  },

  // Festival Marseille 2025 - Réservation Asmodee (tables 12, 13, 14)
  
  // Table 14 - Espace Gold Premium (capacite: 6, actuels: 3)
  {
    jeu_festival_id: 9, // 7 Wonders
    table_id: 14
  },
  {
    jeu_festival_id: 10, // Splendor
    table_id: 14
  },
  {
    jeu_festival_id: 11, // Dobble
    table_id: 14
  },

  // Festival Marseille 2025 - Réservation Gigamic (table 17)
  
  // Table 17 - Espace Bronze (capacite: 3, actuels: 0 - mais on place quand même)
  // NOTE: Pas encore placé dans les données car réservation récente

  // Festival Marseille 2025 - Réservation Iello (table 18)
  
  // Table 18 - Espace Bronze (capacite: 3, actuels: 2)
  {
    jeu_festival_id: 13, // King of Tokyo
    table_id: 18
  },
  {
    jeu_festival_id: 13, // King of Tokyo (exemplaire 2)
    table_id: 18
  },

  // CAS DE TEST: Jeu placé sur table NON attribuée à sa réservation (WARNING)
  {
    jeu_festival_id: 11, // Dobble de la réservation Asmodee (id: 4)
    table_id: 11 // Table NOT dans la réservation Asmodee
  }
];

// Helpers
export const getJeuxByTable = (tableId: number): number[] => {
  return MOCK_JEU_FESTIVAL_TABLES
    .filter(jft => jft.table_id === tableId)
    .map(jft => jft.jeu_festival_id);
};

export const getTablesByJeuFestival = (jeuFestivalId: number): number[] => {
  return MOCK_JEU_FESTIVAL_TABLES
    .filter(jft => jft.jeu_festival_id === jeuFestivalId)
    .map(jft => jft.table_id);
};

export const getNbExemplairesJeu = (jeuFestivalId: number): number => {
  return MOCK_JEU_FESTIVAL_TABLES.filter(jft => 
    jft.jeu_festival_id === jeuFestivalId
  ).length;
};

export const getNbJeuxSurTable = (tableId: number): number => {
  return getJeuxByTable(tableId).length;
};

export const getTablesPleinementOccupees = (capacitesParTable: Map<number, number>): number[] => {
  return Array.from(capacitesParTable.entries())
    .filter(([tableId, capacite]) => getNbJeuxSurTable(tableId) >= capacite)
    .map(([tableId, _]) => tableId);
};

export const getJeuxNonPlaces = (jeuFestivalIds: number[]): number[] => {
  const placedIds = new Set(MOCK_JEU_FESTIVAL_TABLES.map(jft => jft.jeu_festival_id));
  return jeuFestivalIds.filter(id => !placedIds.has(id));
};

export const getPlacementsInconsistants = (
  jeuFestivalReservations: Map<number, number>, 
  reservationTables: Map<number, number[]>
): Array<{ jeuFestivalId: number, tableId: number }> => {
  const inconsistants: Array<{ jeuFestivalId: number, tableId: number }> = [];
  
  MOCK_JEU_FESTIVAL_TABLES.forEach(jft => {
    const reservationId = jeuFestivalReservations.get(jft.jeu_festival_id);
    if (reservationId) {
      const tablesAutorisees = reservationTables.get(reservationId) || [];
      if (!tablesAutorisees.includes(jft.table_id)) {
        inconsistants.push({
          jeuFestivalId: jft.jeu_festival_id,
          tableId: jft.table_id
        });
      }
    }
  });
  
  return inconsistants;
};

// Statistiques par table
export const getStatsOccupationTables = (tableIds: number[]) => {
  return tableIds.map(tableId => ({
    tableId,
    nbJeux: getNbJeuxSurTable(tableId),
    jeux: getJeuxByTable(tableId)
  }));
};

// Statistiques globales
export const getStatsPlacement = () => {
  const totalPlacements = MOCK_JEU_FESTIVAL_TABLES.length;
  const jeuxUniques = new Set(MOCK_JEU_FESTIVAL_TABLES.map(jft => jft.jeu_festival_id)).size;
  const tablesUtilisees = new Set(MOCK_JEU_FESTIVAL_TABLES.map(jft => jft.table_id)).size;
  
  return {
    totalPlacements,
    jeuxUniques,
    tablesUtilisees,
    exemplairesParJeu: totalPlacements / jeuxUniques
  };
};

// Notes:
// - Table 2 est PLEINE (5/5 jeux)
// - Table 6 est PLEINE (4/4 jeux)
// - Jeu festival 11 (Dobble) placé sur table 11 qui n'est PAS dans la réservation Asmodee = WARNING
// - Plusieurs jeux ont multiples exemplaires placés sur différentes tables
// - Tables 12, 13 (Asmodee Marseille) n'ont pas encore de jeux placés
// - Table 17 (Gigamic Marseille) n'a pas encore de jeux placés