import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleDriveStorage } from '../dist';

// Mock Fetch API
global.fetch = vi.fn();

// Sample Access Token (Mocked)
const mockAccessToken = 'mock_access_token';

// Sample mock data
const mockFileId = 'mock-file-id';
const mockFileData = { id: mockFileId, name: 'test.json', mimeType: 'application/json' };
const mockFolderId = 'mock-folder-id';
const mockFolderData = { id: mockFolderId, name: 'Test Folder' };

// Mock GoogleDriveStorage Class
vi.mock('../dist', () => {
	return {
		GoogleDriveStorage: vi.fn().mockImplementation(() => ({
			createFolder: vi.fn().mockResolvedValue(mockFolderData),
			retrieve: vi.fn().mockResolvedValue({ data: mockFileData }),
			findFolders: vi.fn().mockResolvedValue([mockFolderData]),
			delete: vi.fn().mockResolvedValue({ success: true }),
			updateFileName: vi.fn().mockResolvedValue({ id: mockFileId, name: 'updated_name.json' }),
			findFileByName: vi.fn().mockResolvedValue(mockFileData),
			findFilesUnderFolder: vi.fn().mockResolvedValue([mockFileData]),
			updateFileData: vi.fn().mockResolvedValue({ id: mockFileId, name: 'updated_file.json' }),
			getFileParents: vi.fn().mockResolvedValue([mockFolderId]),
			updateRelationsFile: vi.fn().mockResolvedValue({ success: true }),
			createRelationsFile: vi.fn().mockResolvedValue(mockFileData),
			getFileIdsFromAppDataFolder: vi.fn().mockResolvedValue([mockFileId]),
		})),
	};
});

describe('GoogleDriveStorage Public Methods', () => {
	let storage: GoogleDriveStorage;

	beforeEach(() => {
		storage = new GoogleDriveStorage(mockAccessToken);
	});

	it('should create a folder', async () => {
		const result = await storage.createFolder({ folderName: 'Test Folder', parentFolderId: 'root' });

		expect(storage.createFolder).toHaveBeenCalledWith({ folderName: 'Test Folder', parentFolderId: 'root' });
		expect(result).toEqual(mockFolderData);
	});

	it('should retrieve a file', async () => {
		const result = await storage.retrieve(mockFileId);

		expect(storage.retrieve).toHaveBeenCalledWith(mockFileId);
		expect(result).toEqual({ data: mockFileData });
	});

	it('should find folders', async () => {
		const result = await storage.findFolders('root');

		expect(storage.findFolders).toHaveBeenCalled();
		expect(result).toEqual([mockFolderData]);
	});

	it('should delete a file', async () => {
		const result = await storage.delete(mockFileId);

		expect(storage.delete).toHaveBeenCalledWith(mockFileId);
		expect(result).toEqual({ success: true });
	});

	it('should update file name', async () => {
		const newFileName = 'updated_name.json';
		const result = await storage.updateFileName(mockFileId, newFileName);

		expect(storage.updateFileName).toHaveBeenCalledWith(mockFileId, newFileName);
		expect(result).toEqual({ id: mockFileId, name: newFileName });
	});

	it('should find a file by name', async () => {
		const result = await storage.findFileByName('test.json');

		expect(storage.findFileByName).toHaveBeenCalledWith('test.json');
		expect(result).toEqual(mockFileData);
	});

	it('should find files under a folder', async () => {
		const result = await storage.findFilesUnderFolder(mockFolderId);

		expect(storage.findFilesUnderFolder).toHaveBeenCalledWith(mockFolderId);
		expect(result).toEqual([mockFileData]);
	});

	it('should update file data', async () => {
		const result = await storage.updateFileData(mockFileId, { fileName: 'updated_file.json' });

		expect(storage.updateFileData).toHaveBeenCalledWith(mockFileId, { fileName: 'updated_file.json' });
		expect(result).toEqual({ id: mockFileId, name: 'updated_file.json' });
	});

	it('should get file parents', async () => {
		const result = await storage.getFileParents(mockFileId);

		expect(storage.getFileParents).toHaveBeenCalledWith(mockFileId);
		expect(result).toEqual([mockFolderId]);
	});

	it('should update relations file', async () => {
		const result = await storage.updateRelationsFile({ relationsFileId: mockFileId, recommendationFileId: 'rec-123' });

		expect(storage.updateRelationsFile).toHaveBeenCalledWith({ relationsFileId: mockFileId, recommendationFileId: 'rec-123' });
		expect(result).toEqual({ success: true });
	});

	it('should create relations file', async () => {
		const result = await storage.createRelationsFile({ vcFolderId: mockFolderId });

		expect(storage.createRelationsFile).toHaveBeenCalledWith({ vcFolderId: mockFolderId });
		expect(result).toEqual(mockFileData);
	});

	it('should get file IDs from appDataFolder', async () => {
		const result = await storage.getFileIdsFromAppDataFolder();

		expect(storage.getFileIdsFromAppDataFolder).toHaveBeenCalled();
		expect(result).toEqual([mockFileId]);
	});
});
