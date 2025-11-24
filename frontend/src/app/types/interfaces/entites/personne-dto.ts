export interface PersonneDto {
    id?: number;
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    fonction?: string;
    created_at? : Date;
    updated_at? : Date;
}
