import { JeuFestivalDto } from '@interfaces/relations/jeu-festival-dto';

export const MOCK_JEUX_FESTIVAL: JeuFestivalDto[] = [
  // Festival Montpellier 2024 - Réservation Asmodee (id: 1) - COMPLÈTE
  {
    id: 1,
    jeu_id: 1, // 7 Wonders
    reservation_id: 1,
    festival_id: 1,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: true,
    created_at: new Date('2024-02-10T10:00:00'),
    updated_at: new Date('2024-03-20T14:30:00')
  },
  {
    id: 2,
    jeu_id: 3, // Splendor
    reservation_id: 1,
    festival_id: 1,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: true,
    created_at: new Date('2024-02-10T10:05:00'),
    updated_at: new Date('2024-03-20T14:35:00')
  },
  {
    id: 3,
    jeu_id: 7, // Catan
    reservation_id: 1,
    festival_id: 1,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: true,
    created_at: new Date('2024-02-10T10:10:00'),
    updated_at: new Date('2024-03-20T14:40:00')
  },
  {
    id: 4,
    jeu_id: 8, // Dobble
    reservation_id: 1,
    festival_id: 1,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: true,
    created_at: new Date('2024-02-10T10:15:00'),
    updated_at: new Date('2024-03-20T14:45:00')
  },
  {
    id: 5,
    jeu_id: 9, // Pandemic
    reservation_id: 1,
    festival_id: 1,
    dans_liste_demandee: true,
    dans_liste_obtenue: false, // Demandé mais pas obtenu
    jeux_recu: false,
    created_at: new Date('2024-02-10T10:20:00'),
    updated_at: new Date('2024-02-25T11:00:00')
  },

  // Festival Montpellier 2024 - Réservation Gigamic (id: 3) - COMPLÈTE
  {
    id: 6,
    jeu_id: 5, // Kingdomino
    reservation_id: 3,
    festival_id: 1,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: true,
    created_at: new Date('2024-02-12T11:00:00'),
    updated_at: new Date('2024-03-15T10:30:00')
  },
  {
    id: 7,
    jeu_id: 6, // Azul
    reservation_id: 3,
    festival_id: 1,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: true,
    created_at: new Date('2024-02-12T11:05:00'),
    updated_at: new Date('2024-03-15T10:35:00')
  },
  {
    id: 8,
    jeu_id: 10, // Carcassonne
    reservation_id: 3,
    festival_id: 1,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: true,
    created_at: new Date('2024-02-12T11:10:00'),
    updated_at: new Date('2024-03-15T10:40:00')
  },

  // Festival Marseille 2025 - Réservation Asmodee (id: 4) - EN COURS
  {
    id: 9,
    jeu_id: 1, // 7 Wonders
    reservation_id: 4,
    festival_id: 5,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: false, // Pas encore reçu
    created_at: new Date('2024-11-06T10:00:00'),
    updated_at: new Date('2024-11-20T15:00:00')
  },
  {
    id: 10,
    jeu_id: 3, // Splendor
    reservation_id: 4,
    festival_id: 5,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: false,
    created_at: new Date('2024-11-06T10:05:00'),
    updated_at: new Date('2024-11-20T15:05:00')
  },
  {
    id: 11,
    jeu_id: 8, // Dobble
    reservation_id: 4,
    festival_id: 5,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: false,
    created_at: new Date('2024-11-06T10:10:00'),
    updated_at: new Date('2024-11-20T15:10:00')
  },
  {
    id: 12,
    jeu_id: 9, // Pandemic
    reservation_id: 4,
    festival_id: 5,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: true, // Reçu en avance
    created_at: new Date('2024-11-06T10:15:00'),
    updated_at: new Date('2024-11-25T09:30:00')
  },

  // Festival Marseille 2025 - Réservation Iello (id: 5) - EN COURS
  {
    id: 13,
    jeu_id: 4, // King of Tokyo
    reservation_id: 5,
    festival_id: 5,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: false,
    created_at: new Date('2024-11-09T12:00:00'),
    updated_at: new Date('2024-11-22T11:30:00')
  },

  // Festival Marseille 2025 - Réservation Gigamic (id: 8) - EN COURS
  {
    id: 14,
    jeu_id: 5, // Kingdomino
    reservation_id: 8,
    festival_id: 5,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: false,
    created_at: new Date('2024-11-16T11:00:00'),
    updated_at: new Date('2024-11-26T10:00:00')
  },
  {
    id: 15,
    jeu_id: 6, // Azul
    reservation_id: 8,
    festival_id: 5,
    dans_liste_demandee: true,
    dans_liste_obtenue: true,
    jeux_recu: false,
    created_at: new Date('2024-11-16T11:05:00'),
    updated_at: new Date('2024-11-26T10:05:00')
  },
  {
    id: 16,
    jeu_id: 10, // Carcassonne
    reservation_id: 8,
    festival_id: 5,
    dans_liste_demandee: true,
    dans_liste_obtenue: false, // Demandé mais pas encore confirmé
    jeux_recu: false,
    created_at: new Date('2024-11-16T11:10:00'),
    updated_at: new Date('2024-11-16T11:10:00')
  },

  // Festival Marseille 2025 - Réservation Matagot (id: 6) - DISCUSSION
  {
    id: 17,
    jeu_id: 2, // Les Aventuriers du Rail (jeu d'un autre éditeur pour test)
    reservation_id: 6,
    festival_id: 5,
    dans_liste_demandee: true,
    dans_liste_obtenue: false, // En négociation
    jeux_recu: false,
    created_at: new Date('2024-11-11T16:30:00'),
    updated_at: new Date('2024-11-11T16:30:00')
  }
];

