import { DataToSaveI, KeyPair } from '../../types';
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

	// Method to fetch data from Google Drive API
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

			// Check for errors in the response
			const data = await res.json();
			if (!res.ok) {
				console.error('Error Response:', JSON.stringify(data));
				throw new Error(data.error.message || 'Unknown error');
			}

			return data;
		} catch (error) {
			console.error('Error fetching data:', error.message);
			throw error;
		}
	}

	// Method to search for files in Google Drive by query
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
			// Define file metadata, ensure correct folder is assigned
			const fileMetadata = {
				name: data.fileName,
				parents: [folderId], // Specify the folder ID
				mimeType: 'application/json', // Use provided MIME type or default to JSON
			};

			let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

			const formData = new FormData();
			formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
			formData.append('file', new Blob([data.body], { type: fileMetadata.mimeType })); // Set file data and MIME type

			const file = await this.fetcher({
				method: 'POST',
				headers: {},
				body: formData,
				url: uploadUrl,
			});

			console.log('File uploaded successfully:', file.id);
			return file;
		} catch (error) {
			console.error('Error uploading file:', error.message);
			return null;
		}
	}

	/**
	 * Add comment to VC
	 * @param fileId - th id of VC file
	 * @returns
	 */
	public async addCommentToFile(vcFileId: string, recommendationFileId: string) {
		if (!recommendationFileId || !vcFileId || !this.accessToken) {
			throw new Error('Missing required parameters: fileId, commentText, or accessToken');
		}

		const url = `https://www.googleapis.com/drive/v3/files/${vcFileId}/comments?fields=id,content,createdTime`;
		const body = {
			content: generateViewLink(recommendationFileId),
		};

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const errorDetails = await response.json();
				throw new Error(`Failed to add comment: ${JSON.stringify(errorDetails)}`);
			}

			const result = await response.json();
			console.log('Comment added successfully:', result);
			return result;
		} catch (error) {
			console.error('Error adding comment to file:', error);
			throw error;
		}
	}

	/**
	 * Add commenter role to a file
	 * @param fileId
	 * @returns
	 */
	async addCommenterRoleToFile(fileId: string) {
		const url = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
		const body = {
			role: 'commenter',
			type: 'anyone',
		};

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const errorDetails = await response.json();
				throw new Error(`Failed to add permission: ${JSON.stringify(errorDetails)}`);
			}

			const result = await response.json();
			console.log('Permission added successfully:', result);
			return result;
		} catch (error) {
			console.error('Error adding permission:', error.message);
			throw error;
		}
	}

	/**
	 * Get file from google drive by id
	 * @param id
	 * @returns file content
	 */
	async retrieve(id: string): Promise<any> {
		try {
			const file = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
			});

			return file;
		} catch (error) {
			console.error('Error retrieving file:', error);
			return null;
		}
	}

	/**
	 * Get folder by folderId, if folderId == null you will have them all
	 * @param id [Optional]
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
				// Assuming the file name is formatted as `${uuid}_${type}_${timestamp}.json`
				const latestTimestamp = latest ? parseInt(latest.name.split('_')[2].split('.')[0], 10) : 0;
				const currentTimestamp = parseInt(current.name.split('_')[2].split('.')[0], 10);
				return currentTimestamp > latestTimestamp ? current : latest;
			}, null);

			// Return the content of the latest file
			return latestFile ? latestFile.content : null;
		} catch (error) {
			console.error('Error finding last file:', error);
			return null;
		}
	};

	public async getFileComments(fileId: string) {
		try {
			// Fetch comments on the file using Google Drive API
			const commentsResponse = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files/${fileId}/comments?fields=comments(content,author/displayName,createdTime)`,
			});

			// Return the comments data if available
			return commentsResponse.comments || []; // Return an empty array if no comments
		} catch (error) {
			console.error(`Failed to fetch comments for file ID: ${fileId}`, error);
			return []; // Handle errors by returning an empty array or some error indication
		}
	}

	/**
	 * Get all files content for the specified type ('KEYPAIRs' | 'VCs' | 'SESSIONs' | 'DIDs' | 'RECOMMENDATIONs')
	 * @param type
	 * @returns
	 */
	public async getAllFilesByType(type: 'KEYPAIRs' | 'VCs' | 'SESSIONs' | 'DIDs' | 'RECOMMENDATIONs'): Promise<FileContent[]> {
		try {
			// Step 1: Find all root folders
			const rootFolders = await this.findFolders();
			const credentialsFolder = rootFolders.find((f: any) => f.name === 'Credentials');
			if (!credentialsFolder) return [];

			const credentialsFolderId = credentialsFolder.id;

			// Step 2: Find the subfolder corresponding to the specified type
			const subfolders = await this.findFolders(credentialsFolderId);
			const targetFolder = subfolders.find((f: any) => f.name === type);
			if (!targetFolder) return [];

			// Step 3: Fetch all files in the specified folder
			const filesResponse = await this.fetcher({
				method: 'GET',
				headers: {},
				url: `https://www.googleapis.com/drive/v3/files?q='${targetFolder.id}' in parents and trashed=false&fields=files(id,name,mimeType,parents)`,
			});

			const files = filesResponse.files;

			// Step 4: Fetch the content and comments of each file
			const fileContents = await Promise.all(
				files.map(async (file: any) => {
					// Fetch file content
					const content = await this.fetcher({
						method: 'GET',
						headers: {},
						url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
					});

					// Fetch file comments (if applicable)
					const comments = await this.getFileComments(file.id);

					return {
						id: file.id,
						name: file.name,
						content,
						comments: comments.map((comment: any) => comment.content),
					};
				})
			);

			return fileContents; // Return the list of files with their content and comments
		} catch (error) {
			console.error(`Error getting files of type ${type}:`, error);
			return []; // Return an empty array on error
		}
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
