export const resumeFolderTypes = {
    root: 'RESUMES_AUTHOR',
    nonSigned: 'NON_SIGNED_RESUMES',
    signed: 'SIGNED_RESUMES',
};
export class StorageHandler {
    storage;
    rootFolderId = null;
    folderCache = new Map();
    folderCreationLock = Promise.resolve();
    constructor(storage) {
        this.storage = storage;
    }
    async findRootFolder() {
        // If we already have the root folder ID, return it
        if (this.rootFolderId) {
            return this.rootFolderId;
        }
        // Use a lock to prevent concurrent creation
        await this.folderCreationLock;
        let releaseLock;
        this.folderCreationLock = new Promise((resolve) => {
            releaseLock = resolve;
        });
        try {
            // Check again in case another call set it while we were waiting
            if (this.rootFolderId) {
                return this.rootFolderId;
            }
            const rootFolders = await this.storage.findFolders('root'); // Explicitly look in root
            let rootFolder = rootFolders.find((folder) => folder.name === resumeFolderTypes.root && folder.parents?.includes('root'));
            if (!rootFolder) {
                rootFolder = await this.storage.createFolder({
                    folderName: resumeFolderTypes.root,
                    parentFolderId: 'root', // Explicitly set to root
                });
            }
            this.rootFolderId = rootFolder.id;
            return this.rootFolderId;
        }
        finally {
            releaseLock();
        }
    }
    async getOrCreateFolder(folderName, parentName) {
        const cacheKey = parentName ? `${parentName}/${folderName}` : folderName;
        // Check cache first
        if (this.folderCache.has(cacheKey)) {
            const folderId = this.folderCache.get(cacheKey);
            return { id: folderId, name: folderName };
        }
        // Determine parent folder
        let parentId = 'root';
        if (parentName) {
            const parentFolder = await this.getOrCreateFolder(parentName);
            parentId = parentFolder.id;
        }
        else {
            parentId = await this.findRootFolder();
        }
        // Search for existing folder
        const folders = await this.storage.findFolders(parentId);
        let folder = folders.find((f) => f.name === folderName);
        // Create if not found
        if (!folder) {
            folder = await this.storage.createFolder({
                folderName,
                parentFolderId: parentId,
            });
        }
        // Cache the result
        this.folderCache.set(cacheKey, folder.id);
        return folder;
    }
    async findFilesInFolder(folderName, parentName) {
        const folder = await this.getOrCreateFolder(folderName, parentName);
        return this.storage.findFilesUnderFolder(folder.id);
    }
}
export class Resume extends StorageHandler {
    constructor(storage) {
        super(storage);
    }
    async saveResume({ resume, type }) {
        try {
            const subFolderName = type === 'sign' ? resumeFolderTypes.signed : resumeFolderTypes.nonSigned;
            const subFolder = await this.getOrCreateFolder(subFolderName, resumeFolderTypes.root);
            const savedResume = await this.storage.saveFile({
                folderId: subFolder.id,
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
            const [signedResumes, nonSignedResumes] = await Promise.all([this.getSignedResumes(), this.getNonSignedResumes()]);
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
            const signedFolder = await this.getOrCreateFolder(resumeFolderTypes.signed, resumeFolderTypes.root);
            return this.storage.findFilesUnderFolder(signedFolder.id);
        }
        catch (error) {
            throw new Error('Error while fetching signed resumes: ' + error.message);
        }
    }
    async getNonSignedResumes() {
        try {
            const nonSignedFolder = await this.getOrCreateFolder(resumeFolderTypes.nonSigned, resumeFolderTypes.root);
            return this.storage.findFilesUnderFolder(nonSignedFolder.id);
        }
        catch (error) {
            throw new Error('Error while fetching non-signed resumes: ' + error.message);
        }
    }
    async saveResumeDraft(data, signedResumeId) {
        try {
            const fileName = `FinalDraft_${signedResumeId}.json`;
            const nonSignedFolder = await this.getOrCreateFolder(resumeFolderTypes.nonSigned, resumeFolderTypes.root);
            const dataWithFileName = {
                ...data,
                fileName,
            };
            const savedDraft = await this.storage.saveFile({
                data: dataWithFileName,
                folderId: nonSignedFolder.id,
            });
            console.log(`✅ Draft saved as ${fileName}`);
            return savedDraft;
        }
        catch (error) {
            console.error('❌ Error saving resume draft:', error);
            throw new Error('Failed to save resume draft: ' + error.message);
        }
    }
}
export default Resume;
