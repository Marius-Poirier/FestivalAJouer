export interface ZoneTarifaireDto {
    id?: number;   
    festival_id?: number;
    nom: string;
    nombre_tables_total: number;
    prix_table: number;
    prix_m2: number;
    created_at? : Date;
    updated_at? : Date;
}
