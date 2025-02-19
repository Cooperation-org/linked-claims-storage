import { DataToSaveI, FilesType } from '../../types';
import { generateViewLink } from '../utils/google.js';

interface FileContent {
	name: string;
	content: any;
	comments: string[];
}
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
 * @method createFolder - Create a new folder in Google Drive
 * @method save - Save data to Google Drive
 * @method addCommentToFile - Add a comment to a file in Google Drive
 * @method addCommenterRoleToFile - Add commenter role to a file in Google Drive
 * @method retrieve - Retrieve a file from Google Drive
 * @method findFolders - Find folders in Google Drive
 * @method findLastFile - Find the last file in a folder
 * @method getAllVCs - Get all verifiable credentials from Google Drive
 * @method getAllSessions - Get all sessions from Google Drive
 * @method delete - Delete a file from Google Drive
 */
export class GoogleDriveStorage {
	private accessToken: string;
	public folderCache: any = {};
	private fileIdsCache = null;

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
			if (!this.fileIdsCache) {
				const existingFile = await this.fetcher({
					method: 'GET',
					headers: {},
					url: constructUrl(),
				});

				if (existingFile.files.length > 0) {
					this.fileIdsCache = existingFile.files[0].id;
				} else {
					console.log('No existing file_ids.json found, creating a new one.');
					this.fileIdsCache = null;
				}
			}

			let existingFileIds = [];

			// ✅ Fetch existing file IDs **only if `file_ids.json` exists**
			if (this.fileIdsCache) {
				try {
					const fileContent = await this.fetcher({
						method: 'GET',
						headers: {},
						url: `https://www.googleapis.com/drive/v3/files/${this.fileIdsCache}?alt=media`,
					});
					existingFileIds = fileContent;
				} catch (error) {
					console.log('Error fetching existing file_ids.json content, creating new list.');
				}
			}

			// ✅ Append the new file ID to the list
			existingFileIds.push(newFileId);

			// ✅ Prepare the updated `file_ids.json`
			const appDataFileMetadata = {
				name: 'file_ids.json',
				mimeType: 'application/json',
			};

			if (!this.fileIdsCache) {
				Object.assign(appDataFileMetadata, { parents: ['appDataFolder'] });
			}

			const appDataFileBlob = new Blob([JSON.stringify(existingFileIds)], { type: 'application/json' });

			const appDataFormData = new FormData();
			appDataFormData.append('metadata', new Blob([JSON.stringify(appDataFileMetadata)], { type: 'application/json' }));
			appDataFormData.append('file', appDataFileBlob);

			if (this.fileIdsCache) {
				// ✅ Upload the updated `file_ids.json`
				await this.fetcher({
					method: 'PATCH',
					headers: {},
					body: appDataFormData,
					url: `https://www.googleapis.com/upload/drive/v3/files/${this.fileIdsCache}?uploadType=multipart&fields=id`,
				});
			} else {
				const newFile = await this.fetcher({
					method: 'POST',
					headers: {},
					body: appDataFormData,
					url: `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id`,
				});

				this.fileIdsCache = newFile.id;
			}

