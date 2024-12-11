import { GoogleDriveStorage } from './GoogleDriveStorage';

export class StorageHandler {
	protected storage: GoogleDriveStorage;

	constructor(storage: GoogleDriveStorage) {
		this.storage = storage;
	}

	protected async getOrCreateFolder(folderName: string, parentId?: string) {
		const folders = await this.storage.findFolders(parentId);
		let folder = folders.find((folder) => folder.name === folderName);
		if (!folder) {
			folder = await this.storage.createFolder({ folderName, parentFolderId: parentId });
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

export const resumeFolderTypes = {
	root: 'RESUMES_AUTHOR',
	nonSigned: 'RESUMES_NON_SIGNED',
	signed: 'RESUMES_SIGNED',
};

export class Resume extends StorageHandler {
	constructor(storage: GoogleDriveStorage) {
		super(storage);
	}

	public signResume({ resume }) {
		// genetrate unsingned resume
		// sign resume
	}

	public async saveResume({ resume, type = 'unsigned' }: { resume: any; type?: 'sign' | 'unsigned' }) {
		try {
			const rootFolder = await this.getOrCreateFolder(resumeFolderTypes.root);

			const subFolderName = type === 'sign' ? resumeFolderTypes.signed : resumeFolderTypes.nonSigned;
			const subFolder = await this.getOrCreateFolder(subFolderName, rootFolder.id);

			const savedResume = await this.storage.saveFile({
				folderId: subFolder.id,
				data: resume,
			});

			return savedResume;
		} catch (error) {
			throw new Error(`Error while saving ${type} resume: ${error.message}`);
		}
	}

	public async find({ id }: { id?: string }) {
		try {
			if (id) {
				return await this.storage.retrieve(id);
			}

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
			const rootFolder = await this.getOrCreateFolder(resumeFolderTypes.root);
			const signedFolder = await this.getOrCreateFolder(resumeFolderTypes.signed, rootFolder.id);
			return await this.storage.findFilesUnderFolder(signedFolder.id);
		} catch (error) {
			throw new Error('Error while fetching signed resumes: ' + error.message);
		}
	}

	public async getNonSignedResumes() {
		try {
			const rootFolder = await this.getOrCreateFolder(resumeFolderTypes.root);
			const nonSignedFolder = await this.getOrCreateFolder(resumeFolderTypes.nonSigned, rootFolder.id);
			return await this.storage.findFilesUnderFolder(nonSignedFolder.id);
		} catch (error) {
			throw new Error('Error while fetching non-signed resumes: ' + error.message);
		}
	}

	private generarteUnsignedResume() {}
	private isResumeFolderExist() {}
}

export default Resume;
