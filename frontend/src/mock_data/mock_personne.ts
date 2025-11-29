import { PersonneDto } from '@interfaces/entites/personne-dto';

export const MOCK_PERSONNES: PersonneDto[] = [
  // Contacts éditeurs
  {
    id: 1,
    nom: 'Dupont',
    prenom: 'Sophie',
    telephone: '+33612345678',
    email: 'sophie.dupont@asmodee.com',
    fonction: 'Responsable Événements',
    created_at: new Date('2024-01-10T10:00:00'),
    updated_at: new Date('2024-01-10T10:00:00')
  },
  {
    id: 2,
    nom: 'Martin',
    prenom: 'Jean',
    telephone: '+33623456789',
    email: 'j.martin@daysofwonder.com',
    fonction: 'Directeur Commercial',
    created_at: new Date('2024-01-12T11:00:00'),
    updated_at: new Date('2024-11-18T14:30:00')
  },
  {
    id: 3,
    nom: 'Bernard',
    prenom: 'Claire',
    telephone: '+33634567890',
    email: 'claire.bernard@gigamic.fr',
    fonction: 'Chargée de Communication',
    created_at: new Date('2024-01-15T15:00:00'),
    updated_at: new Date('2024-01-15T15:00:00')
  },
  {
    id: 4,
    nom: 'Petit',
    prenom: 'Marc',
    telephone: '+33645678901',
    email: 'marc.petit@iello.fr',
    fonction: 'Responsable Salons',
    created_at: new Date('2024-02-05T12:00:00'),
    updated_at: new Date('2024-02-05T12:00:00')
  },
  {
    id: 5,
    nom: 'Moreau',
    prenom: 'Lucie',
    telephone: '+33656789012',
    email: 'l.moreau@matagot.com',
    fonction: 'Chef de Projet Événementiel',
    created_at: new Date('2024-03-10T14:00:00'),
    updated_at: new Date('2024-11-20T10:15:00')
  },

  // Auteurs de jeux (peuvent aussi être contacts)
  {
    id: 6,
    nom: 'Bauza',
    prenom: 'Antoine',
    telephone: '+33667890123',
    email: 'antoine.bauza@auteur.fr',
    fonction: 'Auteur de jeux',
    created_at: new Date('2024-01-20T09:00:00'),
    updated_at: new Date('2024-01-20T09:00:00')
  },
  {
    id: 7,
    nom: 'Cathala',
    prenom: 'Bruno',
    telephone: '+33678901234',
    email: 'bruno.cathala@auteur.fr',
    fonction: 'Auteur de jeux',
    created_at: new Date('2024-01-22T10:30:00'),
    updated_at: new Date('2024-01-22T10:30:00')
  },
  {
    id: 8,
    nom: 'Moon',
    prenom: 'Alan',
    telephone: '+33689012345',
    email: 'alan.moon@designer.com',
    fonction: 'Game Designer',
    created_at: new Date('2024-01-25T11:15:00'),
    updated_at: new Date('2024-01-25T11:15:00')
  },
  {
    id: 9,
    nom: 'Knizia',
    prenom: 'Reiner',
    telephone: '+33690123456',
    email: 'reiner.knizia@designer.de',
    fonction: 'Auteur de jeux',
    created_at: new Date('2024-02-01T13:00:00'),
    updated_at: new Date('2024-02-01T13:00:00')
  },
  {
    id: 10,
    nom: 'Rosenberg',
    prenom: 'Uwe',
    telephone: '+33601234567',
    email: 'uwe.rosenberg@games.de',
    fonction: 'Game Designer',
    created_at: new Date('2024-02-10T14:30:00'),
    updated_at: new Date('2024-02-10T14:30:00')
  }
];

// Helpers
export const getContactsEditeurs = (): PersonneDto[] => {
  return MOCK_PERSONNES.filter(p => 
    p.fonction?.includes('Responsable') || 
    p.fonction?.includes('Directeur') || 
    p.fonction?.includes('Chargée') ||
    p.fonction?.includes('Chef')
  );
};

export const getAuteursJeux = (): PersonneDto[] => {
  return MOCK_PERSONNES.filter(p => 
    p.fonction?.includes('Auteur') || 
    p.fonction?.includes('Designer')
  );
};