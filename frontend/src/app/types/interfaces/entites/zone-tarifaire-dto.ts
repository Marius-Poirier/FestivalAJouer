export interface ZoneTarifaireDto {
    id?: number;   
    festival_id?: number;
    nom: string;
    nombre_tables_total: number;
    prix_table: number;
    created_at? : Date;
    updated_at? : Date;
}
