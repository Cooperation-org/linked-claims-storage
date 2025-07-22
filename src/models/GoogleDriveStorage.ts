interface FetcherI {
	method: string;
	headers: HeadersInit;
	body?: BodyInit | null;
	url: string;
}

type FileType = 'KEYPAIRs' | 'VCs' | 'SESSIONs' | 'DIDs' | 'RECOMMENDATIONs' | 'MEDIAs';

/**
 * @class GoogleDriveStorage
 * @description Class to interact with Google Drive API
 * @param accessToken - Access token to authenticate with Google Drive API
 * @method saveFile - Save a file to Google Drive
 * @method retrieve - Retrieve a file from Google Drive
 * @method createFolder - Create a new folder in Google Drive
 * @method getOrCreateMediaFolder - Get the ID of the MEDIAs folder
 * @method uploadBinaryFile - Upload a binary file to Google Drive
 * @method updateFileData - Update the data of a file
 * @method updateRelationsFile - Update the relations file
 * @method delete - Delete a file from Google Drive
 * @method checkEmailExists - Check if an email VC exists and return its content
 * @method findFolders - Find folders in Google Drive
 * @method findFolderFiles - Find files in a folder
 */
export class GoogleDriveStorage {
	private accessToken: string;
	public static folderCache: any = {};
	private static fileIdsCache = null;

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	private async updateFileIdsJson(newFileId: string) {
		const constructUrl = () => {
			const baseUrl = 'https://www.googleapis.com/drive/v3/files';
			const queryParams = new URLSearchParams({
				spaces: 'appDataFolder',
				q: "name='file_ids.json'",
				fields: 'files(id)',
			});

			return `${baseUrl}?${queryParams.toString()}`;
		};
		try {
			// ✅ Fetch `file_ids.json` ID once per session (cached)
			if (!GoogleDriveStorage.fileIdsCache) {
				const existingFile = await this.fetcher({
					method: 'GET',
					headers: {},
					url: constructUrl(),
				});

				if (existingFile.files.length > 0) {
					GoogleDriveStorage.fileIdsCache = existingFile.files[0].id;
				} else {
					console.log('No existing file_ids.json found, creating a new one.');
					GoogleDriveStorage.fileIdsCache = null;
				}
			}

			let existingFileIds = [];

			// ✅ Fetch existing file IDs **only if `file_ids.json` exists**
			if (GoogleDriveStorage.fileIdsCache) {
				try {
					const fileContent = await this.fetcher({
						method: 'GET',
						headers: {},
						url: `https://www.googleapis.com/drive/v3/files/${GoogleDriveStorage.fileIdsCache}?alt=media`,
					});
					existingFileIds = fileContent;
				} catch (error) {
					console.log('Error fetching existing file_ids.json content, creating new list.');
				}
			}

			// ✅ Append the new file ID to the list
			existingFileIds.push(newFileId);

			console.log('File ID saved to appDataFolder.', GoogleDriveStorage.fileIdsCache);
		} catch (error) {
			console.error('Error updating file_ids.json:', error.message);
			throw error;
		}
	}

