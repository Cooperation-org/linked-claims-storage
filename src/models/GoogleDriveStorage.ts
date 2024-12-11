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

			// Check the Content-Type to ensure it's JSON before parsing
			const contentType = res.headers.get('Content-Type') || '';
			let data;
			if (contentType.includes('application/json')) {
				data = await res.json();
			} else {
				const text = await res.text();
				console.error('Unexpected Response Type:', text);
				throw new Error(`Expected JSON response but got: ${contentType}`);
			}

			// Handle non-200 HTTP responses
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

	private async searchFiles(query: string): Promise<any[]> {
		const result = await this.fetcher({
			method: 'GET',
			headers: {},
			url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&trashed=false&fields=files(id,name,mimeType,parents)`,
		});
		if (!result.files) {
			console.error('No files found:', result);
			return [];
		}
		return result.files;
	}

	async createFolder({ folderName, parentFolderId }: { folderName: string; parentFolderId?: string }): Promise<string> {
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

	async saveFile({ data, folderId }: { data: any; folderId: string }) {
		try {
			// Define file metadata, ensure correct folder is assigned
			const fileMetadata = {
				name: data.fileName,
				parents: [folderId], // Specify the folder ID
				mimeType: data.mimeType,
			};

			let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

			const formData = new FormData();
			formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
			formData.append('file', new Blob([data.body], { type: fileMetadata.mimeType })); // Set file data and MIME type

			// Upload file to Google Drive
			const file = await this.fetcher({
				method: 'POST',
				headers: {},
				body: formData,
				url: `${uploadUrl}&fields=id,parents`, // Request the file ID and parent folder IDs
			});

			// Set the file permission to "Anyone with the link" can view
			const permissionUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/permissions`;
			const permissionData = {
				role: 'reader',
				type: 'anyone', // Public access
			};

			await this.fetcher({
				method: 'POST',
				url: permissionUrl,
				headers: {},
				body: JSON.stringify(permissionData),
			});
			return file;
		} catch (error) {
			console.error('Error uploading file or setting permission:', error.message);
			return null;
		}
	}

	/**
	 * Get file from google drive by id
	 * @param id
	 * @returns file content
	 */
	async retrieve(id: string): Promise<{ name: string; data: any; id: string } | null> {
		const metadataUrl = `https://www.googleapis.com/drive/v3/files/${id}?fields=id,name`;
		const dataUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;

		try {
			// Initial "touch" request to ensure file accessibility for the current user
			const touchResponse = await fetch(metadataUrl, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
				},
			});

			if (!touchResponse.ok) {
				const errorData = await touchResponse.json();
				console.error(`Failed to "touch" file for accessibility with ID ${id}:`, errorData);
				return null;
			}

			// Fetch file metadata to get the name
			const metadata = await touchResponse.json();
			const fileName = metadata.name;

			// Fetch actual file data
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
			console.log(`File content type: ${contentType}`);

			let fileData;
			if (contentType?.includes('application/json')) {
				fileData = await dataResponse.json();
			} else if (contentType?.includes('text') || contentType?.includes('image/svg+xml')) {
				fileData = await dataResponse.text(); // Fetch SVG files as text for easy manipulation
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
				fileData = await dataResponse.arrayBuffer(); // Fallback for other binary types
			}

			// Return file ID, name, and data
			return { id: metadata.id, name: fileName, data: fileData };
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
	findFolders = async (folderId?: string): Promise<any[]> => {
		const query = folderId
			? `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`
			: `'root' in parents and mimeType='application/vnd.google-apps.folder'`;
		const folders = await this.searchFiles(query);

		return folders.filter((file: any) => file.mimeType === 'application/vnd.google-apps.folder');
	};

	/**
	 * Get the last file from folder by folderId
	 * @param folderId
	 * @returns last file content from folder by folderId
	 */
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

			// Find the latest file based on the timestamp in the file name
			const latestFile = fileContents.reduce((latest: any | null, current: any) => {
				// Check if the file name has the expected structure
				const nameParts = current.name.split('_');
				let currentTimestampStr;

				if (nameParts.length === 3) {
					// Structure with UUID: `${uuid}_${type}_${timestamp}.json`
					currentTimestampStr = nameParts[2];
				} else if (nameParts.length === 2) {
					// Structure without UUID: `${type}_${timestamp}.json`
					currentTimestampStr = nameParts[1];
				} else {
					// Log warning and skip this file if the structure is not as expected
					console.warn(`Unexpected file name format: ${current.name}`);
					return latest;
				}

				// Parse the timestamp from the file name
				const latestTimestamp = latest ? parseInt(latest.name.split('_').pop().split('.')[0], 10) : 0;
				const currentTimestamp = parseInt(currentTimestampStr.split('.')[0], 10);

				return currentTimestamp > latestTimestamp ? current : latest;
			}, null);

			// Return the content of the latest file
			return latestFile ? latestFile.content : null;
		} catch (error) {
			console.error('Error finding last file:', error);
			return null;
		}
	};

	/**
	 * Get all files content for the specified type ('KEYPAIRs' | 'VCs' | 'SESSIONs' | 'DIDs' | 'RECOMMENDATIONs')
	 * @param type
	 * @returns
	 */
	public async getAllFilesByType(type: 'KEYPAIRs' | 'VCs' | 'SESSIONs' | 'DIDs' | 'RECOMMENDATIONs' | 'MEDIAs'): Promise<FileContent[]> {
		try {
			// Step 1: Find the root 'Credentials' folder
			const rootFolders = await this.findFolders();
			const credentialsFolder = rootFolders.find((f: any) => f.name === 'Credentials');
			if (!credentialsFolder) {
				console.error('Credentials folder not found.');
				return [];
			}

			const credentialsFolderId = credentialsFolder.id;

			// Step 2: Handle special case for 'VCs'
			if (type === 'VCs') {
				// Find the 'VCs' folder under 'Credentials'
				const subfolders = await this.findFolders(credentialsFolderId);
				const targetFolder = subfolders.find((f: any) => f.name === 'VCs');
				if (!targetFolder) {
					console.error(`Folder for type ${type} not found.`);
					return [];
				}

				const targetFolderId = targetFolder.id;

				// Fetch all 'VC-timestamp' subfolders under 'VCs'
				const vcSubfolders = await this.findFolders(targetFolderId);

				// Retrieve all 'VC.json' files from each 'VC-timestamp' subfolder
				const fileContents: any[] = await Promise.all(
					vcSubfolders.map(async (folder: any) => {
						const files = await this.findFilesUnderFolder(folder.id);

						return Promise.all(
							files.map(async (file: any) => {
								return await this.retrieve(file.id);
							})
						);
					})
				);

				return fileContents;
			}

			// Step 3: Generic handling for other types
			const subfolders = await this.findFolders(credentialsFolderId);
			const targetFolder = subfolders.find((f: any) => f.name === type);
			if (!targetFolder) {
				console.error(`Folder for type ${type} not found.`);
				return [];
			}

			const filesResponse = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files?q='${targetFolder.id}' in parents and trashed=false&fields=files(id,name,mimeType,parents)`,
			});

			const files = filesResponse.files;

			const fileContents = await Promise.all(
				files.map(async (file: any) => {
					return await this.retrieve(file.id);
				})
			);

			return fileContents;
		} catch (error) {
			console.error(`Error getting files of type ${type}:`, error);
			return []; // Return an empty array on error
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
			const metadata = {
				name: newFileName, // New name for the file
			};

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

	async findFileByName(name: FilesType) {
		// find the file named under Credentials folder
		const rootFolders = await this.findFolders();
		const credentialsFolderId = rootFolders.find((f: any) => f.name === 'Credentials')?.id;
		if (!credentialsFolderId) throw new Error('Credentials folder not found');

		const files = await this.searchFiles(`'${credentialsFolderId}' in parents and name='${name}'`);
		return files[0];
	}

	async findFilesUnderFolder(folderId: string) {
		if (!folderId) throw new Error('Folder ID is required');
		console.log('🚀 ~ GoogleDriveStorage ~ findFilesUnderFolder ~ folderId', folderId);
		const files = await this.searchFiles(`'${folderId}' in parents`);
		return files;
	}

	async updateFileData(fileId: string, data: DataToSaveI) {
		const fileMetadata = {
			name: data.fileName,
			mimeType: data.mimeType,
		};

		let uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;

		const formData = new FormData();
		formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
		formData.append('file', new Blob([data.body], { type: fileMetadata.mimeType }));

		const updatedFile = await this.fetcher({
			method: 'PATCH',
			headers: {},
			body: JSON.stringify(formData),
			url: `${uploadUrl}&fields=id,parents`,
		});

		console.log('File updated:', updatedFile);
		return updatedFile;
	}

	async getFileParents(fileId: string) {
		console.log('🚀 ~ GoogleDriveStorage ~ getFileParents ~ fileId', fileId);
		const file = await this.fetcher({
			method: 'GET',
			headers: {},
			url: `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`,
		});

		return file.parents;
	}

	async updateRelationsFile({ relationsFileId, recommendationFileId }: { relationsFileId: string; recommendationFileId: string }) {
		const relationsFileContent = await this.retrieve(relationsFileId);
		const relationsData = relationsFileContent.data;

		relationsData.recommendations.push(recommendationFileId);

		const updatedContent = JSON.stringify(relationsData);

		const updateResponse = await this.fetcher({
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: updatedContent,
			url: `https://www.googleapis.com/upload/drive/v3/files/${relationsFileId}?uploadType=media`,
		});

		console.log('🚀 ~ GoogleDriveStorage ~ updateRelationsFile ~ updateResponse:', updateResponse);

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
}
