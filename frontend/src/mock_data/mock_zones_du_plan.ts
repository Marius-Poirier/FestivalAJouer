import { ZoneDuPlanDto } from '@interfaces/entites/zone-du-plan-dto';

export const MOCK_ZONES_DU_PLAN: ZoneDuPlanDto[] = [
  // Festival Montpellier 2024 (id: 1)
  // Zone Premium (zone_tarifaire_id: 1)
  {
    id: 1,
    festival_id: 1,
    nom: 'Entrée Principale - Premium',
    nombre_tables: 10,
    zone_tarifaire_id: 1,
    created_at: new Date('2024-01-16T10:00:00'),
    updated_at: new Date('2024-01-16T10:00:00')
  },
  {
    id: 2,
    festival_id: 1,
    nom: 'Hall Central - Premium',
    nombre_tables: 10,
    zone_tarifaire_id: 1,
    created_at: new Date('2024-01-16T10:05:00'),
    updated_at: new Date('2024-01-16T10:05:00')
  },
  // Zone Standard (zone_tarifaire_id: 2)
  {
    id: 3,
    festival_id: 1,
    nom: 'Aile Droite - Standard',
    nombre_tables: 25,
    zone_tarifaire_id: 2,
    created_at: new Date('2024-01-16T10:10:00'),
    updated_at: new Date('2024-01-16T10:10:00')
  },
  {
    id: 4,
    festival_id: 1,
    nom: 'Aile Gauche - Standard',
    nombre_tables: 25,
    zone_tarifaire_id: 2,
    created_at: new Date('2024-01-16T10:15:00'),
    updated_at: new Date('2024-01-16T10:15:00')
  },
  // Zone Découverte (zone_tarifaire_id: 3)
  {
    id: 5,
    festival_id: 1,
    nom: 'Espace Nouveautés',
    nombre_tables: 15,
    zone_tarifaire_id: 3,
    created_at: new Date('2024-01-16T10:20:00'),
    updated_at: new Date('2024-01-16T10:20:00')
  },
  {
    id: 6,
    festival_id: 1,
    nom: 'Coin Indépendants',
    nombre_tables: 15,
    zone_tarifaire_id: 3,
    created_at: new Date('2024-01-16T10:25:00'),
    updated_at: new Date('2024-01-16T10:25:00')
  },

  // Festival Toulouse 2024 (id: 2)
  // Zone VIP (zone_tarifaire_id: 4)
  {
    id: 7,
    festival_id: 2,
    nom: 'Salon VIP',
    nombre_tables: 15,
    zone_tarifaire_id: 4,
    created_at: new Date('2024-02-11T11:00:00'),
    updated_at: new Date('2024-02-11T11:00:00')
  },
  // Zone Principale (zone_tarifaire_id: 5)
  {
    id: 8,
    festival_id: 2,
    nom: 'Hall Principal Nord',
    nombre_tables: 30,
    zone_tarifaire_id: 5,
    created_at: new Date('2024-02-11T11:05:00'),
    updated_at: new Date('2024-02-11T11:05:00')
  },
  {
    id: 9,
    festival_id: 2,
    nom: 'Hall Principal Sud',
    nombre_tables: 30,
    zone_tarifaire_id: 5,
    created_at: new Date('2024-02-11T11:10:00'),
    updated_at: new Date('2024-02-11T11:10:00')
  },

  // Festival Lyon 2025 (id: 3)
  // Zone A (zone_tarifaire_id: 6)
  {
    id: 10,
    festival_id: 3,
    nom: 'Pavillon A1',
    nombre_tables: 20,
    zone_tarifaire_id: 6,
    created_at: new Date('2024-09-23T12:00:00'),
    updated_at: new Date('2024-09-23T12:00:00')
  },
  {
    id: 11,
    festival_id: 3,
    nom: 'Pavillon A2',
    nombre_tables: 20,
    zone_tarifaire_id: 6,
    created_at: new Date('2024-09-23T12:05:00'),
    updated_at: new Date('2024-09-23T12:05:00')
  },
  // Zone B (zone_tarifaire_id: 7)
  {
    id: 12,
    festival_id: 3,
    nom: 'Pavillon B',
    nombre_tables: 35,
    zone_tarifaire_id: 7,
    created_at: new Date('2024-09-23T12:10:00'),
    updated_at: new Date('2024-09-23T12:10:00')
  },

  // Festival Paris 2025 (id: 4)
  // Zone Prestige (zone_tarifaire_id: 8)
  {
    id: 13,
    festival_id: 4,
    nom: 'Grande Salle Prestige',
    nombre_tables: 25,
    zone_tarifaire_id: 8,
    created_at: new Date('2024-10-06T10:00:00'),
    updated_at: new Date('2024-10-06T10:00:00')
  },
  // Zone Classique (zone_tarifaire_id: 9)
  {
    id: 14,
    festival_id: 4,
    nom: 'Salle Classique Est',
    nombre_tables: 20,
    zone_tarifaire_id: 9,
    created_at: new Date('2024-10-06T10:05:00'),
    updated_at: new Date('2024-10-06T10:05:00')
  },
  {
    id: 15,
    festival_id: 4,
    nom: 'Salle Classique Ouest',
    nombre_tables: 25,
    zone_tarifaire_id: 9,
    created_at: new Date('2024-10-06T10:10:00'),
    updated_at: new Date('2024-10-06T10:10:00')
  },

  // Festival Marseille 2025 (id: 5 - Festival courant)
  // Zone Gold (zone_tarifaire_id: 10)
  {
    id: 16,
    festival_id: 5,
    nom: 'Espace Gold Premium',
    nombre_tables: 15,
    zone_tarifaire_id: 10,
    created_at: new Date('2024-11-02T11:00:00'),
    updated_at: new Date('2024-11-02T11:00:00')
  },
  {
    id: 17,
    festival_id: 5,
    nom: 'Espace Gold Deluxe',
    nombre_tables: 15,
    zone_tarifaire_id: 10,
    created_at: new Date('2024-11-02T11:05:00'),
    updated_at: new Date('2024-11-02T11:05:00')
  },
  // Zone Silver (zone_tarifaire_id: 11)
  {
    id: 18,
    festival_id: 5,
    nom: 'Hall Silver A',
    nombre_tables: 25,
    zone_tarifaire_id: 11,
    created_at: new Date('2024-11-02T11:10:00'),
    updated_at: new Date('2024-11-02T11:10:00')
  },
  {
    id: 19,
    festival_id: 5,
    nom: 'Hall Silver B',
    nombre_tables: 25,
    zone_tarifaire_id: 11,
    created_at: new Date('2024-11-02T11:15:00'),
    updated_at: new Date('2024-11-02T11:15:00')
  },
  // Zone Bronze (zone_tarifaire_id: 12)
  {
    id: 20,
    festival_id: 5,
    nom: 'Espace Bronze',
    nombre_tables: 40,
    zone_tarifaire_id: 12,
    created_at: new Date('2024-11-02T11:20:00'),
    updated_at: new Date('2024-11-02T11:20:00')
  }
];

// Helper pour récupérer les zones du plan d'un festival
export const getZonesDuPlanByFestival = (festivalId: number): ZoneDuPlanDto[] => {
  return MOCK_ZONES_DU_PLAN.filter(zone => zone.festival_id === festivalId);
};

// Helper pour récupérer les zones du plan d'une zone tarifaire
export const getZonesDuPlanByZoneTarifaire = (zoneTarifaireId: number): ZoneDuPlanDto[] => {
  return MOCK_ZONES_DU_PLAN.filter(zone => zone.zone_tarifaire_id === zoneTarifaireId);
};