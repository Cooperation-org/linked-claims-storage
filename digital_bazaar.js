import { CredentialEngine, GoogleDriveStorage } from './dist/index.js';
import { generateViewLink, saveToGoogleDrive } from './dist/utils/google.js';
import { getVP } from './dist/utils/presentation.js';

const accessToken =
	'ya29.a0AcM612x-ANAiuIgc30VJDtoH8tww2oEm0aAWYZY-Mr5w741AYj7VDgOJlSAAZmzXSEIisgeiiJieKCqbNejZLqjrngetQAFTmI4AoL0ym5tnsthhN9skCgg5zLVu2hyqh3UBSdBKluX7YRFgAsQSHfOU4KXGRqxmmLwXQj-daCgYKAQASARESFQHGX2Mi273sKEE-Nuj6Mmy8WA54Ag0175'; // e7na

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
	// const { didDocument, keyPair } = await credentialEngine.createDID();
	// console.log('🚀 ~ main ~ didDocument:', didDocument);
	// console.log('--------------------------------');
	// console.log('KeyPair:', keyPair);
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
		// const signedVC = await credentialEngine.signVC(formData, 'VC', keyPair, didDocument.id);
		// const signedRecommendationVC = await credentialEngine.signVC(RecommendtaionformData, 'RECOMMENDATION', keyPair, didDocument.id);
		// // console.log('🚀 ~ main ~ signedVC:', signedVC);
		// const file = await saveToGoogleDrive(storage, signedVC, 'VC');
		// console.log('🚀 ~ main ~ file:', file);
		// const storage1 = new GoogleDriveStorage(
		// 	'ya29.a0AcM612zjI-ggoE-cFyDcplD-kBLS5zKh2Te21P0ch7T0Ls2mw7mCHffxMzCkHm3tsPeQHcKrPJOX8McSIxq9UL5tPqEWk8dUx0fMgte9zQ9nBsoG-j78VFQgI4QXs4DHDLlQ-livD9M1EfYIZi3sTq0EeXQ-tE6mOKQjz41JaCgYKAakSARESFQHGX2MiApRnXaObiLlKMS7eZt8H1g0175'
		// );
		// const savedRecommendation = await saveToGoogleDrive(storage1, signedRecommendationVC, 'RECOMMENDATION');
		// console.log('🚀 ~ main ~ savedRecommendation:', savedRecommendation);
		// const recommendation = await storage1.addCommentToFile(file.id, savedRecommendation.id);
		// console.log('Recommendation:', recommendation);
		// console.log('Signed VC:', signedVC);
		// await credentialEngine.verifyCredential(signedVC);
		// const vcs = await storage.getAllVCs();
		const presentation = await getVP(accessToken, '1RGgak9pbgrmMpqDBvDZRho3y2_NkUssD');
		console.log('��� ~ main ~ presentation:', presentation);
		// console.log('🚀 ~ main ~ vcs:', vcs);
	} catch (error) {
		console.error('Error during VC signing:', error);
	}
}

main().catch(console.error);
const nn = {
	'@context': [
		'https://www.w3.org/2018/credentials/v1',
		'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
		{
			howKnow: 'https://schema.org/howKnow',
			recommendationText: 'https://schema.org/recommendationText',
			qualifications: 'https://schema.org/qualifications',
			explainAnswer: 'https://schema.org/explainAnswer',
			portfolio: 'https://schema.org/portfolio',
		},
		'https://w3id.org/security/suites/ed25519-2020/v1',
	],
	id: 'urn:uuid:f10892ac-287d-43b8-aeba-f45984faf810',
	type: ['VerifiableCredential', 'https://schema.org/RecommendationCredential'],
	issuer: { id: 'did:key:z6Mksca3iFio7C1qNyD9auSFpe6sWXqqnJbkzyK2EGMVZavt', type: ['Profile'] },
	issuanceDate: '2024-09-30T18:22:52.929Z',
	expirationDate: '2025-09-18T00:00:00Z',
	credentialSubject: {
		name: 'John Doe',
		howKnow: 'Worked together at XYZ Company',
		recommendationText: 'John consistently delivered high-quality work on time.',
		qualifications: "Master's in Computer Science",
		explainAnswer: 'John has strong analytical and problem-solving skills, which he demonstrated in complex projects.',
		portfolio: [
			{ name: 'Project A', url: 'https://example.com/project-a' },
			{ name: 'Project B', url: 'https://example.com/project-b' },
		],
	},
	proof: {
		type: 'Ed25519Signature2020',
		created: '2024-09-30T18:22:52Z',
		verificationMethod: 'did:key:z6Mksca3iFio7C1qNyD9auSFpe6sWXqqnJbkzyK2EGMVZavt#z6Mksca3iFio7C1qNyD9auSFpe6sWXqqnJbkzyK2EGMVZavt',
		proofPurpose: 'assertionMethod',
		proofValue: 'z4stXgzprWhhqikxyEq7QFYA4wM1T6zxDnEL6Kw7iiAdPuhuFcWPnKfGyactpJoWw6mYpmnjCyi7v1xperpWBWdLe',
	},
};
