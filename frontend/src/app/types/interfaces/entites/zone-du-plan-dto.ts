export interface ZoneDuPlanDto {
    id?: number;
    festival_id: number;
    nom: string;
    nombre_tables: number;
    zone_tarifaire_id: number;
    created_at? : Date;
    updated_at? : Date;
}
