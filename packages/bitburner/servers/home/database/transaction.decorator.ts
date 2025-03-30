import { openConnection } from "./connection";

interface TransactionOptions {
	mode: IDBTransactionMode;
	store: string;
}

export function Transaction(opts: TransactionOptions) {
	return function decorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function(...args: any[]) {
			let store: IDBObjectStore;
			try {
				const db = await openConnection();
				const tx = db.transaction(opts.store, opts.mode);
				store = tx.objectStore(opts.store);
			} catch (e) {
				overseer.logger.error(`Failed to open transaction: ${e}`);
				return;
			}

			const result = originalMethod.apply(this, [store, ...args]);

			try {
				store.transaction.commit();
			} catch (e) {
				overseer.logger.error(`Failed to commit transaction: ${e}`);
				return;
			}

			return result;
		};

		return descriptor;
	}
}