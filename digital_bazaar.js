import { CredentialEngine, GoogleDriveStorage } from './dist/index.js';

const accessToken =
	'ya29.a0AcM612xk6nktzw5NFtHxjwgP8IgA1dnYKYyfW8iaeDLQSkePNxqCOtaeJmSH2UT_MEN924lpuR7VChkmyeFg19WbxQb5xclRkB9aTVRlkZAbYAsK2afZHhKtr4URqB1UhAf6T9Ufo8ULv8M8kXp_Osc6a_NbT1yps1GzWFakaCgYKAQUSARESFQHGX2Miy2GJ3RXRAt_HdbMzgOwaCA0175';

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
	// await saveToGoogleDrive(
	// 	storage,
	// 	{
	// 		body: JSON.stringify({ name: 'John Doe' }),
	// 	},
	// 	'SESSION'
	// );

	// Step 1: Create DID
	const { didDocument, keyPair } = await credentialEngine.createDID();
	console.log('🚀 ~ main ~ didDocument:', didDocument);
	console.log('--------------------------------');
	console.log('KeyPair:', keyPair);
	// await saveToGoogleDrive(
	// 	storage,
	// 	{
	// 		...didDocument,
	// 		keyPair: { ...keyPair },
	// 	},
	// 	'DID'
	// );

	// Step 3: Sign VC
	try {
		const signedVC = await credentialEngine.signVC(formData, 'VC', keyPair, didDocument.id);
		// const signedRecommendationVC = await credentialEngine.signVC(RecommendtaionformData, 'RECOMMENDATION', keyPair, didDocument.id);
		console.log('🚀 ~ main ~ signedVC:', signedVC);
		// const file = await saveToGoogleDrive(storage, signedVC, 'VC');
		// console.log('🚀 ~ main ~ file:', file);
		// const storage1 = new GoogleDriveStorage(
		// 	'ya29.a0AcM612x1m1-Oto44HIN5fOCiBHOipCS7NBuXsGvEj-EVHygZpccmmd307OjQl_-O6jbLgbebyraXkrYmF4MU9JlgmxUCgLL9BgsAgGCke1O5lFdcgqQQCWuAC8m9YOOhqhycHIPBbYNcqHn686SFDiONAHdk2r25yXsTJ8NlaCgYKAbESARISFQHGX2Mi93l2piQhJPARp2L8BjGx2w0175'
		// );
		// const savedRecommendation = await saveToGoogleDrive(storage1, signedRecommendationVC, 'RECOMMENDATION');
		// console.log('🚀 ~ main ~ savedRecommendation:', savedRecommendation);
		// const recommendation = await storage1.addCommentToFile(file.id, 'Test Comment');
		// console.log('Recommendation:', recommendation);
		// console.log('Signed VC:', signedVC);
		await credentialEngine.verifyCredential(signedVC);
	} catch (error) {
		console.error('Error during VC signing:', error);
	}
}

main().catch(console.error);
