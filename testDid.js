import DIDManager from './dist/utils/didManager.js';
import { StorageContext, StorageFactory } from './dist/models/StorageContext.js';

const accessToken =
	'ya29.a0AXooCgu0Lm6t9o1dVJqyaX9a9pp92AcCGcGb670MkcjQRqX2TobE_fgaSYB6J50YeHA75BhsR-mwTiHQff1ZnXl_Wgev1fpFIl_F74ljQAanVh7FZaZ3ZwPsTZRRrWWmGgkH9WumMynzzOOLPop48JaP4ycvQY0_ukK5aCgYKAVcSARISFQHGX2MiJqOFEZji96wSOHIUto821w0171';
const didManager = new DIDManager(accessToken);
const storage = new StorageContext(StorageFactory.getStorageStrategy('googleDrive', { accessToken }));

const addToGoogle = async (data, type) => {
	const timestamp = Date.now();
	const fileData = {
		fileName: `${type}-${timestamp}.json`,
		mimeType: 'application/json',
		body: JSON.stringify(data),
	};

	try {
		// Get all root folders
		const rootFolders = await storage.getRootFolders();
		console.log('Root folders:', rootFolders);

		// Find or create the "Credentials" folder
		let credentialsFolder = rootFolders.find((f) => f.name === 'Credentials');
		let credentialsFolderId;

		if (!credentialsFolder) {
			credentialsFolderId = await storage.createFolder('Credentials');
			console.log('Created Credentials folder with ID:', credentialsFolderId);
		} else {
			credentialsFolderId = credentialsFolder.id;
			console.log('Found Credentials folder with ID:', credentialsFolderId);
		}

		// Ensure "Credentials" folder ID is correct
		if (!credentialsFolderId) {
			throw new Error('Credentials folder ID is not defined.');
		}

		// Get subfolders within the "Credentials" folder
		const subfolders = await storage.getSubFolders(credentialsFolderId);
		console.log(`Subfolders in Credentials (ID: ${credentialsFolderId}):`, subfolders);

		// Find or create the specific subfolder (DIDs or VCs)
		let typeFolder = subfolders.find((f) => f.name === `${type}s`);
		let typeFolderId;

		if (!typeFolder) {
			typeFolderId = await storage.createFolder(`${type}s`, credentialsFolderId);
			console.log(`Created ${type}s folder with ID:`, typeFolderId);
		} else {
			typeFolderId = typeFolder.id;
			console.log(`Found ${type}s folder with ID:`, typeFolderId);
		}

		// Ensure "type" folder ID is correct
		if (!typeFolderId) {
			throw new Error(`${type}s folder ID is not defined.`);
		}

		// Save the file in the specific subfolder
		const file = await storage.save(fileData, typeFolderId);
		console.log(`File uploaded: ${file?.id} under ${type}s with ID ${typeFolderId} folder in Credentials folder`);
	} catch (error) {
		console.error('Error saving to Google Drive:', error);
	}
};

async function main() {
	const formData = {
		awardedDate: '2024-01-01T00:00:00Z',
		credentialName: 'Teamwork Achievement Badge',
		fullName: 'Alice Smith',
		addressCountry: 'USA',
		addressRegion: 'Ohio',
		addressLocality: 'Cleveland',
		streetAddress: '123 Any St.\nApartment #2',
		postalCode: '44125',
		criteriaNarrative: 'Team members are nominated for this badge by their peers and recognized upon review by Example Corp management.',
		achievementDescription: 'This badge recognizes the development of the capacity to collaborate within a group environment.',
		achievementName: 'Teamwork Achievement',
		imageLink: 'https://w3c-ccg.github.io/vc-ed/plugfest-3-2023/images/JFF-VC-EDU-PLUGFEST3-badge-image.png',
	};

	// Step 1: Create DID
	const { didDocument, keyPair } = await didManager.createDID();
	await addToGoogle(didDocument, 'DID');
	const issuerDid = didDocument.id;
	console.log('Issuer DID:', issuerDid);

	// Step 2: Create Unsigned VC
	const unsignedVC = didManager.createUnsignedVC(formData, issuerDid);
	console.log('Unsigned VC:', unsignedVC);

	// Step 3: Sign VC
	try {
		const signedVC = await didManager.signVC(unsignedVC, keyPair);
		await addToGoogle(signedVC, 'VC');
		console.log('Signed VC:', signedVC);
	} catch (error) {
		console.error('Error during VC signing:', error);
	}
}

main().catch(console.error);
