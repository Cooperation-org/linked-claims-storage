export const resumeFolderTypes = {
    root: 'RESUMES_AUTHOR',
    nonSigned: 'NON_SIGNED_RESUMES',
    signed: 'SIGNED_RESUMES',
};
export class StorageHandler {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    async getOrCreateFolder(folderName, parentId) {
        const folders = await this.storage.findFolders(parentId); // Fetch all child folders of the parent
        let folder = folders.find((folder) => {
            return folder.name === folderName;
        });
        if (!folder) {
            folder = await this.storage.createFolder({
                folderName,
                parentFolderId: parentId,
            });
        }
        return folder;
    }
    async findFilesInFolder(folderName) {
        const folders = await this.storage.findFolders();
        const folder = folders.find((folder) => folder.name === folderName);
        if (!folder) {
            throw new Error(`${folderName} folder not found`);
        }
        return this.storage.findFilesUnderFolder(folder.id);
    }
}
export class Resume extends StorageHandler {
    constructor(storage) {
        super(storage);
    }
    async saveResume({ resume, type }) {
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
        }
        catch (error) {
            throw new Error(`Error while saving ${type} resume: ${error.message}`);
        }
    }
    async find() {
        try {
            const signedResumes = await this.getSignedResumes();
            const nonSignedResumes = await this.getNonSignedResumes();
            return {
                signed: signedResumes,
                nonSigned: nonSignedResumes,
            };
        }
        catch (error) {
            throw new Error('Error while fetching resume: ' + error.message);
        }
    }
    async getSignedResumes() {
        try {
            // Find the root folder first
            const rootFolder = await this.findRootFolder();
            // Find or create the signed resumes folder
            const signedFolder = await this.getOrCreateFolder(resumeFolderTypes.signed, rootFolder.id);
            // Retrieve all files from the signed folder
            const files = await this.storage.findFilesUnderFolder(signedFolder.id);
            return files;
        }
        catch (error) {
            throw new Error('Error while fetching signed resumes: ' + error.message);
        }
    }
    async getNonSignedResumes() {
        try {
            // Find the root folder first
            const rootFolder = await this.findRootFolder();
            // Find or create the non-signed resumes folder
            const nonSignedFolder = await this.getOrCreateFolder(resumeFolderTypes.nonSigned, rootFolder.id);
            // Retrieve all files from the non-signed folder
            const files = await this.storage.findFilesUnderFolder(nonSignedFolder.id);
            return files;
        }
        catch (error) {
            throw new Error('Error while fetching non-signed resumes: ' + error.message);
        }
    }
    async findRootFolder() {
        const rootFolders = await this.storage.findFolders(); // Fetch all root-level folders
        const rootFolder = rootFolders.find((folder) => folder.name === resumeFolderTypes.root);
        if (!rootFolder) {
            throw new Error(`Root folder "${resumeFolderTypes.root}" not found in the root directory.`);
        }
        return rootFolder;
    }
    isResumeFolderExist() { }
}
export default Resume;
