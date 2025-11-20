export interface AuditLogDtoDto {
    id?: number;
    utilisateur_id?: number;
    action: string;
    entite_type: string;
    entite_id: number;
    date_action?: Date;
    details?: string;
}
