import { ReservationTableDto } from '@interfaces/relations/reservation-table-dto';

export const MOCK_RESERVATION_TABLES: ReservationTableDto[] = [
  // Festival Montpellier 2024 - Réservation Asmodee (id: 1) - 3 tables Premium
  {
    reservation_id: 1,
    table_id: 1, // Entrée Principale - Premium
    date_attribution: new Date('2024-02-10T14:00:00'),
    attribue_par: 2 // Marie Dupont
  },
  {
    reservation_id: 1,
    table_id: 2, // Entrée Principale - Premium
    date_attribution: new Date('2024-02-10T14:05:00'),
    attribue_par: 2
  },
  {
    reservation_id: 1,
    table_id: 4, // Hall Central - Premium
    date_attribution: new Date('2024-02-10T14:10:00'),
    attribue_par: 2
  },

  // Festival Montpellier 2024 - Réservation Gigamic (id: 3) - 2 tables Standard
  {
    reservation_id: 3,
    table_id: 6, // Aile Droite - Standard
    date_attribution: new Date('2024-02-12T15:00:00'),
    attribue_par: 2
  },
  {
    reservation_id: 3,
    table_id: 7, // Aile Droite - Standard
    date_attribution: new Date('2024-02-12T15:05:00'),
    attribue_par: 2
  },

  // Festival Marseille 2025 - Réservation Asmodee (id: 4) - 4 tables Gold
  {
    reservation_id: 4,
    table_id: 12, // Espace Gold Premium
    date_attribution: new Date('2024-11-18T10:00:00'),
    attribue_par: 2
  },
  {
    reservation_id: 4,
    table_id: 13, // Espace Gold Premium
    date_attribution: new Date('2024-11-18T10:05:00'),
    attribue_par: 2
  },
  {
    reservation_id: 4,
    table_id: 14, // Espace Gold Premium
    date_attribution: new Date('2024-11-18T10:10:00'),
    attribue_par: 2
  },
  {
    reservation_id: 4,
    table_id: 16, // Hall Silver A (mais zone_tarifaire Gold - table flexible)
    date_attribution: new Date('2024-11-18T10:15:00'),
    attribue_par: 2
  },

  // Festival Marseille 2025 - Réservation Iello (id: 5) - 3 tables Silver
  {
    reservation_id: 5,
    table_id: 15, // Hall Silver A
    date_attribution: new Date('2024-11-22T14:00:00'),
    attribue_par: 3 // Jean Martin
  },
  {
    reservation_id: 5,
    table_id: 16, // Hall Silver A (NOTE: conflit avec Asmodee - pour tester)
    date_attribution: new Date('2024-11-23T09:00:00'),
    attribue_par: 3
  },
  {
    reservation_id: 5,
    table_id: 18, // Espace Bronze (zone différente - warning attendu)
    date_attribution: new Date('2024-11-22T14:10:00'),
    attribue_par: 3
  },

  // Festival Marseille 2025 - Réservation Gigamic (id: 8) - 4 tables (3 Silver + 1 Bronze)
  {
    reservation_id: 8,
    table_id: 17, // Espace Bronze
    date_attribution: new Date('2024-11-26T11:00:00'),
    attribue_par: 2
  }
];

// Helpers
export const getTablesByReservation = (reservationId: number): number[] => {
  return MOCK_RESERVATION_TABLES
    .filter(rt => rt.reservation_id === reservationId)
    .map(rt => rt.table_id);
};

export const getReservationByTable = (tableId: number): number | undefined => {
  const reservation = MOCK_RESERVATION_TABLES.find(rt => rt.table_id === tableId);
  return reservation?.reservation_id;
};

export const getAttributionDetails = (reservationId: number, tableId: number): ReservationTableDto | undefined => {
  return MOCK_RESERVATION_TABLES.find(rt => 
    rt.reservation_id === reservationId && rt.table_id === tableId
  );
};

export const getTablesConflits = (): number[] => {
  const tableOccurrences = new Map<number, number>();
  
  MOCK_RESERVATION_TABLES.forEach(rt => {
    tableOccurrences.set(rt.table_id, (tableOccurrences.get(rt.table_id) || 0) + 1);
  });
  
  return Array.from(tableOccurrences.entries())
    .filter(([_, count]) => count > 1)
    .map(([tableId, _]) => tableId);
};

export const getNbTablesAttribuees = (reservationId: number): number => {
  return getTablesByReservation(reservationId).length;
};

export const getAttributionsRecentes = (heures: number = 24): ReservationTableDto[] => {
  const limite = new Date(Date.now() - heures * 60 * 60 * 1000);
  return MOCK_RESERVATION_TABLES.filter(rt => 
    rt.date_attribution && rt.date_attribution > limite
  );
};

// Statistiques
export const getStatsAttributions = () => {
  const total = MOCK_RESERVATION_TABLES.length;
  const conflits = getTablesConflits().length;
  const parUtilisateur = MOCK_RESERVATION_TABLES.reduce((acc, rt) => {
    const userId = rt.attribue_par || 0;
    acc[userId] = (acc[userId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  return { total, conflits, parUtilisateur };
};

// Notes:
// - Table 16 est attribuée 2 fois (Asmodee et Iello) - CONFLIT intentionnel
// - Table 18 (Bronze) attribuée à réservation Iello (Silver attendu) - WARNING zone différente
// - Ces cas permettent de tester les alertes de l'interface