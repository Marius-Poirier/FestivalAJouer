import { ReservationDto } from '@interfaces/entites/reservation-dto';
import { StatutReservationWorkflow } from '@enum/statut-workflow-reservation';

export const MOCK_RESERVATIONS: ReservationDto[] = [
  // Festival Montpellier 2024 (id: 1) - Réservations complètes
  {
    id: 1,
    editeur_id: 1, // Asmodee
    festival_id: 1,
    statut_workflow: StatutReservationWorkflow.PAIEMENT_RECU,
    editeur_presente_jeux: true,
    remise_pourcentage: 10,
    remise_montant: undefined,
    prix_total: 450.00, // 3 tables zone Premium à 150€
    prix_final: 405.00, // -10% = 405€
    commentaires_paiement: 'Paiement reçu par virement. Facture envoyée.',
    paiement_relance: false,
    date_facture: new Date('2024-03-15T10:00:00'),
    date_paiement: new Date('2024-03-25T14:30:00'),
    created_at: new Date('2024-02-01T09:00:00'),
    created_by: 2, // Marie Dupont
    updated_at: new Date('2024-03-25T14:30:00'),
    updated_by: 2
  },
  {
    id: 2,
    editeur_id: 2, // Days of Wonder
    festival_id: 1,
    statut_workflow: StatutReservationWorkflow.SERA_ABSENT,
    editeur_presente_jeux: false,
    remise_pourcentage: undefined,
    remise_montant: undefined,
    prix_total: 0,
    prix_final: 0,
    commentaires_paiement: 'Budget insuffisant. Ne viendra pas cette année.',
    paiement_relance: false,
    date_facture: undefined,
    date_paiement: undefined,
    created_at: new Date('2024-02-05T11:00:00'),
    created_by: 3, // Jean Martin (Organisateur)
    updated_at: new Date('2024-03-10T15:00:00'),
    updated_by: 3
  },
  {
    id: 3,
    editeur_id: 3, // Gigamic
    festival_id: 1,
    statut_workflow: StatutReservationWorkflow.PAIEMENT_RECU,
    editeur_presente_jeux: true,
    remise_pourcentage: undefined,
    remise_montant: 50.00,
    prix_total: 200.00, // 2 tables zone Standard à 100€
    prix_final: 150.00, // -50€ = 150€
    commentaires_paiement: 'Remise fidélité 50€. Paiement reçu.',
    paiement_relance: false,
    date_facture: new Date('2024-03-01T11:00:00'),
    date_paiement: new Date('2024-03-18T10:15:00'),
    created_at: new Date('2024-02-10T14:00:00'),
    created_by: 2,
    updated_at: new Date('2024-03-18T10:15:00'),
    updated_by: 2
  },

  // Festival Marseille 2025 (id: 5 - Festival courant) - Réservations en cours
  {
    id: 4,
    editeur_id: 1, // Asmodee
    festival_id: 5,
    statut_workflow: StatutReservationWorkflow.FACTURE,
    editeur_presente_jeux: true,
    remise_pourcentage: 5,
    remise_montant: undefined,
    prix_total: 640.00, // 4 tables zone Gold à 160€
    prix_final: 608.00, // -5% = 608€
    commentaires_paiement: 'Facture envoyée le 25/11. Paiement attendu pour fin novembre.',
    paiement_relance: false,
    date_facture: new Date('2024-11-25T09:00:00'),
    date_paiement: undefined,
    created_at: new Date('2024-11-05T10:00:00'),
    created_by: 2,
    updated_at: new Date('2024-11-25T09:00:00'),
    updated_by: 2
  },
  {
    id: 5,
    editeur_id: 4, // Iello
    festival_id: 5,
    statut_workflow: StatutReservationWorkflow.PRESENT,
    editeur_presente_jeux: true,
    remise_pourcentage: undefined,
    remise_montant: undefined,
    prix_total: 330.00, // 3 tables zone Silver à 110€
    prix_final: 330.00,
    commentaires_paiement: 'Participation confirmée. Facture à générer.',
    paiement_relance: false,
    date_facture: undefined,
    date_paiement: undefined,
    created_at: new Date('2024-11-08T12:00:00'),
    created_by: 3,
    updated_at: new Date('2024-11-22T11:00:00'),
    updated_by: 3
  },
  {
    id: 6,
    editeur_id: 5, // Matagot
    festival_id: 5,
    statut_workflow: StatutReservationWorkflow.DISCUSSION_EN_COURS,
    editeur_presente_jeux: false,
    remise_pourcentage: undefined,
    remise_montant: undefined,
    prix_total: 220.00, // 2 tables zone Silver à 110€ (estimation)
    prix_final: 220.00,
    commentaires_paiement: 'En attente de confirmation de participation.',
    paiement_relance: false,
    date_facture: undefined,
    date_paiement: undefined,
    created_at: new Date('2024-11-10T16:30:00'),
    created_by: 2,
    updated_at: new Date('2024-11-20T10:00:00'),
    updated_by: 2
  },
  {
    id: 7,
    editeur_id: 2, // Days of Wonder
    festival_id: 5,
    statut_workflow: StatutReservationWorkflow.CONTACT_PRIS,
    editeur_presente_jeux: false,
    remise_pourcentage: undefined,
    remise_montant: undefined,
    prix_total: 280.00, // 2 tables zone Silver + 1 Bronze (estimation)
    prix_final: 280.00,
    commentaires_paiement: 'Demande tarif préférentiel. Négociation en cours.',
    paiement_relance: false,
    date_facture: undefined,
    date_paiement: undefined,
    created_at: new Date('2024-11-12T15:00:00'),
    created_by: 3,
    updated_at: new Date('2024-11-12T15:00:00'),
    updated_by: 3
  },
  {
    id: 8,
    editeur_id: 3, // Gigamic
    festival_id: 5,
    statut_workflow: StatutReservationWorkflow.PRESENT,
    editeur_presente_jeux: true,
    remise_pourcentage: undefined,
    remise_montant: 40.00,
    prix_total: 400.00, // 3 tables Silver (330€) + 1 Bronze (70€)
    prix_final: 360.00, // -40€ fidélité = 360€
    commentaires_paiement: 'Remise fidélité appliquée. Prêt pour facturation.',
    paiement_relance: false,
    date_facture: undefined,
    date_paiement: undefined,
    created_at: new Date('2024-11-15T11:30:00'),
    created_by: 2,
    updated_at: new Date('2024-11-26T09:00:00'),
    updated_by: 2
  }
];

