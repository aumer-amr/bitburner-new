import { DATABASE } from '@/database/connection';

export async function migrate() : Promise<void> {
	const request: IDBOpenDBRequest = indexedDB.open(DATABASE, 1);

	request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
		const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;

		if (db && !db.objectStoreNames.contains("test")) {
			db.createObjectStore("test", { keyPath: "id", autoIncrement: true });
		}
	}
}