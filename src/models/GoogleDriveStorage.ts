import { DataToSaveI, StorageStrategy } from '../index.d';

export class GoogleDriveStorage implements StorageStrategy {
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    async createFolder(folderName: string): Promise<string> {
        const metadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };

        const response = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: new Headers({
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify(metadata),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error.message);
        }

        console.log('Folder ID:', result.id); // Logging the new folder ID
        return result.id; // Return the new folder ID
    }

    async save(data: DataToSaveI, folderId: string): Promise<string> {
        const fileMetadata = {
            name: data.fileName,
            mimeType: data.mimeType,
            parents: [folderId], // Set the parent folder ID
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
        formData.append('file', data.body);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ Authorization: `Bearer ${this.accessToken}` }),
            body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error.message);
        }

        console.log('File uploaded:', result.id); // Logging the file ID
        return result.id; // Return the file ID
    }

    // TODO implement retrieve and delete methods
    async retrieve(id: string): Promise<any> {
        throw new Error('Method not implemented.');
    }

    async delete(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
