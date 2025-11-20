import { UserRole } from "../../enum/user-role";
import { UserStatut } from "../../enum/user-statut";

export interface UserDto {
    id?: number;
    email: string;
    password_hash?: string;
    role: UserRole;
    statut: UserStatut;
    date_demande?: Date;
    valide_par?: number;
    email_bloque: boolean;
}
