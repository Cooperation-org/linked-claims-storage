import { GoogleDriveStorage } from '../models/GoogleDriveStorage.js';

export type FileType = 'VC' | 'DID' | 'SESSION' | 'RECOMMENDATION' | 'KEYPAIR';

interface SaveToGooglePropsI {
	storage: GoogleDriveStorage;
	data: any;
	type: FileType;
	vcId?: string;
}
export const getVCWithRecommendations = async ({ vcId, storage }: { vcId: string; storage: GoogleDriveStorage }) => {
	const vcFolderId = await storage.getFileParents(vcId);
	const files = await storage.findFilesUnderFolder(vcFolderId);
	const relationsFile = files.find((f: any) => f.name === 'RELATIONS');

	const relationsContent = await storage.retrieve(relationsFile.id);
	const relationsData = relationsContent.data;

	const [vcFileId, recommendationIds] = [relationsData.vc_id, relationsData.recommendations];
	const vc = await storage.retrieve(vcFileId);

	const recommendations = await Promise.all(
		recommendationIds.map(async (rec: any) => {
			const recFile = await storage.retrieve(rec);
			return recFile;
		})
	);

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
export async function saveToGoogleDrive({ storage, data, type }: SaveToGooglePropsI): Promise<any> {
	try {
		const fileData = {
			fileName: type === 'VC' ? 'VC' : `${type}-${Date.now()}`,
			mimeType: 'application/json',
			body: JSON.stringify(data),
		};

		// Get all root folders
		const rootFolders = await storage.findFolders();
		console.log('Root folders:', rootFolders);

		// Find or create the "Credentials" folder
		let credentialsFolder = rootFolders.find((f: any) => f.name === 'Credentials');
		let credentialsFolderId: string;

		if (!credentialsFolder) {
			credentialsFolderId = await storage.createFolder('Credentials');
		} else {
			credentialsFolderId = credentialsFolder.id;
		}

		// Get subfolders within the "Credentials" folder
		const subfolders = await storage.findFolders(credentialsFolderId);

		// Find or create the specific subfolder (DIDs or VCs)
		let typeFolder = subfolders.find((f: any) => f.name === `${type}s`);
		let typeFolderId: string;

		if (!typeFolder) {
			typeFolderId = await storage.createFolder(`${type}s`, credentialsFolderId);
		} else {
			typeFolderId = typeFolder.id;
		}

		if (type === 'VC') {
			// save the data in Credentials/VCs/VC-timestamp/vc.json
			const vcFolderId = await storage.createFolder(`${fileData.fileName}-${Date.now()}`, typeFolderId);
			const file = await storage.saveFile({ data: fileData, folderId: vcFolderId });
			console.log(`File uploaded: ${file?.id} under ${fileData.fileName} folder in VCs folder`);
			return file;
		}

		// Save the file in the specific subfolder
		const file = await storage.saveFile({ data: fileData, folderId: typeFolderId });
		console.log(`File uploaded: ${file?.id} under ${type}s with ID ${typeFolderId} folder in Credentials folder`);

		return file;
	} catch (error) {
		console.error('Error saving to Google Drive:', error);
		throw error;
	}
}

/**
 * Upload an image to Google Drive in the Credentials/MEDIAs folder.
 * @param {GoogleDriveStorage} storage - The GoogleDriveStorage instance.
 * @param {File} imageFile - The image file to upload.
 * @returns {Promise<>} - The uploaded image file object.
 * @throws Will throw an error if the upload operation fails.
 */
export async function uploadImageToGoogleDrive(
	storage: GoogleDriveStorage,
	imageFile: File
): Promise<{
	id: string;
}> {
	try {
		const rootFolders = await storage.findFolders();

		let credentialsFolder = rootFolders.find((f: any) => f.name === 'Credentials');
		let credentialsFolderId: string;

		if (!credentialsFolder) {
			credentialsFolderId = await storage.createFolder('Credentials');
		} else {
			credentialsFolderId = credentialsFolder.id;
		}

		const subfolders = await storage.findFolders(credentialsFolderId);

		let mediasFolder = subfolders.find((f: any) => f.name === 'MEDIAs');
		let mediasFolderId: string;

		if (!mediasFolder) {
			mediasFolderId = await storage.createFolder('MEDIAs', credentialsFolderId);
		} else {
			mediasFolderId = mediasFolder.id;
		}

		// Prepare the image file data
		const imageData = {
			fileName: imageFile.name,
			mimeType: imageFile.type,
			body: imageFile,
		};

		// SaveFile the image in the "MEDIAs" folder
		const uploadedImage = await storage.saveFile({
			data: imageData,
			folderId: mediasFolderId,
		});
		console.log(`Image uploaded: ${uploadedImage?.id} to MEDIAs folder in Credentials`);

		return uploadedImage;
	} catch (error) {
		console.error('Error uploading image to Google Drive:', error);
		throw error;
	}
}

export function generateViewLink(fileId: string): string {
	if (!fileId) {
		throw new Error('File ID is required to generate a view link.');
	}

	// Construct the view URL based on the file ID
	return `https://drive.google.com/file/d/${fileId}/view`;
}

export function extractGoogleDriveFileId(url: string): string | null {
	const regex = /\/d\/([a-zA-Z0-9_-]+)\//;
	const match = url.match(regex);

	if (match && match[1]) {
		return match[1]; // Return the file ID
	} else {
		console.error('Invalid Google Drive URL: File ID not found.');
		return null;
	}
}
