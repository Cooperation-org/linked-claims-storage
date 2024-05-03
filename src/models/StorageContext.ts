import { GoogleDriveStorage } from './GoogleDriveStorage.js';
import { StorageStrategy } from './interfaces';

class StorageContext {
  public strategy: StorageStrategy;

  constructor(strategy: StorageStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: StorageStrategy) {
    this.strategy = strategy;
  }

  async save(data: any) {
    return this.strategy.save(data);
  }

  async retrieve(id: string) {
    return this.strategy.retrieve(id);
  }

  async delete(id: string) {
    return this.strategy.delete(id);
  }
}

class StorageFactory {
  static getStorageStrategy(type: string, options: any): StorageStrategy {
    switch (type) {
      case 'googleDrive':
        const { clientId, clientSecret, redirectUri } = options;
        if (!clientId || !clientSecret || !redirectUri) {
          throw new Error('Missing required parameters');
        }

        return new GoogleDriveStorage({
          clientId: clientId,
          clientSecret: clientSecret,
          redirectUri: redirectUri
        });
      default:
        throw new Error('Unsupported storage type');
    }
  }
}

export { StorageContext, StorageFactory };
