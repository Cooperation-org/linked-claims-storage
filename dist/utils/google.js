export const getVCWithRecommendations = async ({ vcId, storage }) => {
    const vcFolderId = await storage.getFileParents(vcId);
    const files = await storage.findFilesUnderFolder(vcFolderId);
    const relationsFile = files.find((f) => f.name === 'RELATIONS');
    const relationsContent = await storage.retrieve(relationsFile.id);
    const relationsData = JSON.parse(relationsContent.data.body);
    const [vcFileId, recommendationIds] = [relationsData.vc_id, relationsData.recommendations || []];
    const vc = await storage.retrieve(vcFileId);
    const recommendations = await Promise.all(recommendationIds.map(async (rec) => {
        const recFile = await storage.retrieve(rec);
        return JSON.parse(recFile.data.body);
    }));
    return { vc: vc, recommendations, relationsFileId: relationsFile.id };
};
/**
 * Save data to Google Drive in the specified folder type.
 * @param {object} data - The data to save.
 * @param {FileType} data.type - The type of data being saved.
 * @returns {Promise<object>} - The file object saved to Google Drive.
 * @param {string} data.vcId - Optional unique identifier for the VC to link the recommendations.
 * @throws Will throw an error if the save operation fails.
 */
export async function saveToGoogleDrive({ storage, data, type }) {
    try {
        const fileData = {
            fileName: type === 'VC' ? 'VC' : `${type}-${Date.now()}`,
            mimeType: 'application/json',
            body: JSON.stringify(data),
        };
        // Get all root folders
        const rootFolders = await storage.findFolders();
        // Find or create the "Credentials" folder
        let credentialsFolder = rootFolders.find((f) => f.name === 'Credentials');
        let credentialsFolderId;
        if (!credentialsFolder) {
            credentialsFolder = await storage.createFolder({ folderName: 'Credentials', parentFolderId: 'root' });
        }
        credentialsFolderId = credentialsFolder.id;
        // Get subfolders within the "Credentials" folder
        const subfolders = await storage.findFolders(credentialsFolderId);
        // Find or create the specific subfolder (DIDs or VCs)
        let typeFolder = subfolders.find((f) => f.name === `${type}s`);
        let typeFolderId;
        if (!typeFolder) {
            typeFolder = await storage.createFolder({ folderName: `${type}s`, parentFolderId: credentialsFolderId });
        }
        typeFolderId = typeFolder.id;
        if (type === 'VC') {
            // save the data in Credentials/VCs/VC-timestamp/vc.json
            const vcFolder = await storage.createFolder({ folderName: `${fileData.fileName}-${Date.now()}`, parentFolderId: typeFolderId });
            const file = await storage.saveFile({ data: fileData, folderId: vcFolder.id });
            return file;
        }
        // Save the file in the specific subfolder
        const file = await storage.saveFile({ data: fileData, folderId: typeFolderId });
        return file;
    }
    catch (error) {
        console.error('Error saving to Google Drive:', error);
        throw error;
    }
}
/**
 * Upload any type of file to Google Drive in the Credentials/MEDIAs folder.
 * @param {GoogleDriveStorage} storage - The GoogleDriveStorage instance.
 * @param {File} file - The file to upload.
 * @param {string} folderName - The name of the folder where the file will be saved (default is 'MEDIAs').
 * @returns {Promise<{ id: string }>} - The uploaded file object.
 * @throws Will throw an error if the upload operation fails.
 */
export async function uploadToGoogleDrive(storage, file, folderName = 'MEDIAs') {
    try {
        const rootFolders = await storage.findFolders();
        let credentialsFolder = rootFolders.find((f) => f.name === 'Credentials');
        if (!credentialsFolder) {
            console.log('Creating Credentials folder...');
            credentialsFolder = await storage.createFolder({ folderName: 'Credentials', parentFolderId: 'root' });
        }
        const credentialsFolderId = credentialsFolder.id;
        const subfolders = await storage.findFolders(credentialsFolder.id);
        let mediasFolder = subfolders.find((f) => f.name === 'MEDIAs');
        if (!mediasFolder) {
            mediasFolder = await storage.createFolder({ folderName: 'MEDIAs', parentFolderId: credentialsFolderId });
        }
        const mediasFolderId = mediasFolder.id;
        // Prepare the image file data
        const fileMetaData = {
            fileName: file.name,
            mimeType: file.type,
            body: file,
        };
        // SaveFile the image in the "MEDIAs" folder
        const uploadedImage = await storage.saveFile({
            data: fileMetaData,
            folderId: mediasFolderId,
        });
        return uploadedImage;
    }
    catch (error) {
        console.error('Error uploading image to Google Drive:', error);
        throw error;
    }
}
export function generateViewLink(fileId) {
    if (!fileId) {
        throw new Error('File ID is required to generate a view link.');
    }
    // Construct the view URL based on the file ID
    return `https://drive.google.com/file/d/${fileId}/view`;
}
export function extractGoogleDriveFileId(url) {
    const regex = /\/d\/([a-zA-Z0-9_-]+)\//;
    const match = url.match(regex);
    if (match && match[1]) {
        return match[1]; // Return the file ID
    }
    else {
        console.error('Invalid Google Drive URL: File ID not found.');
        return null;
    }
}
