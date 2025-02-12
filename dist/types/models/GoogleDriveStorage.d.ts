interface FileContent {
    name: string;
    content: any;
    comments: string[];
}
type FileType = 'KEYPAIRs' | 'VCs' | 'SESSIONs' | 'DIDs' | 'RECOMMENDATIONs' | 'MEDIAs';
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
export declare class GoogleDriveStorage {
    private accessToken;
    folderCache: any;
    private fileIdsCache;
    private updateFileIdsJson;
    constructor(accessToken: string);
    private fetcher;
    private getFileContent;
    private searchFiles;
    createFolder({ folderName, parentFolderId }: {
        folderName: string;
        parentFolderId: string;
    }): Promise<any>;
    getMediaFolderId(): Promise<any>;
    uploadBinaryFile({ file }: {
        file: File;
    }): Promise<any>;
    saveFile({ data, folderId }: {
        data: any;
        folderId: string;
    }): Promise<any>;
    /**
     * Get file from google drive by id
     * @param id
     * @returns file content
     */
    retrieve(id: string): Promise<{
        data: any;
    } | null>;
    /**
     * Get folder by folderId, if folderId == null you will have them all
     * @param folderId [Optional]
     * @returns
     */
    findFolders(folderId?: string): Promise<any[]>;
    /**
     * Get all files content for the specified type ('KEYPAIRs' | 'VCs' | 'SESSIONs' | 'DIDs' | 'RECOMMENDATIONs')
     * @param type
     * @returns
     */
    getAllFilesByType(type: FileType): Promise<FileContent[]>;
    /**
     * Update the name of a file in Google Drive
     * @param fileId - The ID of the file to update
     * @param newFileName - The new name for the file
     * @returns The updated file metadata, including the new name
     */
    updateFileName(fileId: string, newFileName: string): Promise<any>;
    findFileByName(name: string): Promise<any>;
    findFilesUnderFolder(folderId: string): Promise<any[]>;
    updateFileData(fileId: string, data: {
        fileName: string;
    }): Promise<any>;
    getFileParents(fileId: string): Promise<any>;
    updateRelationsFile({ relationsFileId, recommendationFileId }: {
        relationsFileId: string;
        recommendationFileId: string;
    }): Promise<any>;
    createRelationsFile({ vcFolderId }: {
        vcFolderId: string;
    }): Promise<any>;
    /**
     * Delete file by id
     * @param id
     * @returns
     */
    delete(id: string): Promise<any>;
    update(fileId: string, data: any): Promise<any>;
    getFileIdsFromAppDataFolder(): Promise<any>;
    getAllFilesData(): Promise<any>;
}
export {};
