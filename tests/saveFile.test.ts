import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleDriveStorage } from '../dist/index.js';

describe('GoogleDriveStorage - saveFile', () => {
	let googleDriveStorage: GoogleDriveStorage;
	let mockFetcher: any;

	beforeEach(() => {
		googleDriveStorage = new GoogleDriveStorage('fake-access-token');

		// ✅ Mock `fetcher` function
		mockFetcher = vi.spyOn(googleDriveStorage as GoogleDriveStorage, 'fetcher');
	});

	afterEach(() => {
		vi.restoreAllMocks(); // ✅ Reset mocks after each test
	});

	it('should successfully upload a file and update file_ids.json', async () => {
		// ✅ Mock API responses in the correct order
		mockFetcher
			.mockResolvedValueOnce({ id: 'file123' }) // Simulate file upload response
			.mockResolvedValueOnce({ files: [{ id: 'file_ids_001' }] }) // Check for file_ids.json
			.mockResolvedValueOnce(['existing-file-id']) // Simulate reading existing file_ids.json
			.mockResolvedValueOnce({ id: 'file_ids_001' }); // Simulate file_ids.json update

		// ✅ Call the method
		const fileData = { fileName: 'test.json', content: { test: 'data' } };
		const response = await googleDriveStorage.saveFile({ data: fileData, folderId: 'folder123' });

		// ✅ Verify response
		expect(response).toEqual({ id: 'file123' });

		// ✅ Ensure `fetcher` was called 4 times
		expect(mockFetcher).toHaveBeenCalledTimes(4);

		// ✅ Ensure the correct API call was made
		expect(mockFetcher).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				url: expect.stringContaining('upload/drive/v3/files?uploadType=multipart'),
			})
		);
	});

	it('should throw an error if folder ID is missing', async () => {
		await expect(googleDriveStorage.saveFile({ data: { fileName: 'test.json' }, folderId: '' })).rejects.toThrow(
			'Folder ID is required to save a file.'
		);
	});
});
