import { StorageContext, StorageFactory } from '../src/models/StorageContext';
// import { GoogleDriveStorage } from '../src/models/GoogleDriveStorage';
import { GoogleDriveStorage } from '../src/models/GoogleDriveStorage';
import { StorageStrategy, StorageType } from '../src/index.d';

describe('StorageContext', () => {
    let mockStrategy: StorageStrategy;
    let storageContext: StorageContext;

    beforeEach(() => {
        mockStrategy = {
            createFolder: jest.fn(),
            save: jest.fn(),
            retrieve: jest.fn(),
            delete: jest.fn()
        };
        storageContext = new StorageContext(mockStrategy);
    });

    it('should set initial strategy via constructor', () => {
        expect(storageContext.strategy).toBe(mockStrategy);
    });

    it('should change strategy via setStrategy method', () => {
        const newStrategy = { ...mockStrategy };
        storageContext.setStrategy(newStrategy);
        expect(storageContext.strategy).toBe(newStrategy);
    });

    it('should delegate save to strategy', async () => {
        const data = {};
        const folderId = 'folderId';
        await storageContext.save(data, folderId);
        expect(mockStrategy.save).toHaveBeenCalledWith(data, folderId);
    });

    it('should delegate retrieve to strategy', async () => {
        const id = 'id';
        await storageContext.retrieve(id);
        expect(mockStrategy.retrieve).toHaveBeenCalledWith(id);
    });

    it('should delegate delete to strategy', async () => {
        const id = 'id';
        await storageContext.delete(id);
        expect(mockStrategy.delete).toHaveBeenCalledWith(id);
    });
});

describe('StorageFactory', () => {
    it('should return GoogleDriveStorage strategy for googleDrive type', () => {
        const options = { accessToken: 'test-token' };
        const strategy = StorageFactory.getStorageStrategy('googleDrive', options);
        expect(strategy).toBeInstanceOf(GoogleDriveStorage);
    });

    it('should throw error for unsupported storage type', () => {
        const unsupportedType = 'unsupportedType' as StorageType;
        expect(() => StorageFactory.getStorageStrategy(unsupportedType, {})).toThrow('Unsupported storage type');
    });

    it('should throw error for missing required parameters', () => {
        expect(() => StorageFactory.getStorageStrategy('googleDrive', {})).toThrow('Missing required parameters');
    });
});
