import { TableJeuDto } from '@interfaces/entites/table-jeu-dto';
import { StatutTable } from '@enum/statut-table';

export const MOCK_TABLES_JEU: TableJeuDto[] = [
  // Festival Montpellier 2024 - Entrée Principale Premium (zone_du_plan_id: 1)
  {
    id: 1,
    zone_du_plan_id: 1,
    zone_tarifaire_id: 1,
    capacite_jeux: 5,
    nb_jeux_actuels: 4,
    statut: StatutTable.RESERVEE,
    created_at: new Date('2024-01-17T09:00:00'),
    updated_at: new Date('2024-11-20T14:30:00')
  },
  {
    id: 2,
    zone_du_plan_id: 1,
    zone_tarifaire_id: 1,
    capacite_jeux: 5,
    nb_jeux_actuels: 5,
    statut: StatutTable.OCCUPEE,
    created_at: new Date('2024-01-17T09:05:00'),
    updated_at: new Date('2024-11-21T10:15:00')
  },
  {
    id: 3,
    zone_du_plan_id: 1,
    zone_tarifaire_id: 1,
    capacite_jeux: 5,
    nb_jeux_actuels: 0,
    statut: StatutTable.LIBRE,
    created_at: new Date('2024-01-17T09:10:00'),
    updated_at: new Date('2024-01-17T09:10:00')
  },

  // Festival Montpellier 2024 - Hall Central Premium (zone_du_plan_id: 2)
  {
    id: 4,
    zone_du_plan_id: 2,
    zone_tarifaire_id: 1,
    capacite_jeux: 6,
    nb_jeux_actuels: 3,
    statut: StatutTable.RESERVEE,
    created_at: new Date('2024-01-17T09:15:00'),
    updated_at: new Date('2024-11-19T16:20:00')
  },
  {
    id: 5,
    zone_du_plan_id: 2,
    zone_tarifaire_id: 1,
    capacite_jeux: 6,
    nb_jeux_actuels: 0,
    statut: StatutTable.LIBRE,
    created_at: new Date('2024-01-17T09:20:00'),
    updated_at: new Date('2024-01-17T09:20:00')
  },

  // Festival Montpellier 2024 - Aile Droite Standard (zone_du_plan_id: 3)
  {
    id: 6,
    zone_du_plan_id: 3,
    zone_tarifaire_id: 2,
    capacite_jeux: 4,
    nb_jeux_actuels: 4,
    statut: StatutTable.OCCUPEE,
    created_at: new Date('2024-01-17T09:25:00'),
    updated_at: new Date('2024-11-22T11:45:00')
  },
  {
    id: 7,
    zone_du_plan_id: 3,
    zone_tarifaire_id: 2,
    capacite_jeux: 4,
    nb_jeux_actuels: 2,
    statut: StatutTable.RESERVEE,
    created_at: new Date('2024-01-17T09:30:00'),
    updated_at: new Date('2024-11-20T15:30:00')
  },
  {
    id: 8,
    zone_du_plan_id: 3,
    zone_tarifaire_id: 2,
    capacite_jeux: 4,
    nb_jeux_actuels: 0,
    statut: StatutTable.LIBRE,
    created_at: new Date('2024-01-17T09:35:00'),
    updated_at: new Date('2024-01-17T09:35:00')
  },
  {
    id: 9,
    zone_du_plan_id: 3,
    zone_tarifaire_id: 2,
    capacite_jeux: 4,
    nb_jeux_actuels: 0,
    statut: StatutTable.LIBRE,
    created_at: new Date('2024-01-17T09:40:00'),
    updated_at: new Date('2024-01-17T09:40:00')
  },

  // Festival Montpellier 2024 - Espace Nouveautés (zone_du_plan_id: 5)
  {
    id: 10,
    zone_du_plan_id: 5,
    zone_tarifaire_id: 3,
    capacite_jeux: 3,
    nb_jeux_actuels: 0,
    statut: StatutTable.LIBRE,
    created_at: new Date('2024-01-17T09:45:00'),
    updated_at: new Date('2024-01-17T09:45:00')
  },
  {
    id: 11,
    zone_du_plan_id: 5,
    zone_tarifaire_id: 3,
    capacite_jeux: 3,
    nb_jeux_actuels: 1,
    statut: StatutTable.RESERVEE,
    created_at: new Date('2024-01-17T09:50:00'),
    updated_at: new Date('2024-11-18T13:20:00')
  },

  // Festival Marseille 2025 (courant) - Espace Gold Premium (zone_du_plan_id: 16)
  {
    id: 12,
    zone_du_plan_id: 16,
    zone_tarifaire_id: 10,
    capacite_jeux: 6,
    nb_jeux_actuels: 0,
    statut: StatutTable.LIBRE,
    created_at: new Date('2024-11-03T10:00:00'),
    updated_at: new Date('2024-11-03T10:00:00')
  },
  {
    id: 13,
    zone_du_plan_id: 16,
    zone_tarifaire_id: 10,
    capacite_jeux: 6,
    nb_jeux_actuels: 0,
    statut: StatutTable.LIBRE,
    created_at: new Date('2024-11-03T10:05:00'),
    updated_at: new Date('2024-11-03T10:05:00')
  },
  {
    id: 14,
    zone_du_plan_id: 16,
    zone_tarifaire_id: 10,
    capacite_jeux: 6,
    nb_jeux_actuels: 3,
    statut: StatutTable.RESERVEE,
    created_at: new Date('2024-11-03T10:10:00'),
    updated_at: new Date('2024-11-25T09:30:00')
  },

  // Festival Marseille 2025 - Hall Silver A (zone_du_plan_id: 18)
  {
    id: 15,
    zone_du_plan_id: 18,
    zone_tarifaire_id: 11,
    capacite_jeux: 4,
    nb_jeux_actuels: 0,
    statut: StatutTable.LIBRE,
    created_at: new Date('2024-11-03T10:15:00'),
    updated_at: new Date('2024-11-03T10:15:00')
  },
  {
    id: 16,
    zone_du_plan_id: 18,
    zone_tarifaire_id: 11,
    capacite_jeux: 4,
    nb_jeux_actuels: 0,
    statut: StatutTable.LIBRE,
    created_at: new Date('2024-11-03T10:20:00'),
    updated_at: new Date('2024-11-03T10:20:00')
  },

  // Festival Marseille 2025 - Espace Bronze (zone_du_plan_id: 20)
  {
    id: 17,
    zone_du_plan_id: 20,
    zone_tarifaire_id: 12,
    capacite_jeux: 3,
    nb_jeux_actuels: 0,
    statut: StatutTable.LIBRE,
    created_at: new Date('2024-11-03T10:25:00'),
    updated_at: new Date('2024-11-03T10:25:00')
  },
  {
    id: 18,
    zone_du_plan_id: 20,
    zone_tarifaire_id: 12,
    capacite_jeux: 3,
    nb_jeux_actuels: 2,
    statut: StatutTable.RESERVEE,
    created_at: new Date('2024-11-03T10:30:00'),
    updated_at: new Date('2024-11-26T14:15:00')
  },
  {
    id: 19,
    zone_du_plan_id: 20,
    zone_tarifaire_id: 12,
    capacite_jeux: 3,
    nb_jeux_actuels: 0,
    statut: StatutTable.HORS_SERVICE,
    created_at: new Date('2024-11-03T10:35:00'),
    updated_at: new Date('2024-11-25T16:00:00')
  },

  // Table avec incohérence zone tarifaire (pour tester les warnings)
  {
    id: 20,
    zone_du_plan_id: 18, // Hall Silver A
    zone_tarifaire_id: 10, // Mais zone_tarifaire Gold (incohérent)
    capacite_jeux: 5,
    nb_jeux_actuels: 1,
    statut: StatutTable.RESERVEE,
    created_at: new Date('2024-11-03T10:40:00'),
    updated_at: new Date('2024-11-24T11:20:00')
  }
];

export const getTablesByZoneDuPlan = (zoneDuPlanId: number): TableJeuDto[] => {
  return MOCK_TABLES_JEU.filter(table => table.zone_du_plan_id === zoneDuPlanId);
};

export const getTablesByStatut = (statut: StatutTable): TableJeuDto[] => {
  return MOCK_TABLES_JEU.filter(table => table.statut === statut);
};

export const getTablesLibres = (): TableJeuDto[] => {
  return MOCK_TABLES_JEU.filter(table => table.statut === StatutTable.LIBRE);
};

export const getTablesByFestival = (festivalId: number, zonesDuPlan: number[]): TableJeuDto[] => {
  return MOCK_TABLES_JEU.filter(table => zonesDuPlan.includes(table.zone_du_plan_id));
};