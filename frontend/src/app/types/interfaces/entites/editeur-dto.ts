export interface EditeurDto {
    id?: number;
    nom: string;
    logo_url?: string | null;
    created_at? : Date;
    updated_at? : Date;
}