// Helpers
export const getReservationsByFestival = (festivalId: number): ReservationDto[] => {
  return MOCK_RESERVATIONS.filter(r => r.festival_id === festivalId);
};

export const getReservationsByEditeur = (editeurId: number): ReservationDto[] => {
  return MOCK_RESERVATIONS.filter(r => r.editeur_id === editeurId);
};

export const getReservationByEditeurFestival = (editeurId: number, festivalId: number): ReservationDto | undefined => {
  return MOCK_RESERVATIONS.find(r => r.editeur_id === editeurId && r.festival_id === festivalId);
};

export const getReservationsByStatut = (statut: StatutReservationWorkflow): ReservationDto[] => {
  return MOCK_RESERVATIONS.filter(r => r.statut_workflow === statut);
};

export const getReservationsEnAttentePaiement = (): ReservationDto[] => {
  return MOCK_RESERVATIONS.filter(r => 
    r.statut_workflow === StatutReservationWorkflow.FACTURE ||
    r.statut_workflow === StatutReservationWorkflow.PAIEMENT_EN_RETARD
  );
};

export const getReservationsConfirmees = (festivalId: number): ReservationDto[] => {
  return MOCK_RESERVATIONS.filter(r => 
    r.festival_id === festivalId &&
    (r.statut_workflow === StatutReservationWorkflow.PRESENT ||
     r.statut_workflow === StatutReservationWorkflow.FACTURE ||
     r.statut_workflow === StatutReservationWorkflow.PAIEMENT_RECU)
  );
};

// Statistiques
export const getStatsReservationsByFestival = (festivalId: number) => {
  const reservations = getReservationsByFestival(festivalId);
  const total = reservations.length;
  const confirmees = reservations.filter(r => 
    r.statut_workflow === StatutReservationWorkflow.PRESENT ||
    r.statut_workflow === StatutReservationWorkflow.FACTURE ||
    r.statut_workflow === StatutReservationWorkflow.PAIEMENT_RECU
  ).length;
  const payees = reservations.filter(r => 
    r.statut_workflow === StatutReservationWorkflow.PAIEMENT_RECU
  ).length;
  const chiffreAffaire = reservations
    .filter(r => r.statut_workflow === StatutReservationWorkflow.PAIEMENT_RECU)
    .reduce((sum, r) => sum + r.prix_final, 0);

  return { total, confirmees, payees, chiffreAffaire };
};