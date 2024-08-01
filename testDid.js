import { saveToGoogleDrive, CredentialEngine, StorageContext, StorageFactory } from './dist/index.js';

const accessToken =
	'ya29.a0AXooCgtdfXwqIaRkcCT2i-G8N9pXkTfgQ9pwj7SKJS0XsmIYqgSbv4ENQn3OnJ3vhFW-VCgacVEkCuK9HJbMTBjCvC9qFN8js2OkawNhtXxoIiQz8vuV_IRq2tl8sHODj23NHgozdjCWGkTpcf25AkRwYg6GvBxP6z3JaCgYKAY4SARISFQHGX2Mi1n440yKsoTFTP9fkAW-6XA0171';
const credentialEngine = new CredentialEngine(accessToken);

const storage = new StorageContext(StorageFactory.getStorageStrategy('googleDrive', { accessToken }));
async function main() {
	const formData = {
		credentialName: 'Teamwork Achievement Badge',
		fullName: 'Alice Smith',
		postalCode: '44125',
		criteriaNarrative: 'Team members are nominated for this badge by their peers and recognized upon review by Example Corp management.',
		achievementDescription: 'This badge recognizes the development of the capacity to collaborate within a group environment.',
		achievementName: 'Teamwork Achievement',
		issuanceDate: '2024-07-31T17:42:19Z', // Use a valid ISO 8601 date string
		expirationDate: '2025-01-01T00:00:00Z',
	};

	// sessions
	await saveToGoogleDrive(storage, formData, 'SESSIONS');

	// Step 1: Create DID
	const { didDocument, keyPair } = await credentialEngine.createDID();
	await saveToGoogleDrive(storage, didDocument, 'DID');

	const issuerDid = didDocument.id;

	// Step 2: Create Unsigned VC
	const unsignedVC = await credentialEngine.createUnsignedVC(formData, issuerDid);
	await saveToGoogleDrive(storage, unsignedVC, 'UnsignedVC');
	console.log('Unsigned VC:', unsignedVC);

	// Step 3: Sign VC
	try {
		const signedVC = await credentialEngine.signVC(unsignedVC, keyPair);
		await saveToGoogleDrive(storage, signedVC, 'VC');
		console.log('Signed VC:', signedVC);
	} catch (error) {
		console.error('Error during VC signing:', error);
	}
}

main().catch(console.error);
