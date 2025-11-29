import { ContactEditeurDto } from '@interfaces/entites/contact-editeur-dto';

export const MOCK_CONTACTS_EDITEUR: ContactEditeurDto[] = [
  // Festival Montpellier 2024 (id: 1)
  {
    id: 1,
    editeur_id: 1, // Asmodee
    festival_id: 1,
    utilisateur_id: 2, // Marie Dupont (Super Organisateur)
    date_contact: new Date('2024-01-20T10:00:00'),
    notes: 'Premier contact par email. Très intéressés par le festival. Demandent zone premium pour 3 tables.'
  },
  {
    id: 2,
    editeur_id: 1, // Asmodee
    festival_id: 1,
    utilisateur_id: 2,
    date_contact: new Date('2024-02-05T14:30:00'),
    notes: 'Relance téléphonique. Sophie Dupont confirme leur participation. Validation zone premium.'
  },
  {
    id: 3,
    editeur_id: 2, // Days of Wonder
    festival_id: 1,
    utilisateur_id: 3, // Jean Martin (Organisateur)
    date_contact: new Date('2024-01-25T11:00:00'),
    notes: 'Contact initial. Attendent confirmation de leur budget avant de s\'engager.'
  },
  {
    id: 4,
    editeur_id: 2, // Days of Wonder
    festival_id: 1,
    utilisateur_id: 3,
    date_contact: new Date('2024-03-10T09:15:00'),
    notes: 'Réponse négative. Budget insuffisant cette année. Intéressés pour 2025.'
  },
  {
    id: 5,
    editeur_id: 3, // Gigamic
    festival_id: 1,
    utilisateur_id: 2,
    date_contact: new Date('2024-02-01T15:00:00'),
    notes: 'Email envoyé avec dossier du festival. En attente de réponse.'
  },
  {
    id: 6,
    editeur_id: 3, // Gigamic
    festival_id: 1,
    utilisateur_id: 2,
    date_contact: new Date('2024-02-15T10:30:00'),
    notes: 'Relance. Claire Bernard confirme participation. Souhaitent 2 tables zone standard.'
  },

  // Festival Marseille 2025 (id: 5 - Festival courant)
  {
    id: 7,
    editeur_id: 1, // Asmodee
    festival_id: 5,
    utilisateur_id: 2,
    date_contact: new Date('2024-11-05T09:00:00'),
    notes: 'Premier contact pour Marseille 2025. Très motivés. Demandent zone Gold.'
  },
  {
    id: 8,
    editeur_id: 1, // Asmodee
    festival_id: 5,
    utilisateur_id: 2,
    date_contact: new Date('2024-11-18T14:00:00'),
    notes: 'Confirmation participation. 4 tables zone Gold réservées. Paiement prévu fin novembre.'
  },
  {
    id: 9,
    editeur_id: 4, // Iello
    festival_id: 5,
    utilisateur_id: 3,
    date_contact: new Date('2024-11-08T11:30:00'),
    notes: 'Contact téléphonique. Marc Petit intéressé mais attend validation interne.'
  },
  {
    id: 10,
    editeur_id: 4, // Iello
    festival_id: 5,
    utilisateur_id: 3,
    date_contact: new Date('2024-11-22T10:00:00'),
    notes: 'Validation reçue ! Participation confirmée. 3 tables zone Silver demandées.'
  },
  {
    id: 11,
    editeur_id: 5, // Matagot
    festival_id: 5,
    utilisateur_id: 2,
    date_contact: new Date('2024-11-10T16:00:00'),
    notes: 'Email envoyé. Dossier complet transmis à Lucie Moreau.'
  },
  {
    id: 12,
    editeur_id: 5, // Matagot
    festival_id: 5,
    utilisateur_id: 2,
    date_contact: new Date('2024-11-20T09:30:00'),
    notes: 'Relance téléphonique. Pas de réponse encore. À recontacter début décembre.'
  },
  {
    id: 13,
    editeur_id: 2, // Days of Wonder
    festival_id: 5,
    utilisateur_id: 3,
    date_contact: new Date('2024-11-12T14:45:00'),
    notes: 'Proposition envoyée. Jean Martin demande tarif préférentiel vu leur absence en 2024.'
  },
  {
    id: 14,
    editeur_id: 3, // Gigamic
    festival_id: 5,
    utilisateur_id: 2,
    date_contact: new Date('2024-11-15T11:00:00'),
    notes: 'Contact initial. Claire intéressée. Présentation du nouveau format du festival.'
  },
  {
    id: 15,
    editeur_id: 3, // Gigamic
    festival_id: 5,
    utilisateur_id: 2,
    date_contact: new Date('2024-11-25T15:30:00'),
    notes: 'Participation confirmée ! 3 tables zone Silver + 1 table Bronze pour démonstrations.'
  }
];

// Helpers
export const getContactsByEditeur = (editeurId: number): ContactEditeurDto[] => {
  return MOCK_CONTACTS_EDITEUR.filter(c => c.editeur_id === editeurId);
};

export const getContactsByFestival = (festivalId: number): ContactEditeurDto[] => {
  return MOCK_CONTACTS_EDITEUR.filter(c => c.festival_id === festivalId);
};

export const getContactsByEditeurFestival = (editeurId: number, festivalId: number): ContactEditeurDto[] => {
  return MOCK_CONTACTS_EDITEUR.filter(c => 
    c.editeur_id === editeurId && c.festival_id === festivalId
  );
};

export const getLastContactByEditeurFestival = (editeurId: number, festivalId: number): ContactEditeurDto | undefined => {
  const contacts = getContactsByEditeurFestival(editeurId, festivalId);
  return contacts.sort((a, b) => b.date_contact.getTime() - a.date_contact.getTime())[0];
};