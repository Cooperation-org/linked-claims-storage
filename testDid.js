import { GoogleDriveStorage } from './dist/index.js';
import DIDManager from './dist/utils/didManager.js';

const accessToken =
	'ya29.a0AXooCgsEs_uLWBlCyz_H8Eeulvw9PE9KztYL82_DTlm-TfD86nZDoOmmAuewpYFPjcrWv3JhyiVNDxzGksixIMnmFmfJKR4XMMrekAePdocxtGQvfn9bk2TyMNJzcYn96uz9rKM2g3K77z2Zzkus5EGJvlKSDMUeenhyaCgYKAS4SARISFQHGX2MiPTFf4LBkyiDZF3p2SGwtkQ0171';
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

	// Step 2: Create Unsigned VC
	const unsignedVC = didManager.createUnsignedVC(formData, issuerDid);
	console.log('Unsigned VC:', unsignedVC);

	// Step 3: Sign VC
	// const signedVC = await didManager.signVC(unsignedVC, keyPair);
	// console.log('Signed VC:', signedVC);

	// Step 4: Save Signed VC to Google Drive
	await didManager.saveToGoogleDrive(unsignedVC, 'VC');

	// const storage = new GoogleDriveStorage(accessToken);
	// const parentId = await storage.createFolder('parent');
	// const childId = await storage.createFolder('child', parentId);
	// const fileData = {
	// 	fileName: 'TIMESTAMP.json',
	// 	mimeType: 'application/json',
	// 	body: JSON.stringify({ name: 'John Doe' }),
	// };
	// const response = await storage.save(fileData, childId);
}

main().catch(console.error);
