export interface ReservationTableDto {
  reservation_id: number;
  table_id: number;
  date_attribution?: Date | string;
  attribue_par?: number;
}
