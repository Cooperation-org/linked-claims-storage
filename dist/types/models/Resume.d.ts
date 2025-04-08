import { GoogleDriveStorage } from './GoogleDriveStorage.js';
export declare const resumeFolderTypes: {
    root: string;
    nonSigned: string;
    signed: string;
};
export declare class StorageHandler {
    protected storage: GoogleDriveStorage;
    protected rootFolderId: string | null;
    protected folderCache: Map<string, string>;
    private folderCreationLock;
    constructor(storage: GoogleDriveStorage);
    protected findRootFolder(): Promise<string>;
    getOrCreateFolder(folderName: string, parentName?: string): Promise<any>;
    protected findFilesInFolder(folderName: string, parentName?: string): Promise<any[]>;
}
export declare class Resume extends StorageHandler {
    constructor(storage: GoogleDriveStorage);
    saveResume({ resume, type }: {
        resume: any;
        type: 'sign' | 'unsigned';
    }): Promise<any>;
    find(): Promise<{
        signed: any[];
        nonSigned: any[];
    }>;
    getSignedResumes(): Promise<any[]>;
    getNonSignedResumes(): Promise<any[]>;
    saveResumeDraft(data: any, signedResumeId: string): Promise<any>;
}
export default Resume;
