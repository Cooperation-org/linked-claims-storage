import { saveToGoogleDrive, CredentialEngine, StorageContext, StorageFactory } from './dist/index.js';

const accessToken =
	'ya29.a0AcM612ygFczLbG6uFbOxrwNsR7mJYyoXUhdlugzUXRlSFch0m3l_UDAnhGjaGErslbOeDLmi6xUWJ3mx8jfdx-5wrLfwN_Xlqt2TlZ2RLqR-JBO_OGnwsUEZR6gXQwy-dsJGW6ZM59CQQ8fiWPNMtYl--g8Wx6sUL1wGaCgYKAXwSARISFQHGX2MiX0alRCDoFTx1Ho3TWEigMg0171';
const credentialEngine = new CredentialEngine(accessToken);

const storage = new StorageContext(StorageFactory.getStorageStrategy('googleDrive', { accessToken }));
async function main() {
	const formData = {
		fullName: 'Alice Smith',
		criteriaNarrative: 'Team members are nominated for this badge by their peers and recognized upon review by Example Corp management.',
		achievementDescription: 'This badge recognizes the development of the capacity to collaborate within a group environment.',
		achievementName: 'Teamwork Achievement',
		expirationDate: '2025-01-01T00:00:00Z', // Use a valid ISO 8601 date string
	};

	// Sessions are used to store the user's data when hit save&exit
	// await saveToGoogleDrive(storage, formData, 'SESSION');

	// Step 1: Create DID
	// const { didDocument, keyPair } = await credentialEngine.createDID();
	// await saveToGoogleDrive(
	// 	storage,
	// 	{
	// 		...didDocument,
	// 		keyPair: { ...keyPair },
	// 	},
	// 	'DID'
	// );

	// const issuerDid = didDocument.id;

	// // Step 2: Create Unsigned VC
	// const unsignedVC = await credentialEngine.createUnsignedVC(formData, issuerDid);
	// await saveToGoogleDrive(storage, unsignedVC, 'UnsignedVC');
	// console.log('Unsigned VC:', unsignedVC);

	// // Step 3: Sign VC
	// try {
	// 	const signedVC = await credentialEngine.signVC(unsignedVC, keyPair);
	// 	await saveToGoogleDrive(storage, signedVC, 'VC');
	// 	console.log('Signed VC:', signedVC);
	// } catch (error) {
	// 	console.error('Error during VC signing:', error);
	// }
	const claims = await storage.getAllClaims();
	// const sessions = await storage.getAllSessions();
	console.log('🚀 ~ claims:', claims);
	const claim = await storage.getFileContent('16Nl0dmo2E20Ika1ft_bfzY0tBE6gwrk2');
	console.log('claim', claim);
}

main().catch(console.error);
