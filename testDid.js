import DIDManager from './dist/utils/didManager.js';

const accessToken = 'ADD_YOUR_ACCESS_TOKEN';
const didManager = new DIDManager(accessToken);

async function main() {
	const formData = {
		storageOption: 'Device',
		fullName: 'Jane Doe',
		persons: 'Business',
		credentialName: 'fasdfaadfs',
		credentialDuration: 'asdfasdf',
		credentialDescription: '',
		evidence: [
			{ name: 'adfsf', url: 'asdf' },
			{ name: 'asdfasd', url: 'asdfs' },
			{ name: 'asdf', url: 'asdf' },
		],
		imageLink: 'asdfasfas',
		description: 'asdfasd',
	};

	// Step 1: Create DID
	const { didDocument, keyPair } = await didManager.createDID();
	const issuerDid = didDocument.id;
	console.log('Issuer DID:', issuerDid);

	// If necessary, you can uncomment these steps for further testing
	// Step 2: Create Unsigned VC
	const unsignedVC = didManager.createUnsignedVC(formData, issuerDid);
	// await didManager.saveToGoogleDrive(unsignedVC, 'VC', 'unsigned');
	console.log('Unsigned VC:', unsignedVC);

	// Step 3: Sign VC
	const signedVC = await didManager.signVC(unsignedVC, keyPair);
	console.log('Signed VC:', signedVC);

	// Step 4: Save Signed VC to Google Drive
	// await didManager.saveToGoogleDrive(unsignedVC, 'VC', 'signed');
}

main().catch(console.error);