			console.log('File ID saved to appDataFolder.', this.fileIdsCache);
		} catch (error) {
			console.error('Error updating file_ids.json:', error.message);
			throw error;
		}
	}

	constructor(accessToken: string) {
		this.accessToken = accessToken;
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

		return folder;
	}

	async getMediaFolderId() {
		if (this.folderCache['MEDIAs']) {
			return this.folderCache['MEDIAs'];
		}
		const rootFolders = await this.findFolders();

		let credentialsFolder = rootFolders.find((f: any) => f.name === 'Credentials');

		if (!credentialsFolder) {
			credentialsFolder = await this.createFolder({ folderName: 'Credentials', parentFolderId: 'root' });
		}
		const credentialsFolderId = credentialsFolder.id;

		const subfolders = await this.findFolders(credentialsFolder.id);

		let mediasFolder = subfolders.find((f: any) => f.name === 'MEDIAs');

		if (!mediasFolder) {
			mediasFolder = await this.createFolder({ folderName: 'MEDIAs', parentFolderId: credentialsFolderId });
		}
		const mediasFolderId = mediasFolder.id;
		this.folderCache['MEDIAs'] = mediasFolderId;

		return mediasFolderId;
	}
	async uploadBinaryFile({ file }: { file: File }) {
		try {
			const accessToken = this.accessToken; // Ensure access token is available
			if (!accessToken) {
				throw new Error('Missing Google OAuth access token.');
			}

			const folderId = await this.getMediaFolderId(); // Ensure folderId is correct

			// ✅ Correct metadata for Google Drive API
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

	async saveFile({ data, folderId }: { data: any; folderId: string }) {
		try {
			if (!folderId) {
				throw new Error('Folder ID is required to save a file.');
			}

			const fileMetadata = {
				name: data.fileName || 'resume.json',
				parents: [folderId],
				mimeType: 'application/json',
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

			await this.updateFileIdsJson(file.id);

			console.log(`File uploaded successfully: ${file.id}`);
			return file;
		} catch (error) {
			console.error('Error in saveFile:', error);
			throw error;
		}
	}
	/**
	 * Get file from google drive by id
	 * @param id
	 * @returns file content
	 */
	async retrieve(id: string): Promise<{ data: any } | null> {
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
			return { data: fileData };
		} catch (error) {
			console.error(`Error retrieving file with ID ${id}:`, error.message);
			return null;
		}
	}

	/**
	 * Get folder by folderId, if folderId == null you will have them all
	 * @param folderId [Optional]
	 * @returns
	 */
	async findFolders(folderId?: string): Promise<any[]> {
		const cacheKey = folderId || 'root';
		if (this.folderCache[cacheKey]) {
			return this.folderCache[cacheKey];
		}

		const query = folderId
			? `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`
			: `'root' in parents and mimeType='application/vnd.google-apps.folder'`;

		const folders = await this.searchFiles(query);
		this.folderCache[cacheKey] = folders;
		return folders;
	}

	/**
	 * Get all files content for the specified type ('KEYPAIRs' | 'VCs' | 'SESSIONs' | 'DIDs' | 'RECOMMENDATIONs')
	 * @param type
	 * @returns
	 */
	async getAllFilesByType(type: FileType): Promise<FileContent[]> {
		try {
			if (!this.folderCache['Credentials']) {
				const rootFolders = await this.findFolders();
				this.folderCache['Credentials'] = rootFolders;
			}

			const credentialsFolder = this.folderCache['Credentials'].find((f: any) => f.name === 'Credentials');
			if (!credentialsFolder) {
				console.error('Credentials folder not found.');
				return [];
			}

			if (type === 'VCs') {
				if (!this.folderCache['VCs']) {
					const vcSubfolders = await this.findFolders(credentialsFolder.id);
					this.folderCache['VCs'] = vcSubfolders;
				}

				const vcSubfolders = this.folderCache['VCs'];
				if (!vcSubfolders.length) {
					console.error(`No subfolders found for type: ${type}`);
					return [];
				}

				const allVcFiles = await Promise.all(vcSubfolders.map(async (folder: any) => await this.findFilesUnderFolder(folder.id)));
				const fileContents = await Promise.allSettled(allVcFiles.flat().map(async (file: any) => await this.retrieve(file.id)));
				return fileContents.filter((res) => res.status === 'fulfilled').map((res: any) => res.value);
			}

			if (!this.folderCache[type]) {
				const subfolders = await this.findFolders(credentialsFolder.id);
				const targetFolder = subfolders.find((f: any) => f.name === type);
				this.folderCache[type] = targetFolder ? targetFolder.id : null;
			}

			const targetFolderId = this.folderCache[type];
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
			return fileContents.filter((res) => res.status === 'fulfilled').map((res: any) => res.value);
		} catch (error) {
			console.error(`Error getting files of type ${type}:`, error);
			return [];
		}
	}

	/**
	 * Update the name of a file in Google Drive
	 * @param fileId - The ID of the file to update
	 * @param newFileName - The new name for the file
	 * @returns The updated file metadata, including the new name
	 */
	async updateFileName(fileId: string, newFileName: string): Promise<any> {
		try {
			const metadata = { name: newFileName };
			const updatedFile = await this.fetcher({
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(metadata),
				url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
			});
			console.log('File name updated successfully:', updatedFile.name);
			return updatedFile;
		} catch (error) {
			console.error('Error updating file name:', error.message);
			throw error;
		}
	}

	async findFileByName(name: string) {
		const rootFolders = await this.findFolders();
		const credentialsFolderId = rootFolders.find((f: any) => f.name === 'Credentials')?.id;
		if (!credentialsFolderId) throw new Error('Credentials folder not found');

		const files = await this.searchFiles(`'${credentialsFolderId}' in parents and name='${name}'`);
		return files[0];
	}

	async findFilesUnderFolder(folderId: string) {
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

	async updateFileData(fileId: string, data: { fileName: string }) {
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

	async getFileParents(fileId: string) {
		const file = await this.fetcher({
			method: 'GET',
			headers: {},
			url: `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`,
		});
		return file.parents;
	}

	async updateRelationsFile({ relationsFileId, recommendationFileId }: { relationsFileId: string; recommendationFileId: string }) {
		const relationsFileContent = await this.retrieve(relationsFileId);
		const relationsData = JSON.parse(relationsFileContent.data.body);
		relationsData.recommendations.push(recommendationFileId);
		const updatedContent = JSON.stringify(relationsData);

		const updateResponse = await this.fetcher({
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: updatedContent,
			url: `https://www.googleapis.com/upload/drive/v3/files/${relationsFileId}?uploadType=media`,
		});

		return updateResponse;
	}

	async createRelationsFile({ vcFolderId }: { vcFolderId: string }) {
		const files = await this.findFilesUnderFolder(vcFolderId);
		const vcFile = files.find((file: any) => file.name === 'VC');

		const relationsFile = await this.saveFile({
			data: {
				fileName: 'RELATIONS',
				mimeType: 'application/json',
				body: JSON.stringify({
					vc_id: vcFile.id,
					recommendations: [],
				}),
			},
			folderId: vcFolderId,
		});

		return relationsFile;
	}

	/**
	 * Delete file by id
	 * @param id
	 * @returns
	 */
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

	async update(fileId: string, data: any) {
		const metadata = {
			name: data.fileName || 'resume.json',
			mimeType: 'application/json',
		};

		const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
		const formData = new FormData();
		formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
		formData.append('file', new Blob([JSON.stringify(data.body)], { type: 'application/json' }));

		try {
			const response = await this.fetcher({
				method: 'PATCH',
				headers: {},
				body: formData,
				url: `${uploadUrl}&fields=id,name,mimeType`,
			});
			console.log('✅ File updated successfully:', response);
			return response;
		} catch (error) {
			console.error('❌ Error updating Google Drive file:', error);
			throw error;
		}
	}

	async getFileIdsFromAppDataFolder() {
		try {
			const constructUrl = () => {
				const baseUrl = 'https://www.googleapis.com/drive/v3/files';
				const queryParams = new URLSearchParams({
					spaces: 'appDataFolder',
					q: "name='file_ids.json'",
					fields: 'files(id)',
				});

				return `${baseUrl}?${queryParams.toString()}`;
			};
			// Step 1: Search for the file_ids.json file in the appDataFolder
			const response = await this.fetcher({
				method: 'GET',
				headers: {},
				url: constructUrl(),
			});

			console.log(':  GoogleDriveStorage  getFileIdsFromAppDataFolder  response', response);
			// Step 2: Check if the file exists
			if (!response.files || response.files.length === 0) {
				console.log('No file_ids.json found in appDataFolder.');
				return [];
			}

			// Step 3: Get the file ID of file_ids.json
			const fileId = response.files[0].id;
			console.log(':  GoogleDriveStorage  getFileIdsFromAppDataFolder  fileId', fileId);

			// Step 4: Fetch the content of file_ids.json
			const fileContent = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
			});
			console.log(':  GoogleDriveStorage  getFileIdsFromAppDataFolder  fileContent', fileContent);

			// Step 5: Parse the file content (array of file IDs)
			const fileIds = fileContent;
			console.log(':  GoogleDriveStorage  getFileIdsFromAppDataFolder  fileIds', fileIds);
			return fileIds;
		} catch (error) {
			console.error('Error fetching file IDs from appDataFolder:', error.message);
			return [];
		}
	}

	async getAllFilesData() {
		try {
			// Step 1: Get the file IDs from appDataFolder
			const fileIds = await this.getFileIdsFromAppDataFolder();
			if (fileIds.length === 0) {
				console.log('No files found.');
				return [];
			}

			// Step 2: Return the array of file IDs
			return fileIds;
		} catch (error) {
			console.error('Error fetching all files data:', error.message);
			return [];
		}
	}
}
