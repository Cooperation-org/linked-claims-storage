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
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					...headers,
				},
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

	private async getFileContent(fileId: string): Promise<any> {
		const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
		try {
			const response = await this.fetcher({
				method: 'GET',
				headers: {}, // Add additional headers if required
				url,
			});

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
		if (!result.files) {
			console.error('No files found:', result);
			return [];
		}
		return result.files;
	}

	async createFolder({ folderName, parentFolderId }: { folderName: string; parentFolderId: string }): Promise<{
		id: string;
		name: string;
		mimeType: string;
		parents: string[];
	}> {
		if (!parentFolderId) {
			throw new Error(`Parent folder ID must be provided when creating folder "${folderName}".`);
		}

		const metadata = {
			name: folderName,
			mimeType: 'application/vnd.google-apps.folder',
			parents: [parentFolderId], // Explicitly associate with the parent folder
		};

		const folder = await this.fetcher({
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(metadata),
			url: 'https://www.googleapis.com/drive/v3/files',
		});

		console.log(`Folder created: "${folderName}" with ID: ${folder.id}, Parent: ${parentFolderId}`);
		return folder;
	}

	async saveFile({ data, folderId }: { data: any; folderId: string }) {
		try {
			if (!folderId) {
				throw new Error('Folder ID is required to save a file.');
			}

			// Define file metadata, ensure correct folder is assigned
			const fileMetadata = {
				name: data.fileName || 'resume.json', // Use the provided fileName or default to 'resume.json'
				parents: [folderId], // Specify the folder ID
				mimeType: 'application/json', // Ensure the MIME type is set to JSON
			};

			// Check if the parent folder is in the trash
			const folder = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files/${folderId}?fields=trashed`,
			});
			if (folder.trashed) {
				throw new Error('Parent folder is in trash');
			}

			// Prepare the file content as a JSON string
			const fileContent = JSON.stringify(data);

			// Create a Blob from the JSON string
			const fileBlob = new Blob([fileContent], { type: 'application/json' });

			// Create FormData and append the metadata and file content
			const formData = new FormData();
			formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
			formData.append('file', fileBlob);

			// Upload file to Google Drive
			console.log('Uploading file...');
			const file = await this.fetcher({
				method: 'POST',
				headers: {},
				body: formData,
				url: `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,parents`,
			});

			// Set file permissions
			await this.fetcher({
				method: 'POST',
				url: `https://www.googleapis.com/drive/v3/files/${file.id}/permissions`,
				headers: {},
				body: JSON.stringify({
					role: 'reader',
					type: 'anyone',
				}),
			});

			// Check for existing file_ids.json in appDataFolder
			let existingFileId: string | null = null;
			let existingFileIds = [];

			try {
				const existingFileQuery = await this.fetcher({
					method: 'GET',
					headers: {},
					url: `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='file_ids.json'&fields=files(id)`,
				});

				if (existingFileQuery.files?.length > 0) {
					existingFileId = existingFileQuery.files[0].id;
					const fileContent = await this.fetcher({
						method: 'GET',
						headers: {},
						url: `https://www.googleapis.com/drive/v3/files/${existingFileId}?alt=media`,
					});
					existingFileIds = JSON.parse(fileContent);
				}
				console.log('existingFileId', existingFileId);
			} catch (error) {
				console.log('Creating new file_ids.json');
			}

			// Add new file ID
			existingFileIds.push(file.id);

			// Metadata for app data file
			const appDataFileMetadata = {
				name: 'file_ids.json',
				mimeType: 'application/json',
				parents: ['appDataFolder'],
			};

			// Update or create file_ids.json
			const formDataForAppData = new FormData();
			formDataForAppData.append('metadata', new Blob([JSON.stringify(appDataFileMetadata)], { type: 'application/json' }));
			formDataForAppData.append('file', new Blob([JSON.stringify(existingFileIds)], { type: 'application/json' }));

			if (existingFileId) {
				await this.fetcher({
					method: 'PATCH',
					headers: {},
					body: formDataForAppData,
					url: `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id`,
				});
			} else {
				await this.fetcher({
					method: 'POST',
					headers: {},
					body: formDataForAppData,
					url: `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&spaces=appDataFolder`,
				});
			}
			console.log(file);

			return file;
		} catch (error) {
			console.error('Error:', error.message);
			throw error;
		}
	}
	/**
	 * Get file from google drive by id
	 * @param id
	 * @returns file content
	 */
	async retrieve(id: string): Promise<{ data: any } | null> {
		const metadataUrl = `https://www.googleapis.com/drive/v3/files/${id}?fields=id,name`;
		const dataUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;

		try {
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
	findFolders = async (folderId?: string): Promise<any[]> => {
		const query = folderId
			? `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`
			: `'root' in parents and mimeType='application/vnd.google-apps.folder'`;
		const folders = await this.searchFiles(query);

		return folders.filter((file: any) => file.mimeType === 'application/vnd.google-apps.folder');
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
						console.log('🚀 ~ GoogleDriveStorage ~ vcSubfolders.map ~ files:', files);

						return Promise.all(
							files.map(async (file: any) => {
								return await this.retrieve(file.id);
							})
						);
					})
				);
				console.log('🚀 ~ GoogleDriveStorage ~ getAllFilesByType ~ fileContents:', fileContents);

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

	async findFileByName(name: string) {
		// find the file named under Credentials folder
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

		// Fetch content for each file
		const filesWithContent = await Promise.all(
			files.map(async (file) => {
				try {
					const content = await this.getFileContent(file.id);
					return { ...file, content };
				} catch (error) {
					console.error(`Error fetching content for file "${file.name}" (ID: ${file.id}):`, error);
					return { ...file, content: null }; // Handle errors gracefully
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
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: data.fileName,
				}),
				url: updateUrl,
			});

			console.log('✅ File renamed successfully:', updatedFile);
			return updatedFile;
		} catch (error) {
			throw error;
		}
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

	async update(fileId: string, data: any) {
		console.log('🚀 ~ GoogleDriveStorage ~ update ~ data:', data);
		console.log('🚀 ~ GoogleDriveStorage ~ update ~ fileId:', fileId);

		// ✅ Ensure JSON file type
		const metadata = {
			name: data.fileName || 'resume.json',
			mimeType: 'application/json',
		};

		const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;

		// ✅ Create multipart request to update Google Drive JSON file
		const formData = new FormData();

		formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

		formData.append(
			'file',
			new Blob([JSON.stringify(data.body)], { type: 'application/json' }) // ✅ Ensure JSON format
		);

		console.log('🚀 ~ GoogleDriveStorage ~ update ~ FormData:', formData);

		try {
			const response = await this.fetcher({
				method: 'PATCH',
				headers: {}, // ✅ No Content-Type needed, let FormData set it
				body: formData, // ✅ Sends JSON file properly
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
			// Step 1: Search for the file_ids.json file in the appDataFolder
			const response = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files?q=name='file_ids.json' and 'appDataFolder' in parents&fields=files(id)`,
			});

			// Step 2: Check if the file exists
			if (!response.files || response.files.length === 0) {
				console.log('No file_ids.json found in appDataFolder.');
				return [];
			}

			// Step 3: Get the file ID of file_ids.json
			const fileId = response.files[0].id;

			// Step 4: Fetch the content of file_ids.json
			const fileContent = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
			});

			// Step 5: Parse the file content (array of file IDs)
			const fileIds = JSON.parse(fileContent);
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
