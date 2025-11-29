import { FestivalDto } from '@interfaces/entites/festival-dto';

export const MOCK_FESTIVALS: FestivalDto[] = [
  {
    id: 1,
    nom: 'Festival du Jeu de Montpellier 2024',
    date_creation: new Date('2024-01-15'),
    created_at: new Date('2024-01-15T10:30:00'),
    updated_at: '2024-11-20T14:22:00'
  },
  {
    id: 2,
    nom: 'Toulouse Game Festival 2024',
    date_creation: new Date('2024-02-10'),
    created_at: new Date('2024-02-10T09:15:00'),
    updated_at: '2024-10-05T16:45:00'
  },
  {
    id: 3,
    nom: 'Festival Ludique de Lyon 2025',
    date_creation: new Date('2024-09-22'),
    created_at: new Date('2024-09-22T11:00:00'),
    updated_at: '2024-11-25T10:12:00'
  },
  {
    id: 4,
    nom: 'Paris Ludique Convention 2025',
    date_creation: new Date('2024-10-05'),
    created_at: new Date('2024-10-05T08:45:00'),
    updated_at: '2024-11-26T09:30:00'
  },
  {
    id: 5,
    nom: 'Marseille Board Game Expo 2025',
    date_creation: new Date('2024-11-01'),
    created_at: new Date('2024-11-01T14:20:00'),
    updated_at: '2024-11-27T11:05:00'
  }
];

export const FESTIVAL_COURANT_ID = 5;