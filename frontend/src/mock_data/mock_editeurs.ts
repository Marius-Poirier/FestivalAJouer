import { EditeurDto } from '@interfaces/entites/editeur-dto';

export const MOCK_EDITEURS: EditeurDto[] = [
  {
    id: 1,
    nom: 'Asmodee',
    created_at: new Date('2024-01-10T09:00:00'),
    updated_at: new Date('2024-01-10T09:00:00')
  },
  {
    id: 2,
    nom: 'Days of Wonder',
    created_at: new Date('2024-01-12T10:30:00'),
    updated_at: new Date('2024-01-12T10:30:00')
  },
  {
    id: 3,
    nom: 'Gigamic',
    created_at: new Date('2024-01-15T14:15:00'),
    updated_at: new Date('2024-11-20T16:45:00')
  },
  {
    id: 4,
    nom: 'Iello',
    created_at: new Date('2024-02-05T11:20:00'),
    updated_at: new Date('2024-02-05T11:20:00')
  },
  {
    id: 5,
    nom: 'Matagot',
    created_at: new Date('2024-03-10T13:45:00'),
    updated_at: new Date('2024-11-15T10:30:00')
  }
];

