import { saveToGoogleDrive, CredentialEngine, GoogleDriveStorage } from './dist/index.js';

const accessToken =
	'ya29.a0AcM612y6MoxH2QIrNqXiymDVpVSwB_z0gMZ5YPXK4ycnefpDEYDoj61fibPxPXifm54yRxEZIY_eiD-Bi6MNXY8Y_kz8_T9ZQpCZnyo9ZwmdgZUTyXaR6v2JvicqJ7aTqsQFoz63M6PPTlf4kkBAW5BElxUUf3qAyBl8ZIS8aCgYKAbgSARISFQHGX2Mift_h6ZXqS4sm31wCGrrXhQ0175';
const credentialEngine = new CredentialEngine(accessToken);

const storage = new GoogleDriveStorage(accessToken);
async function main() {
	const formData = {
		expirationDate: '2025-12-31T23:59:59Z',
		fullName: 'John Doe',
		duration: '1 year',
		criteriaNarrative: 'This is a narrative',
		achievementDescription: 'This is an achievement',
		achievementName: 'Achievement Name',
		portfolio: [
			{
				name: 'Portfolio 1',
				url: 'https://example.com/portfolio1',
			},
			{
				name: 'Portfolio 2',
				url: 'https://example.com/portfolio2',
			},
		],
		evidenceLink: 'https://example.com/evidence',
		evidenceDescription: 'This is an evidence description',
		credentialType: 'Credential Type',
	};

	// Sessions are used to store the user's data when hit save&exit
	// await saveToGoogleDrive(storage, formData, 'SESSION');

	// Step 1: Create DID
	const { didDocument, keyPair } = await credentialEngine.createDID();
	await saveToGoogleDrive(
		storage,
		{
			...didDocument,
			keyPair: { ...keyPair },
		},
		'DID'
	);

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
	const claims = await storage.getAllClaims();
	// const sessions = await storage.getAllSessions();
	// console.log('🚀 ~ claims:', claims);
	// const claim = await storage.retrieve(crede)
	// console.log('claim', claim);
}

main().catch(console.error);
