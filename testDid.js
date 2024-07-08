import DIDManager from './dist/utils/didManager.js';

const accessToken =
	'ya29.a0AXooCgszmv2UYG4xZoVeOmiGgcA06jfihR0G9AOXBPTsL71ywyzIUBc95835Y8v7fBtTIT7Tx3Tkl2ZEbkLuCZiWWIhH-igsP24XWO-Gn8OK9AM5ozA60whNymLAregEdjljypqYDAkRkY1jFsKd71FZ93ZGJZNv9_YkaCgYKAQESARISFQHGX2MiFpyr8uf8SfSBqMCfosw-sQ0171';
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
	await didManager.saveToGoogleDrive(signedVC, 'VC');
}

main().catch(console.error);
