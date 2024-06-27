// src/GoogleDriveStorage.test.ts
import { GoogleDriveStorage } from '../dist/models/GoogleDriveStorage';
global.fetch = jest.fn();
describe('GoogleDriveStorage', () => {
    const accessToken = 'YOUR_ACCESS_TOKEN';
    const storage = new GoogleDriveStorage(accessToken);
    beforeEach(() => {
        global.fetch.mockClear();
    });
    it('should create a folder', async () => {
        const folderName = 'Test Folder';
        const folderId = '12345';
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: folderId }),
        });
        const result = await storage.createFolder(folderName);
        expect(result).toBe(folderId);
        expect(global.fetch).toHaveBeenCalledWith('https://www.googleapis.com/drive/v3/files', expect.objectContaining({
            method: 'POST',
            headers: expect.any(Headers),
            body: JSON.stringify({
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            }),
        }));
    });
    it('should save a file', async () => {
        const folderId = '12345';
        const fileId = '67890';
        const fileData = {
            fileName: 'test.json',
            mimeType: 'application/json',
            body: new Blob([JSON.stringify({ name: 'John Doe' })], { type: 'application/json' }),
        };
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: fileId }),
        });
        const result = await storage.save(fileData, folderId);
        expect(result).toBe(fileId);
        expect(global.fetch).toHaveBeenCalledWith('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', expect.objectContaining({
            method: 'POST',
            headers: expect.any(Headers),
            body: expect.any(FormData),
        }));
    });
    it('should throw an error if folder creation fails', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: { message: 'Error creating folder' } }),
        });
        await expect(storage.createFolder('Test Folder')).rejects.toThrow('Error creating folder');
    });
    it('should throw an error if file upload fails', async () => {
        const folderId = '12345';
        const fileData = {
            fileName: 'test.json',
            mimeType: 'application/json',
            body: new Blob([JSON.stringify({ name: 'John Doe' })], { type: 'application/json' }),
        };
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: { message: 'Error uploading file' } }),
        });
        await expect(storage.save(fileData, folderId)).rejects.toThrow('Error uploading file');
    });
});
