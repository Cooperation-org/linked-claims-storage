/**
 * Save data to Google Drive in the specified folder type.
 * @param {object} data - The data to save.
 * @param {'VC' | 'DID' | 'UnsignedVC'} type - The type of data being saved.
 * @throws Will throw an error if the save operation fails.
 */

import { GoogleDriveStorage } from '../models/GoogleDriveStorage';

export async function saveToGoogleDrive(
	storage: GoogleDriveStorage,
	data: any,
	type: 'VC' | 'DID' | 'UnsignedVC' | 'SESSION' | 'IMAGES',
	imageFileInput, // Rename the parameter to avoid conflict
	fileName: string
) {
	try {
		const timestamp = Date.now();
		const fileData = {
			fileName: `${type}-${timestamp}.json`,
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

		// Save the data file in the specific subfolder
		const dataFile = await storage.save(fileData, typeFolderId);
		console.log(`File uploaded: ${dataFile?.id} under ${type}s with ID ${typeFolderId} folder in Credentials folder`);

		// Handling image file upload
		let imageFileId = null;
		if (imageFileInput) {
			let imagesFolder = subfolders.find((f: any) => f.name === 'Images');
			let imagesFolderId;

			if (!imagesFolder) {
				imagesFolderId = await storage.createFolder('Images', credentialsFolderId);
				console.log('Created Images folder with ID:', imagesFolderId);
			} else {
				imagesFolderId = imagesFolder.id;
				console.log('Found Images folder with ID:', imagesFolderId);
			}

			// Prepare the image file data
			const imageFileData = {
				fileName: fileName || `Image-${Date.now()}`,
				mimeType: imageFileInput.type,
				body: imageFileInput,
			};

			// Save the image file in the Images folder
			const imageFile = await storage.save(imageFileData, imagesFolderId);
			imageFileId = imageFile.id;
			console.log(`Image file uploaded: ${imageFileId} under Images folder`);
		}

		return {
			dataFileId: dataFile.id,
			imageFileId: imageFileId,
		};
	} catch (error) {
		console.error('Error saving to Google Drive:', error);
		throw error;
	}
}
