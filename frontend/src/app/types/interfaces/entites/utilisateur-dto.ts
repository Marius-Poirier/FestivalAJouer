import { RoleUtilisateur } from "../../enum/role-utilisateur";
import { StatutUtilisateur } from "../../enum/statut-utilisateur";

export interface UtilisateurDto {
    id?: number;
    email: string;
    password_hash?: string;
    role: RoleUtilisateur;
    statut_utilisateur: StatutUtilisateur;
    date_demande?: Date;
    valide_par?: number;
    email_bloque: boolean;
    created_at? : Date;
    updated_at? :Date
}