// Helpers
export const getJeuxByReservation = (reservationId: number): JeuFestivalDto[] => {
  return MOCK_JEUX_FESTIVAL.filter(jf => jf.reservation_id === reservationId);
};

export const getJeuxByFestival = (festivalId: number): JeuFestivalDto[] => {
  return MOCK_JEUX_FESTIVAL.filter(jf => jf.festival_id === festivalId);
};

export const getJeuxDemandes = (reservationId: number): JeuFestivalDto[] => {
  return MOCK_JEUX_FESTIVAL.filter(jf => 
    jf.reservation_id === reservationId && jf.dans_liste_demandee
  );
};

export const getJeuxObtenus = (reservationId: number): JeuFestivalDto[] => {
  return MOCK_JEUX_FESTIVAL.filter(jf => 
    jf.reservation_id === reservationId && jf.dans_liste_obtenue
  );
};

export const getJeuxRecus = (reservationId: number): JeuFestivalDto[] => {
  return MOCK_JEUX_FESTIVAL.filter(jf => 
    jf.reservation_id === reservationId && jf.jeux_recu
  );
};

export const getJeuxEnAttente = (reservationId: number): JeuFestivalDto[] => {
  return MOCK_JEUX_FESTIVAL.filter(jf => 
    jf.reservation_id === reservationId && 
    jf.dans_liste_obtenue && 
    !jf.jeux_recu
  );
};

// Statistiques
export const getStatsJeuxByReservation = (reservationId: number) => {
  const jeux = getJeuxByReservation(reservationId);
  return {
    total_demandes: jeux.filter(j => j.dans_liste_demandee).length,
    total_obtenus: jeux.filter(j => j.dans_liste_obtenue).length,
    total_recus: jeux.filter(j => j.jeux_recu).length,
    en_attente_reception: jeux.filter(j => j.dans_liste_obtenue && !j.jeux_recu).length
  };
};

export const getStatsJeuxByFestival = (festivalId: number) => {
  const jeux = getJeuxByFestival(festivalId);
  return {
    total_jeux: jeux.length,
    total_recus: jeux.filter(j => j.jeux_recu).length,
    total_en_attente: jeux.filter(j => j.dans_liste_obtenue && !j.jeux_recu).length,
    total_refuses: jeux.filter(j => j.dans_liste_demandee && !j.dans_liste_obtenue).length
  };
};