	private async fetcher({ method, headers, body, url }: FetcherI): Promise<any> {
		try {
			const res = await fetch(url, {
				method,
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					...headers,
				},
				body,
			});

			const contentType = res.headers.get('Content-Type') || '';
			let data;
			if (contentType.includes('application/json')) {
				data = await res.json();
			} else {
				const text = await res.text();
				console.error('Unexpected Response Type:', text);
				throw new Error(`Expected JSON response but got: ${contentType}`);
			}

			if (!res.ok) {
				console.error('Error Response:', JSON.stringify(data));
				throw new Error(data?.error?.message || 'Unknown error occurred');
			}

			return data;
		} catch (error) {
			console.error('Error fetching data:', error.message || error);
			throw error;
		}
	}

	private async getFileContent(fileId: string): Promise<any> {
		const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
		try {
			const response = await this.fetcher({ method: 'GET', headers: {}, url });
			return response;
		} catch (error) {
			console.error(`Error fetching content for file ID: ${fileId}:`, error.message);
			throw new Error(`Failed to fetch content for file ID: ${fileId}`);
		}
	}

	private async searchFiles(query: string): Promise<any[]> {
		const result = await this.fetcher({
			method: 'GET',
			headers: {},
			url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&trashed=false&fields=files(id,name,mimeType,parents)`,
		});
		return result.files || [];
	}

	private async getOrCreateMediaFolder() {
		if (GoogleDriveStorage.folderCache['MEDIAs']) {
			return GoogleDriveStorage.folderCache['MEDIAs'];
		}
		const rootFolders = await this.findFolders();

		let credentialsFolder = rootFolders.find((f: any) => f.name === 'Credentials');

		if (!credentialsFolder) {
			credentialsFolder = await this.createFolder({ folderName: 'Credentials', parentFolderId: 'root' });
		}

		const subfolders = await this.findFolders(credentialsFolder.id);
		let mediasFolder = subfolders.find((f: any) => f.name === 'MEDIAs');

		if (!mediasFolder) {
			mediasFolder = await this.createFolder({ folderName: 'MEDIAs', parentFolderId: credentialsFolder.id });
		}

		GoogleDriveStorage.folderCache['MEDIAs'] = mediasFolder.id;

		return mediasFolder.id;
	}

	public async findFolderFiles(folderId: string) {
		if (!folderId) throw new Error('Folder ID is required');

		const files = await this.searchFiles(`'${folderId}' in parents`);
		if (files.length === 0) {
			console.log('No files found in the folder.');
			return [];
		}

		const filesWithContent = await Promise.all(
			files.map(async (file) => {
				try {
					const content = await this.getFileContent(file.id);
					return { ...file, content };
				} catch (error) {
					console.error(`Error fetching content for file "${file.name}" (ID: ${file.id}):`, error);
					return { ...file, content: null };
				}
			})
		);

		return filesWithContent;
	}

	async createFolder({ folderName, parentFolderId }: { folderName: string; parentFolderId: string }) {
		if (!parentFolderId) {
			throw new Error(`Parent folder ID must be provided when creating folder "${folderName}".`);
		}

		const metadata = {
			name: folderName,
			mimeType: 'application/vnd.google-apps.folder',
			parents: [parentFolderId],
		};

		const folder = await this.fetcher({
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(metadata),
			url: 'https://www.googleapis.com/drive/v3/files',
		});

		console.log(`Folder created: "${folderName}" with ID: ${folder.id}, Parent: ${parentFolderId}`);

		await this.fetcher({
			method: 'POST',
			url: `https://www.googleapis.com/drive/v3/files/${folder.id}/permissions`,
			headers: {},
			body: JSON.stringify({ role: 'reader', type: 'anyone' }),
		});

		// Invalidate cache for this parent folder
		if (GoogleDriveStorage.folderCache[parentFolderId]) {
			delete GoogleDriveStorage.folderCache[parentFolderId];
		}
		// Also clear 'root' cache if parent is root
		if (parentFolderId === 'root' && GoogleDriveStorage.folderCache['root']) {
			delete GoogleDriveStorage.folderCache['root'];
		}

		return folder;
	}
	public async uploadBinaryFile({ file }: { file: File }) {
		try {
			const accessToken = this.accessToken;
			if (!accessToken) {
				throw new Error('Missing Google OAuth access token.');
			}

			const folderId = await this.getOrCreateMediaFolder();
			const metadata = {
				name: file.name,
				mimeType: file.type,
				parents: [folderId], // Store in the correct folder
			};

			// ✅ Create FormData for multipart upload
			const formData = new FormData();
			formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
			formData.append('file', file);

			// ✅ Correct Google Drive Upload URL
			const url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,parents`;

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`, // ✅ Include valid OAuth token
				},
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(`Google Drive Upload Error: ${data.error?.message || 'Unknown error'}`);
			}

			console.log('✅ File uploaded successfully:', data);
			return data; // Returns the uploaded file ID and parents
		} catch (error) {
			console.error('❌ Error uploading file to Google Drive:', error);
			throw error;
		}
	}

	public async saveFile({ data, folderId, fileId }: { data: any; folderId?: string; fileId?: string }) {
		console.log('🚀 ~ GoogleDriveStorage ~ saveFile ~ data:', data);
		try {
			// If fileId is provided, update the existing file instead of creating a new one
			if (fileId) {
				console.log(`Updating existing file with ID: ${fileId}`);
				return await this.updateFileContent({ fileId, data });
			}

			// For new files, folderId is required
			if (!folderId) {
				throw new Error('Folder ID is required to save a new file.');
			}

			const fileMetadata = {
				name: data.fileName || data.name + '.json' || data.credentialSubject?.person?.name?.formattedName + '.json' || 'Untitled file.json',
				parents: [folderId],
				mimeType: data.mimeType || 'application/json',
			};

			const fileBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
			const formData = new FormData();
			formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
			formData.append('file', fileBlob);

			const file = await this.fetcher({
				method: 'POST',
				headers: {},
				body: formData,
				url: `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,parents`,
			});

			// Set public read permissions
			await this.fetcher({
				method: 'POST',
				url: `https://www.googleapis.com/drive/v3/files/${file.id}/permissions`,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					role: 'reader',
					type: 'anyone',
				}),
			});

			console.log(`File uploaded successfully: ${file.id}`);
			return file;
		} catch (error) {
			console.error('Error in saveFile:', error);
			throw error;
		}
	}

	public async retrieve(id: string): Promise<{ data: any; id: string } | null> {
		const dataUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;

		try {
			const dataResponse = await fetch(dataUrl, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
				},
			});

			if (!dataResponse.ok) {
				const errorData = await dataResponse.json();
				console.error(`Failed to retrieve file data for ID ${id}:`, errorData);
				return null;
			}

			const contentType = dataResponse.headers.get('Content-Type');
			let fileData;
			if (contentType?.includes('application/json')) {
				fileData = await dataResponse.json();
			} else if (
				contentType?.includes('image') ||
				contentType?.includes('video') ||
				contentType?.includes('audio') ||
				contentType?.includes('application/octet-stream') ||
				contentType?.includes('application/pdf') ||
				contentType?.includes('application/msword') ||
				contentType?.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
				contentType?.includes('application/vnd.ms-excel') ||
				contentType?.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
			) {
				fileData = await dataResponse.blob();
			} else {
				fileData = await dataResponse.arrayBuffer();
			}
			return { data: fileData, id: id };
		} catch (error) {
			console.error(`Error retrieving file with ID ${id}:`, error.message);
			return null;
		}
	}

	public async findFolders(folderId?: string): Promise<any[]> {
		const cacheKey = folderId || 'root';
		if (GoogleDriveStorage.folderCache[cacheKey]) {
			return GoogleDriveStorage.folderCache[cacheKey];
		}

		const query = folderId
			? `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`
			: `'root' in parents and mimeType='application/vnd.google-apps.folder'`;

		const folders = await this.searchFiles(query);
		GoogleDriveStorage.folderCache[cacheKey] = folders;
		return folders;
	}

	public async getAllFilesByType(type: FileType): Promise<any[]> {
		try {
			if (!GoogleDriveStorage.folderCache['Credentials']) {
				const rootFolders = await this.findFolders();
				GoogleDriveStorage.folderCache['Credentials'] = rootFolders;
			}

			const credentialsFolder = GoogleDriveStorage.folderCache['Credentials'].find((f: any) => f.name === 'Credentials');
			if (!credentialsFolder) {
				console.error('Credentials folder not found.');
				return [];
			}

			if (type === 'VCs') {
				if (!GoogleDriveStorage.folderCache['VCs']) {
					const vcSubfolder = await this.findFolders(credentialsFolder.id);
					const vcsFolder = vcSubfolder.find((f: any) => f.name === 'VCs');
					const vcSubFolders = await this.findFolders(vcsFolder.id);
					GoogleDriveStorage.folderCache['VCs'] = vcSubFolders.filter((folder: any) => folder.name.startsWith('VC-'));
				}

				const vcSubfolders = GoogleDriveStorage.folderCache['VCs'];
				if (!vcSubfolders.length) {
					console.error(`No subfolders found for type: ${type}`);
					return [];
				}

				const allFilesNested = await Promise.all(vcSubfolders.map(async (folder: any) => await this.findFolderFiles(folder.id)));

				const allVcJsonFiles = allFilesNested.flat().filter((file: any) => file.mimeType === 'application/json');

				const fileContentsResults = await Promise.allSettled(allVcJsonFiles.map((file: any) => this.retrieve(file.id)));

				const validFileContents = fileContentsResults.filter((result) => result.status === 'fulfilled').map((result: any) => result.value);

				return validFileContents.filter((file: any) => file.data.fileName !== 'RELATIONS');
			}

			if (!GoogleDriveStorage.folderCache[type]) {
				const subfolders = await this.findFolders(credentialsFolder.id);
				const targetFolder = subfolders.find((f: any) => f.name === type);
				GoogleDriveStorage.folderCache[type] = targetFolder ? targetFolder.id : null;
			}

			const targetFolderId = GoogleDriveStorage.folderCache[type];
			if (!targetFolderId) {
				console.error(`Folder for type ${type} not found.`);
				return [];
			}

			const filesResponse = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files?q='${targetFolderId}' in parents and trashed=false&fields=files(id,name,mimeType)`,
			});

			const files = filesResponse.files || [];
			const fileContents = await Promise.allSettled(files.map((file: any) => this.retrieve(file.id)));
			console.log('🚀 ~ GoogleDriveStorage ~ getAllFilesByType ~ fileContents:', fileContents);
			return fileContents.filter((res) => res.status === 'fulfilled').map((res: any) => res.value);
		} catch (error) {
			console.error(`Error getting files of type ${type}:`, error);
			return [];
		}
	}

	public async updateFileData(fileId: string, data: { fileName: string }) {
		try {
			const updateUrl = `https://www.googleapis.com/drive/v3/files/${fileId}`;
			const updatedFile = await this.fetcher({
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: data.fileName }),
				url: updateUrl,
			});
			console.log('✅ File renamed successfully:', updatedFile);
			return updatedFile;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Update the content of an existing file in Google Drive
	 * @param fileId - The ID of the file to update
	 * @param data - The new content for the file
	 * @returns The updated file metadata
	 */
	public async updateFileContent({ fileId, data }: { fileId: string; data: any }) {
		try {
			if (!fileId) {
				throw new Error('File ID is required to update a file.');
			}

			// Convert data to JSON blob
			const fileBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
			
			// Update the file content using media upload
			// Note: When using uploadType=media, the response is the updated file resource
			const response = await this.fetcher({
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: fileBlob,
				url: `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
			});
			
			console.log(`✅ File content updated successfully: ${fileId}`);
			
			// Return a consistent response format with id and data
			// The response from media upload might be the file metadata or empty
			return { id: fileId, data, ...response };
		} catch (error) {
			console.error('Error updating file content:', error);
			throw error;
		}
	}

	public async getFileParents(fileId: string) {
		const file = await this.fetcher({
			method: 'GET',
			headers: {},
			url: `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`,
		});
		console.log('FILE: ', file);
		return file.parents;
	}

	public async updateRelationsFile({ relationsFileId, recommendationFileId }: { relationsFileId: string; recommendationFileId: string }) {
		const relationsFileContent = await this.retrieve(relationsFileId);
		const relationsData = relationsFileContent.data.body ? JSON.parse(relationsFileContent.data.body) : relationsFileContent.data;

		relationsData.recommendations.push(recommendationFileId);
		const updatedContent = JSON.stringify(relationsData);

		const updateResponse = await this.fetcher({
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: updatedContent,
			url: `https://www.googleapis.com/upload/drive/v3/files/${relationsFileId}?uploadType=media`,
		});

		this.updateFileIdsJson(relationsFileId);

		return updateResponse;
	}

	public async createRelationsFile({ vcFolderId }: { vcFolderId: string }) {
		const files = await this.findFolderFiles(vcFolderId);
		const vcFile = files.find((file: any) => file.name === 'VC');
		const vcContent = await this.getFileContent(vcFile.id);
		const subject = JSON.parse(vcContent.body).credentialSubject;
		const relationsFile = await this.saveFile({
			data: {
				fileName: 'RELATIONS',
				mimeType: 'application/json',
				body: JSON.stringify({
					vc: {
						fileId: vcContent.id,
						subject,
					},
					recommendations: [],
				}),
			},
			folderId: vcFolderId,
		});
		await this.updateFileIdsJson(relationsFile.id);

		return relationsFile;
	}
	public async delete(id: string): Promise<any> {
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

	public async checkEmailExists(email: string): Promise<{ data: any; id: string } | null> {
		try {
			// Get root folders
			const rootFolders = await this.findFolders();

			// Find Credentials folder
			const credentialsFolder = rootFolders.find((f: any) => f.name === 'Credentials');
			if (!credentialsFolder) {
				console.log('Credentials folder not found');
				return null;
			}

			// Find EMAIL_VC subfolder
			const subfolders = await this.findFolders(credentialsFolder.id);
			const emailVcFolder = subfolders.find((f: any) => f.name === 'EMAIL_VC');
			if (!emailVcFolder) {
				console.log('EMAIL_VC folder not found');
				return null;
			}

			// Search for file with exact email name (no extension)
			const files = await this.searchFiles(`'${emailVcFolder.id}' in parents and name='${email}' and mimeType='application/json'`);

			if (files.length === 0) {
				return null;
			}

			// Get the content of the email VC
			const emailVC = await this.retrieve(files[0].id);
			return emailVC;
		} catch (error) {
			console.error('Error checking email existence:', error);
			return null;
		}
	}
}
