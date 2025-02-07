import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleDriveStorage } from '../dist/index.js';

describe('GoogleDriveStorage - saveFile', () => {
	let googleDriveStorage: GoogleDriveStorage;
	let mockFetcher: any;

	beforeEach(() => {
		googleDriveStorage = new GoogleDriveStorage('fake-access-token');

		mockFetcher = vi.spyOn(googleDriveStorage as GoogleDriveStorage, 'fetcher');
	});

	afterEach(() => {
		vi.restoreAllMocks(); //
	});

	it('should successfully upload a file and update file_ids.json', async () => {
		mockFetcher
			.mockResolvedValueOnce({ id: 'file123' })
			.mockResolvedValueOnce({ files: [{ id: 'file_ids_001' }] })
			.mockResolvedValueOnce(['existing-file-id'])
			.mockResolvedValueOnce({ id: 'file_ids_001' });

		const fileData = { fileName: 'test.json', content: { test: 'data' } };
		const response = await googleDriveStorage.saveFile({ data: fileData, folderId: 'folder123' });

		expect(response).toEqual({ id: 'file123' });

		expect(mockFetcher).toHaveBeenCalledTimes(4);

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
