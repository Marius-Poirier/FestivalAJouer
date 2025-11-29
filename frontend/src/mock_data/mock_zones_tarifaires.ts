import { ZoneTarifaireDto } from '@interfaces/entites/zone-tarifaire-dto';

export const MOCK_ZONES_TARIFAIRES: ZoneTarifaireDto[] = [
  // Festival Montpellier 2024 (id: 1)
  {
    id: 1,
    festival_id: 1,
    nom: 'Zone Premium',
    nombre_tables_total: 20,
    prix_table: 150.00,
    created_at: new Date('2024-01-16T09:00:00'),
    updated_at: new Date('2024-01-16T09:00:00')
  },
  {
    id: 2,
    festival_id: 1,
    nom: 'Zone Standard',
    nombre_tables_total: 50,
    prix_table: 100.00,
    created_at: new Date('2024-01-16T09:05:00'),
    updated_at: new Date('2024-01-16T09:05:00')
  },
  {
    id: 3,
    festival_id: 1,
    nom: 'Zone Découverte',
    nombre_tables_total: 30,
    prix_table: 60.00,
    created_at: new Date('2024-01-16T09:10:00'),
    updated_at: new Date('2024-01-16T09:10:00')
  },

  // Festival Toulouse 2024 (id: 2)
  {
    id: 4,
    festival_id: 2,
    nom: 'Zone VIP',
    nombre_tables_total: 15,
    prix_table: 180.00,
    created_at: new Date('2024-02-11T10:00:00'),
    updated_at: new Date('2024-02-11T10:00:00')
  },
  {
    id: 5,
    festival_id: 2,
    nom: 'Zone Principale',
    nombre_tables_total: 60,
    prix_table: 120.00,
    created_at: new Date('2024-02-11T10:05:00'),
    updated_at: new Date('2024-02-11T10:05:00')
  },

  // Festival Lyon 2025 (id: 3)
  {
    id: 6,
    festival_id: 3,
    nom: 'Zone A',
    nombre_tables_total: 40,
    prix_table: 140.00,
    created_at: new Date('2024-09-23T11:00:00'),
    updated_at: new Date('2024-09-23T11:00:00')
  },
  {
    id: 7,
    festival_id: 3,
    nom: 'Zone B',
    nombre_tables_total: 35,
    prix_table: 90.00,
    created_at: new Date('2024-09-23T11:05:00'),
    updated_at: new Date('2024-09-23T11:05:00')
  },

  // Festival Paris 2025 (id: 4)
  {
    id: 8,
    festival_id: 4,
    nom: 'Zone Prestige',
    nombre_tables_total: 25,
    prix_table: 200.00,
    created_at: new Date('2024-10-06T09:00:00'),
    updated_at: new Date('2024-10-06T09:00:00')
  },
  {
    id: 9,
    festival_id: 4,
    nom: 'Zone Classique',
    nombre_tables_total: 45,
    prix_table: 130.00,
    created_at: new Date('2024-10-06T09:10:00'),
    updated_at: new Date('2024-10-06T09:10:00')
  },

  // Festival Marseille 2025 (id: 5 - Festival courant)
  {
    id: 10,
    festival_id: 5,
    nom: 'Zone Gold',
    nombre_tables_total: 30,
    prix_table: 160.00,
    created_at: new Date('2024-11-02T10:00:00'),
    updated_at: new Date('2024-11-02T10:00:00')
  },
  {
    id: 11,
    festival_id: 5,
    nom: 'Zone Silver',
    nombre_tables_total: 50,
    prix_table: 110.00,
    created_at: new Date('2024-11-02T10:05:00'),
    updated_at: new Date('2024-11-02T10:05:00')
  },
  {
    id: 12,
    festival_id: 5,
    nom: 'Zone Bronze',
    nombre_tables_total: 40,
    prix_table: 70.00,
    created_at: new Date('2024-11-02T10:10:00'),
    updated_at: new Date('2024-11-02T10:10:00')
  }
];

// Helper pour récupérer les zones d'un festival
export const getZonesTarifairesByFestival = (festivalId: number): ZoneTarifaireDto[] => {
  return MOCK_ZONES_TARIFAIRES.filter(zone => zone.festival_id === festivalId);
};