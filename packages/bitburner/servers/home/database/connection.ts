export const DATABASE = "overseer";

export async function openConnection(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request: IDBOpenDBRequest = indexedDB.open(DATABASE, 1);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Error opening IndexedDB.");
    });
}

