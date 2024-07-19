import CredentialEngine from './dist/models/CredentialEngine.js';
import { StorageContext, StorageFactory } from './dist/models/StorageContext.js';

const accessToken = 'ADD_YOUR_ACCESS_TOKEN';
const credentialEngine = new CredentialEngine(accessToken);

async function main() {
	const formData = {
		credentialName: 'Teamwork Achievement Badge',
		fullName: 'Alice Smith',
		postalCode: '44125',
		criteriaNarrative: 'Team members are nominated for this badge by their peers and recognized upon review by Example Corp management.',
		achievementDescription: 'This badge recognizes the development of the capacity to collaborate within a group environment.',
		achievementName: 'Teamwork Achievement',
	};

	// Step 1: Create DID
	const { didDocument, keyPair } = await credentialEngine.createDID();

	const issuerDid = didDocument.id;

	// Step 2: Create Unsigned VC
	const unsignedVC = await credentialEngine.createUnsignedVC(formData, issuerDid);
	console.log('Unsigned VC:', unsignedVC);

	// Step 3: Sign VC
	try {
		const signedVC = await credentialEngine.signVC(unsignedVC, keyPair);
		console.log('Signed VC:', signedVC);
	} catch (error) {
		console.error('Error during VC signing:', error);
	}
}

main().catch(console.error);
