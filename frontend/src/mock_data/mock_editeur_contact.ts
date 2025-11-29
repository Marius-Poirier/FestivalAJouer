import { EditeurContactDto } from '@interfaces/relations/editeur-contact-dto';

export const MOCK_EDITEUR_CONTACTS: EditeurContactDto[] = [
  // Asmodee (editeur_id: 1)
  {
    editeur_id: 1,
    personne_id: 1 // Sophie Dupont - Responsable Événements
  },

  // Days of Wonder (editeur_id: 2)
  {
    editeur_id: 2,
    personne_id: 2 // Jean Martin - Directeur Commercial
  },

  // Gigamic (editeur_id: 3)
  {
    editeur_id: 3,
    personne_id: 3 // Claire Bernard - Chargée de Communication
  },

  // Iello (editeur_id: 4)
  {
    editeur_id: 4,
    personne_id: 4 // Marc Petit - Responsable Salons
  },

  // Matagot (editeur_id: 5)
  {
    editeur_id: 5,
    personne_id: 5 // Lucie Moreau - Chef de Projet Événementiel
  }
];

// Helpers
export const getContactsByEditeur = (editeurId: number): number[] => {
  return MOCK_EDITEUR_CONTACTS
    .filter(ec => ec.editeur_id === editeurId)
    .map(ec => ec.personne_id);
};

export const getEditeursByContact = (personneId: number): number[] => {
  return MOCK_EDITEUR_CONTACTS
    .filter(ec => ec.personne_id === personneId)
    .map(ec => ec.editeur_id);
};

// Note: Cette table lie les contacts PERMANENTS des éditeurs (annuaire)
// À distinguer de ContactEditeur qui trace l'HISTORIQUE des interactions