/**
 * Save data to Google Drive in the specified folder type.
 * @param {object} data - The data to save.
 * @param {'VC' | 'DID' | 'UnsignedVC'} type - The type of data being saved.
 * @throws Will throw an error if the save operation fails.
 */

export async function saveToGoogleDrive(storage: any, data: any, type: 'VC' | 'DID' | 'UnsignedVC' | 'SESSION') {
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

		// Save the file in the specific subfolder
		const file = await storage.save(fileData, typeFolderId);
		console.log(`File uploaded: ${file?.id} under ${type}s with ID ${typeFolderId} folder in Credentials folder`);
		return file;
	} catch (error) {
		console.error('Error saving to Google Drive:', error);
		throw error;
	}
}
