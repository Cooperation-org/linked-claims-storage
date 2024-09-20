import { saveToGoogleDrive, CredentialEngine, GoogleDriveStorage } from './dist/index.js';

const accessToken =
	'ya29.a0AcM612y0TVtdfllutLZWh2vUg3J7fzn-ZyPznfTCR7UoZ6ntsWC0Qhi64fFB90N6fnaq-LMsqoYYmejamzdBBQmP4ocDj43FDTY86SblQqeTHGpuhd9pOCatkMd_o4Xu2_5dwibJ_Zs9epTxg7-z5kOOEsR4zw10hc_7MN4VaCgYKAWoSARESFQHGX2Mi47-A-au_8486rukOcGBydA0175';
const credentialEngine = new CredentialEngine();

const storage = new GoogleDriveStorage(accessToken);
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
const RecommendtaionformData = {
	expirationDate: '2025-09-18T00:00:00Z',
	fullName: 'John Doe',
	howKnow: 'Worked together at XYZ Company',
	recommendationText: 'John consistently delivered high-quality work on time.',
	portfolio: [
		{
			name: 'Project A',
			url: 'https://example.com/project-a',
		},
		{
			name: 'Project B',
			url: 'https://example.com/project-b',
		},
	],
	qualifications: "Master's in Computer Science",
	explainAnswer: 'John has strong analytical and problem-solving skills, which he demonstrated in complex projects.',
};

async function main() {
	// Sessions are used to store the user's data when hit save&exit
	await saveToGoogleDrive(storage, formData, 'SESSION');

	// Step 1: Create DID
	const { didDocument, keyPair } = await credentialEngine.createDID();
	// await saveToGoogleDrive(
	// 	storage,
	// 	{
	// 		...didDocument,
	// 		keyPair: { ...keyPair },
	// 	},
	// 	'DID'
	// );

	const issuerDid = didDocument.id;

	// Step 2: Create Unsigned VC
	const unsignedVC = await credentialEngine.createUnsignedVC(formData, issuerDid);
	const unsignedRecommendationVC = credentialEngine.createUnsignedRecommendation(RecommendtaionformData, issuerDid);
	// await saveToGoogleDrive(storage, unsignedVC, 'UnsignedVC');
	console.log('Unsigned VC:', unsignedVC);

	// Step 3: Sign VC
	try {
		const signedVC = await credentialEngine.signVC(unsignedVC, keyPair);
		const signedRecommendationVC = await credentialEngine.signVC(unsignedRecommendationVC, keyPair);
		const file = await saveToGoogleDrive(storage, signedVC, 'VC');
		const recommendation = await storage.saveRecommendtaion(file.id, signedRecommendationVC);
		console.log('Recommendation:', recommendation);
		console.log('Signed VC:', signedVC);
	} catch (error) {
		console.error('Error during VC signing:', error);
	}
	// const claims = await storage.getAllClaims();
	// const sessions = await storage.getAllSessions();
	// console.log('🚀 ~ claims:', claims);
	// const claim = await storage.retrieve(crede)
	// console.log('claim', claim);
}

main().catch(console.error);
