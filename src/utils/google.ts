import { GoogleDriveStorage } from '../models/GoogleDriveStorage.js';

/**
 * keyFile name  = {uuid}-type-timestamp // we need that
 * vc.id = urn-uuid-{uuid} // we got that
 * Save data to Google Drive in the specified folder type.
 * @param {object} data - The data to save.
 * @param {'VC' | 'DID' | 'SESSION' | 'RECOMMENDATION' | 'KEYPAIR'} type - The type of data being saved.
 * @returns {Promise<object>} - The file object saved to Google Drive.
 * @param {string} uuid - Optional unique identifier for the VC.
 * @throws Will throw an error if the save operation fails.
 */
export async function saveToGoogleDrive(
	storage: GoogleDriveStorage,
	data: any,
	type: 'VC' | 'DID' | 'SESSION' | 'RECOMMENDATION' | 'KEYPAIR',
	uuid?: string
): Promise<object> {
	try {
		const timestamp = Date.now();
		const fileData = {
			fileName: `${uuid ? uuid + '_' : ''}${type}_${timestamp}.json`,
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
			console.log('Created Credentials folder with ID:', credentialsFolderId);
		} else {
			credentialsFolderId = credentialsFolder.id;
			console.log('Found Credentials folder with ID:', credentialsFolderId);
		}

		// Get subfolders within the "Credentials" folder
		const subfolders = await storage.findFolders(credentialsFolderId);
		console.log(`Subfolders in Credentials (ID: ${credentialsFolderId}):`, subfolders);

		// Find or create the specific subfolder (DIDs or VCs)
		let typeFolder = subfolders.find((f: any) => f.name === `${type}s`);
		let typeFolderId: string;

		if (!typeFolder) {
			typeFolderId = await storage.createFolder(`${type}s`, credentialsFolderId);
			console.log(`Created ${type}s folder with ID:`, typeFolderId);
		} else {
			typeFolderId = typeFolder.id;
			console.log(`Found ${type} files:`, await storage.findLastFile(typeFolderId));
			console.log(`Found ${type}s folder with ID:`, typeFolderId);
		}

		// Save the file in the specific subfolder
		const file = await storage.save(fileData, typeFolderId);
		console.log(`File uploaded: ${file?.id} under ${type}s with ID ${typeFolderId} folder in Credentials folder`);

		if (file && file.id) {
			console.log('Sharing file with second user...');
			await storage.addCommenterRoleToFile(file.id);
		}

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

		// Save the image in the "MEDIAs" folder
		const uploadedImage = await storage.save(imageData, mediasFolderId);
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
