import { GoogleDriveStorage } from './GoogleDriveStorage';
import { StorageStrategy, StorageType } from '../index.d';

export class StorageContext {
  private strategy: StorageStrategy;

  constructor(strategy: StorageStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: StorageStrategy) {
    this.strategy = strategy;
  }

  async createFolder(folderName: string): Promise<string> {
    return this.strategy.createFolder(folderName);
  }

  async save(data: any, folderId: string): Promise<string> {
    return this.strategy.save(data, folderId);
  }

  async retrieve(id: string): Promise<any> {
    return this.strategy.retrieve(id);
  }

  async delete(id: string): Promise<void> {
    return this.strategy.delete(id);
  }
}

export class StorageFactory {
  static getStorageStrategy(type: StorageType, options: any): StorageStrategy {
    switch (type) {
      case 'googleDrive':
        if (!options.accessToken) {
          throw new Error('Missing required parameters');
        }
        return new GoogleDriveStorage(options.accessToken);
      default:
        throw new Error('Unsupported storage type');
    }
  }
}
