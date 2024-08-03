import { DataToSaveI, StorageStrategy } from '../../types';

export class GoogleDriveStorage implements StorageStrategy {
	private accessToken: string;

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	/**
	 * Creates a new folder in Google Drive.
	 * @param folderName - The name of the folder to be created.
	 * @param parentFolderId - (Optional) The ID of the parent folder. If not provided, the folder will be created in the root directory.
	 * @returns A promise that resolves to the ID of the newly created folder.
	 * @throws Will throw an error if the folder creation fails.
	 */
	async createFolder(folderName: string, parentFolderId?: string): Promise<string> {
		const metadata = {
			name: folderName,
			mimeType: 'application/vnd.google-apps.folder',
			parents: parentFolderId ? [parentFolderId] : [],
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

	/**
	 * Saves the provided data to Google Drive in the specified folder.
	 * @param data - The data to be saved, containing the file name, MIME type, and body.
	 * @param folderId - The ID of the folder in which to save the data.
	 * @returns A promise that resolves to an object containing the ID of the saved file, or `null` if the save operation fails.
	 * @throws Will throw an error if the save operation fails.
	 */
	async save(data: DataToSaveI, folderId: string): Promise<{ id: string } | null> {
		try {
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

			console.log('File uploaded:', result.id);
			return result;
		} catch (error) {
			console.error('Error uploading file:', error);
			return null;
		}
	}

	/**
	 * Retrieves the file with the specified ID from Google Drive.
	 * @param id - The ID of the file to retrieve.
	 * @returns A promise that resolves to the file body, or `null` if the retrieval fails.
	 * @throws Will throw an error if the retrieval fails.
	 */
	async retrieve(id: string): Promise<any> {
		try {
			// get the file body
			const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
				method: 'GET',
				headers: new Headers({
					Authorization: `Bearer ${this.accessToken}`,
				}),
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error.message);
			}

			console.log('File retrieved:', result); // Logging the file ID
			return result;
		} catch (error) {
			console.error('Error retrieving file:', error);
			return;
		}
	}

	/**
	 * Retrieves folders from Google Drive based on the provided ID.
	 * If no ID is provided, it retrieves folders from the root directory.
	 * @param id - (Optional) The ID of the parent folder. If not provided, retrieves folders from the root directory.
	 * @returns A promise that resolves to an array of folder objects. Each folder object contains the ID, name, MIME type, and parents.
	 * @throws Will throw an error if the retrieval fails.
	 */
	findFolders = async (id?: string): Promise<any[]> => {
		let response: any;

		if (id) {
			response = await fetch(
				`https://www.googleapis.com/drive/v3/files?q='${id}' in parents and mimeType='application/vnd.google-apps.folder'&trashed=false&fields=files(id,name,mimeType,parents)`,
				{
					method: 'GET',
					headers: new Headers({
						Authorization: `Bearer ${this.accessToken}`,
					}),
				}
			);
		} else {
			response = await fetch(
				'https://www.googleapis.com/drive/v3/files?q=%27root%27+in+parents+and+mimeType+%3D+%27application/vnd.google-apps.folder%27&fields=files(id,name,mimeType,parents)',
				{
					method: 'GET',
					headers: new Headers({
						Authorization: `Bearer ${this.accessToken}`,
					}),
				}
			);
		}

		const result = await response.json();
		if (!response.ok) {
			throw new Error(result.error.message);
		}

		const folders = result.files.filter((file: any) => file.mimeType === 'application/vnd.google-apps.folder');
		return folders;
	};

	findLastFile = async (folderId: string): Promise<any> => {
		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,mimeType,parents)`,
			{
				method: 'GET',
				headers: new Headers({
					Authorization: `Bearer ${this.accessToken}`,
				}),
			}
		);

		const result = await response.json();
		console.log('🚀 ~ GoogleDriveStorage ~ getFiles= ~ result:', result);
		if (!response.ok) {
			throw new Error(result.error.message);
		}

		const files = result.files.filter((file: any) => file.mimeType !== 'application/vnd.google-apps.folder');
		console.log('🚀 ~ GoogleDriveStorage ~ getFiles= ~ files:', files);

		// Fetch content of each file
		const fileContents = await Promise.all(
			files.map(async (file: any) => {
				const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
					method: 'GET',
					headers: new Headers({
						Authorization: `Bearer ${this.accessToken}`,
					}),
				});
				const content = await fileResponse.json();
				return {
					...file,
					content,
				};
			})
		);

		// Find the latest file by timestamp
		const latestFile = fileContents.reduce((latest: any | null, current: any) => {
			const latestTimestamp = latest ? parseInt(latest.name.split('-')[1].split('.')[0], 10) : 0;
			const currentTimestamp = parseInt(current.name.split('-')[1].split('.')[0], 10);
			return currentTimestamp > latestTimestamp ? current : latest;
		}, null);

		console.log('🚀 ~ GoogleDriveStorage ~ getFiles= ~ latestFile:', latestFile);
		return latestFile ? latestFile.content : null;
	};
}
