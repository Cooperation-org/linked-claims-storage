import { DataToSaveI } from '../../types';

interface FetcherI {
	method: string;
	headers: HeadersInit;
	body?: BodyInit | null;
	url: string;
}

export class GoogleDriveStorage {
	private accessToken: string;

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	private async fetcher({ method, headers, body, url }: FetcherI) {
		try {
			const res = await fetch(url, {
				method,
				headers: new Headers({
					Authorization: `Bearer ${this.accessToken}`,
					...headers,
				}),
				body,
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error.message);
			}

			return data;
		} catch (error) {
			console.error('Error fetching data:', error);
			throw error;
		}
	}

	// New method to encapsulate search logic
	private async searchFiles(query: string): Promise<any[]> {
		const result = await this.fetcher({
			method: 'GET',
			headers: {},
			url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&trashed=false&fields=files(id,name,mimeType,parents)`,
		});
		return result.files;
	}

	async createFolder(folderName: string, parentFolderId?: string): Promise<string> {
		const metadata = {
			name: folderName,
			mimeType: 'application/vnd.google-apps.folder',
			parents: parentFolderId ? [parentFolderId] : [],
		};

		const folder = await this.fetcher({
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(metadata),
			url: 'https://www.googleapis.com/drive/v3/files',
		});

		console.log('Folder ID:', folder.id);
		return folder.id;
	}

	async save(data: DataToSaveI, folderId: string): Promise<{ id: string } | null> {
		try {
			const fileMetadata = {
				name: data.fileName,
				mimeType: data.mimeType,
				parents: [folderId],
			};

			const formData = new FormData();
			formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
			formData.append('file', data.body);

			const file = await this.fetcher({
				method: 'POST',
				headers: {},
				body: formData,
				url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
			});

			console.log('File uploaded:', file.id);
			return file;
		} catch (error) {
			console.error('Error uploading file:', error);
			return null;
		}
	}

	async retrieve(id: string): Promise<any> {
		try {
			const file = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
			});

			console.log('File retrieved:', file);
			return file;
		} catch (error) {
			console.error('Error retrieving file:', error);
			return null;
		}
	}

	findFolders = async (id?: string): Promise<any[]> => {
		const query = id
			? `'${id}' in parents and mimeType='application/vnd.google-apps.folder'`
			: `'root' in parents and mimeType='application/vnd.google-apps.folder'`;
		const folders = await this.searchFiles(query);

		return folders.filter((file: any) => file.mimeType === 'application/vnd.google-apps.folder');
	};

	findLastFile = async (folderId: string): Promise<any> => {
		try {
			const files = await this.searchFiles(`'${folderId}' in parents`);

			const fileContents = await Promise.all(
				files
					.filter((file: any) => file.mimeType !== 'application/vnd.google-apps.folder')
					.map(async (file: any) => {
						const content = await this.fetcher({
							method: 'GET',
							headers: {},
							url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
						});
						return {
							...file,
							content,
						};
					})
			);

			const latestFile = fileContents.reduce((latest: any | null, current: any) => {
				const latestTimestamp = latest ? parseInt(latest.name.split('-')[1].split('.')[0], 10) : 0;
				const currentTimestamp = parseInt(current.name.split('-')[1].split('.')[0], 10);
				return currentTimestamp > latestTimestamp ? current : latest;
			}, null);

			return latestFile ? latestFile.content : null;
		} catch (error) {
			console.error('Error finding last file:', error);
			return null;
		}
	};

	public async getAllClaims() {
		const rootFolders = await this.findFolders();
		const credentialsFolder = rootFolders.find((f: any) => f.name === 'Credentials');
		if (!credentialsFolder) return [];

		const credentialsFolderId = credentialsFolder.id;
		const subfolders = await this.findFolders(credentialsFolderId);
		const signedVCFolder = subfolders.find((f: any) => f.name === 'VCs');
		if (!signedVCFolder) return [];

		const claims = await this.fetcher({
			method: 'GET',
			headers: {},
			url: `https://www.googleapis.com/drive/v3/files?q='${signedVCFolder.id}' in parents and trashed=false&fields=files(id,name,mimeType,parents)`,
		});
		return claims;
	}

	public async getAllSessions() {
		try {
			// Find all root folders
			const rootFolders = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files?q='root' in parents and mimeType='application/vnd.google-apps.folder'&trashed=false&fields=files(id,name)`,
			});
			console.log('🚀 ~ GoogleDriveStorage ~ getAllSessions ~ rootFolders:', rootFolders);

			// Find the "Credentials" folder
			const credentialsFolder = rootFolders.files.find((f: any) => f.name === 'Credentials');
			if (!credentialsFolder) {
				return []; // Return an empty array if "Credentials" folder is not found
			}

			const credentialsFolderId = credentialsFolder.id;

			// Find subfolders within the "Credentials" folder
			const subfolders = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files?q='${credentialsFolderId}' in parents and mimeType='application/vnd.google-apps.folder'&trashed=false&fields=files(id,name)`,
			});

			const sessionsFolder = subfolders.files.find((f: any) => f.name === 'SESSIONs');
			if (!sessionsFolder) {
				return []; // Return an empty array if "SESSIONs" folder is not found
			}

			// Fetch all session files inside the "SESSIONs" folder
			const sessions = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files?q='${sessionsFolder.id}' in parents and trashed=false&fields=files(id,name,mimeType,parents)`,
			});

			const sessionFiles = sessions.files;

			// Fetch the content of each session file
			const sessionContents = await Promise.all(
				sessionFiles.map(async (file: any) => {
					// Fetch file content
					const content = await this.fetcher({
						method: 'GET',
						headers: {},
						url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
					});
					return {
						content,
					};
				})
			);

			console.log('🚀 ~ GoogleDriveStorage ~ getAllSessions ~ sessionContents:', sessionContents);

			return sessionContents; // Return the list of files with their content
		} catch (error) {
			console.error('Error getting session contents:', error);
			return []; // Return an empty array on error
		}
	}

	async delete(id: string): Promise<any> {
		try {
			const response = await this.fetcher({
				method: 'DELETE',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files/${id}`,
			});
			console.log('File deleted:', response);
			return response;
		} catch (error) {
			console.error('Error deleting file:', error);
			return null;
		}
	}
}
