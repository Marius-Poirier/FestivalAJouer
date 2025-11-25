export interface UserDto {
  id: number;
  email: string;
  role: 'admin' | 'organisateur' | 'super_organisateur' | 'benevole';
  statut: 'en_attente' | 'valide' | 'refuse';
  email_bloque?: boolean;
  date_demande?: string;
  created_at?: string;
}
