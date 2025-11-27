import { UtilisateurDto } from '@interfaces/entites/utilisateur-dto';
import { RoleUtilisateur } from '@enum/role-utilisateur';
import { StatutUtilisateur } from '@enum/statut-utilisateur';

export const MOCK_UTILISATEURS: UtilisateurDto[] = [
  {
    id: 1,
    email: 'admin@festival.com',
    password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // Hash fictif
    role: RoleUtilisateur.ADMIN,
    statut_utilisateur: StatutUtilisateur.VALIDE,
    date_demande: new Date('2024-01-10'),
    valide_par: undefined, // Admin initial, pas de validateur
    email_bloque: false,
    created_at: new Date('2024-01-10T08:00:00'),
    updated_at: new Date('2024-01-10T08:00:00')
  },
  {
    id: 2,
    email: 'marie.dupont@festival.com',
    password_hash: '$2b$10$xyz789abcdefghijklmnopqrstuvwx',
    role: RoleUtilisateur.SUPER_ORGANISATEUR,
    statut_utilisateur: StatutUtilisateur.VALIDE,
    date_demande: new Date('2024-02-15'),
    valide_par: 1, // Validé par l'admin
    email_bloque: false,
    created_at: new Date('2024-02-15T10:30:00'),
    updated_at: new Date('2024-02-16T09:00:00')
  },
  {
    id: 3,
    email: 'jean.martin@festival.com',
    password_hash: '$2b$10$qwerty123456789abcdefghijklmno',
    role: RoleUtilisateur.ORGANISATEUR,
    statut_utilisateur: StatutUtilisateur.VALIDE,
    date_demande: new Date('2024-03-20'),
    valide_par: 1,
    email_bloque: false,
    created_at: new Date('2024-03-20T14:15:00'),
    updated_at: new Date('2024-03-21T11:30:00')
  },
  {
    id: 4,
    email: 'sophie.bernard@benevole.com',
    password_hash: '$2b$10$mnopqrstuvwxyz123456789abcdef',
    role: RoleUtilisateur.BENEVOLE,
    statut_utilisateur: StatutUtilisateur.EN_ATTENTE,
    date_demande: new Date('2024-10-05'),
    valide_par: 2, // Validé par le super organisateur
    email_bloque: false,
    created_at: new Date('2024-10-05T16:45:00'),
    updated_at: new Date('2024-10-06T08:20:00')
  },
  {
    id: 5,
    email: 'nouveau.user@gmail.com',
    password_hash: '$2b$10$newuser123456789abcdefghijklmn',
    role: RoleUtilisateur.BENEVOLE,
    statut_utilisateur: StatutUtilisateur.EN_ATTENTE,
    date_demande: new Date('2024-11-25'),
    valide_par: undefined, // Pas encore validé
    email_bloque: false,
    created_at: new Date('2024-11-25T12:00:00'),
    updated_at: new Date('2024-11-25T12:00:00')
  }
];


export const UTILISATEUR_CONNECTE_ID = 2; // Marie Dupont (Super Organisateur)