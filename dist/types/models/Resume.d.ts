import { GoogleDriveStorage } from './GoogleDriveStorage.js';
export declare const resumeFolderTypes: {
    root: string;
    nonSigned: string;
    signed: string;
};
export declare class StorageHandler {
    protected storage: GoogleDriveStorage;
    constructor(storage: GoogleDriveStorage);
    getOrCreateFolder(folderName: string, parentId: string): Promise<any>;
    protected findFilesInFolder(folderName: string): Promise<any[]>;
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
    private findRootFolder;
    private isResumeFolderExist;
}
export default Resume;
