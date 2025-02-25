import { GoogleDriveStorage } from '../models/GoogleDriveStorage.js';
export type FileType = 'VC' | 'DID' | 'SESSION' | 'RECOMMENDATION' | 'KEYPAIR';
interface SaveToGooglePropsI {
    storage: GoogleDriveStorage;
    data: any;
    type: FileType;
    vcId?: string;
}
export declare const getVCWithRecommendations: ({ vcId, storage }: {
    vcId: string;
    storage: GoogleDriveStorage;
}) => Promise<{
    vc: {
        data: any;
        id: string;
    };
    recommendationIds: any;
    relationsFileId: any;
}>;
/**
 * Save data to Google Drive in the specified folder type.
 * @param {object} data - The data to save.
 * @param {FileType} data.type - The type of data being saved.
 * @returns {Promise<object>} - The file object saved to Google Drive.
 * @param {string} data.vcId - Optional unique identifier for the VC to link the recommendations.
 * @throws Will throw an error if the save operation fails.
 */
export declare function saveToGoogleDrive({ storage, data, type }: SaveToGooglePropsI): Promise<any>;
/**
 * Upload any type of file to Google Drive in the Credentials/MEDIAs folder.
 * @param {GoogleDriveStorage} storage - The GoogleDriveStorage instance.
 * @param {File} file - The file to upload.
 * @param {string} folderName - The name of the folder where the file will be saved (default is 'MEDIAs').
 * @returns {Promise<{ id: string }>} - The uploaded file object.
 * @throws Will throw an error if the upload operation fails.
 */
export declare function uploadToGoogleDrive(storage: GoogleDriveStorage, file: File, folderName?: string): Promise<{
    id: string;
}>;
export declare function generateViewLink(fileId: string): string;
export declare function extractGoogleDriveFileId(url: string): string | null;
export {};
