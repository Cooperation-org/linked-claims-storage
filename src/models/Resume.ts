import { GoogleDriveStorage } from './GoogleDriveStorage.js';

export const resumeFolderTypes = {
	root: 'RESUMES_AUTHOR',
	nonSigned: 'NON_SIGNED_RESUMES',
	signed: 'SIGNED_RESUMES',
};
export class StorageHandler {
	protected storage: GoogleDriveStorage;
	private folderCreationPromises: Record<string, Promise<any>> = {};
	private createdFolders: Record<string, any> = {};

	constructor(storage: GoogleDriveStorage) {
		this.storage = storage;
	}

	public async getOrCreateFolder(folderName: string, parentId: string): Promise<any> {
		const cacheKey = `${parentId}_${folderName}`;

		// Check our local cache first (this is separate from the storage's cache)
		if (this.createdFolders[cacheKey]) {
			console.log(`Using cached folder ${folderName} (${this.createdFolders[cacheKey].id}) under ${parentId}`);
			return this.createdFolders[cacheKey];
		}

		// If there's an existing promise for this folder, wait for it
		if (this.folderCreationPromises[cacheKey]) {
			console.log(`Waiting for existing folder creation: ${folderName} under ${parentId}`);
			return this.folderCreationPromises[cacheKey];
		}

		// Create a new promise for this folder operation
		this.folderCreationPromises[cacheKey] = (async () => {
			try {
				// Double-check if folder exists
				console.log(`Searching for folder ${folderName} under ${parentId}`);
				const folders = await this.storage.findFolders(parentId);
				let folder = folders.find((f) => f.name === folderName);

				if (folder) {
					console.log(`Found existing folder ${folderName} (${folder.id}) under ${parentId}`);
				} else {
					console.log(`Creating folder ${folderName} under ${parentId} (no existing folder found)`);
					folder = await this.storage.createFolder({
						folderName,
						parentFolderId: parentId,
					});
					console.log(`Created folder ${folderName} (${folder.id}) under ${parentId}`);
				}

				// Store in our local cache
				this.createdFolders[cacheKey] = folder;
				return folder;
			} catch (error) {
				console.error(`Error in getOrCreateFolder(${folderName}, ${parentId}):`, error);
				throw error;
			} finally {
				// Clean up the promise after completion
				delete this.folderCreationPromises[cacheKey];
			}
		})();

		return this.folderCreationPromises[cacheKey];
	}

	protected async findFilesInFolder(folderName: string) {
		const folders = await this.storage.findFolders();
		const folder = folders.find((folder) => folder.name === folderName);
		if (!folder) {
			throw new Error(`${folderName} folder not found`);
		}
		return this.storage.findFilesUnderFolder(folder.id);
	}
}

export class Resume extends StorageHandler {
	constructor(storage: GoogleDriveStorage) {
		super(storage);
	}

	public async saveResume({ resume, type }: { resume: any; type: 'sign' | 'unsigned' }) {
		try {
			let rootFolder = await this.getOrCreateFolder(resumeFolderTypes.root, 'root');
			console.log('🚀 ~ Resume ~ saveResume ~ rootFolder:', rootFolder);

			// Get or create the subfolder
			const subFolderName = type === 'sign' ? resumeFolderTypes.signed : resumeFolderTypes.nonSigned;
			const subFolder = await this.getOrCreateFolder(subFolderName, rootFolder.id);

			// Save the file in the subfolder
			const savedResume = await this.storage.saveFile({
				folderId: subFolder.id, // Ensure this points to the subfolder
				data: resume,
			});

			return savedResume;
		} catch (error) {
			throw new Error(`Error while saving ${type} resume: ${error.message}`);
		}
	}

	public async find() {
		try {
			const signedResumes = await this.getSignedResumes();
			const nonSignedResumes = await this.getNonSignedResumes();

			return {
				signed: signedResumes,
				nonSigned: nonSignedResumes,
			};
		} catch (error) {
			throw new Error('Error while fetching resume: ' + error.message);
		}
	}

	public async getSignedResumes() {
		try {
			// Find the root folder first
			const rootFolder = await this.getOrCreateFolder(resumeFolderTypes.root, 'root');

			// Find or create the signed resumes folder
			const signedFolder = await this.getOrCreateFolder(resumeFolderTypes.signed, rootFolder.id);

			// Retrieve all files from the signed folder
			const files = await this.storage.findFilesUnderFolder(signedFolder.id);

			return files;
		} catch (error) {
			throw new Error('Error while fetching signed resumes: ' + error.message);
		}
	}

	public async getNonSignedResumes() {
		try {
			// Find the root folder first
			const rootFolder = await this.getOrCreateFolder(resumeFolderTypes.root, 'root');

			// Find or create the non-signed resumes folder
			const nonSignedFolder = await this.getOrCreateFolder(resumeFolderTypes.nonSigned, rootFolder.id);

			// Retrieve all files from the non-signed folder
			const files = await this.storage.findFilesUnderFolder(nonSignedFolder.id);

			return files;
		} catch (error) {
			throw new Error('Error while fetching non-signed resumes: ' + error.message);
		}
	}

	public async saveResumeDraft(data: any, signedResumeId: string) {
		try {
			const fileName = `FinalDraft_${signedResumeId}.json`;

			// 1. Find or create root and NON_SIGNED_RESUMES folder
			const rootFolder = await this.getOrCreateFolder(resumeFolderTypes.root, 'root');
			const nonSignedFolder = await this.getOrCreateFolder(resumeFolderTypes.nonSigned, rootFolder.id);

			const dataWithFileName = {
				...data,
				fileName: `FinalDraft_${signedResumeId}.json`,
			};

			// Save the file
			const savedDraft = await this.storage.saveFile({
				data: dataWithFileName,
				folderId: nonSignedFolder.id,
			});

			console.log(`✅ Draft saved as ${fileName}`);
			return savedDraft;
		} catch (error) {
			console.error('❌ Error saving resume draft:', error);
			throw new Error('Failed to save resume draft: ' + error.message);
		}
	}

	private isResumeFolderExist() {}
}

export default Resume;
