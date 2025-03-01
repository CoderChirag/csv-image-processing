export type Status = 'success' | 'failure';

export interface ConnectionStatus {
  db_status: Status;
}
