export interface IDBService {
	connect(): Promise<void>;
	closeConnection(): Promise<void>;
	isConnected(): boolean | Promise<boolean>;
	syncDb?(): Promise<unknown>;
}
