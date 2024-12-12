import { GoogleDriveStorage } from './GoogleDriveStorage';

export const resumeFolderTypes = {
	root: 'RESUMES_AUTHOR',
	nonSigned: 'NON_SIGNED_RESUMES',
	signed: 'SIGNED_RESUMES',
};
export class StorageHandler {
	protected storage: GoogleDriveStorage;

	constructor(storage: GoogleDriveStorage) {
		this.storage = storage;
	}

	protected async getOrCreateFolder(folderName: string, parentId: string): Promise<any> {
		const folders = await this.storage.findFolders(parentId); // Fetch all child folders of the parent
		let folder = folders.find((folder) => {
			return folder.name === folderName;
		});
		if (folder && folder.name === 'RESUMES_AUTHOR') {
		}
		if (!folder) {
			folder = await this.storage.createFolder({
				folderName,
				parentFolderId: parentId,
			});
		}

		return folder;
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

	public signResume({ resume }) {
		// genetrate unsingned resume
		// sign resume
	}

	public async saveResume({ resume, type }: { resume: any; type: 'sign' | 'unsigned' }) {
		try {
			// Get or create the root folder

			const rootFolders = await this.storage.findFolders();
			let rootFolder = rootFolders.find((folder) => folder.name === resumeFolderTypes.root);
			if (!rootFolder) {
				rootFolder = await this.storage.createFolder({ folderName: resumeFolderTypes.root, parentFolderId: 'root' });
			}

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
			const rootFolder = await this.findRootFolder();

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
			const rootFolder = await this.findRootFolder();

			// Find or create the non-signed resumes folder
			const nonSignedFolder = await this.getOrCreateFolder(resumeFolderTypes.nonSigned, rootFolder.id);

			// Retrieve all files from the non-signed folder
			const files = await this.storage.findFilesUnderFolder(nonSignedFolder.id);

			return files;
		} catch (error) {
			throw new Error('Error while fetching non-signed resumes: ' + error.message);
		}
	}

	private async findRootFolder() {
		const rootFolders = await this.storage.findFolders(); // Fetch all root-level folders
		const rootFolder = rootFolders.find((folder) => folder.name === resumeFolderTypes.root);

		if (!rootFolder) {
			throw new Error(`Root folder "${resumeFolderTypes.root}" not found in the root directory.`);
		}

		return rootFolder;
	}

	private generarteUnsignedResume() {}
	private isResumeFolderExist() {}
}

export default Resume;
