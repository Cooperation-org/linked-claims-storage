import { GoogleDriveStorage } from './GoogleDriveStorage.js';
import { StorageStrategy, StorageType } from '../index.d';

class StorageContext {
	public strategy: StorageStrategy;

	constructor(strategy: StorageStrategy) {
		this.strategy = strategy;
	}

	setStrategy(strategy: StorageStrategy) {
		this.strategy = strategy;
	}

	async createFolder(folderName: string) {
		return this.strategy.createFolder(folderName);
	}

	async save(data: any, folderId: string) {
		return this.strategy.save(data, folderId);
	}

	async retrieve(id: string) {
		return this.strategy.retrieve(id);
	}
}

class StorageFactory {
	static getStorageStrategy(type: StorageType, options: any): StorageStrategy {
		switch (type) {
			case 'googleDrive':
				const { accessToken } = options;
				if (!accessToken) {
					throw new Error('Missing required parameters');
				}

				return new GoogleDriveStorage(accessToken);
			default:
				throw new Error('Unsupported storage type');
		}
	}
}

export { StorageContext, StorageFactory };
