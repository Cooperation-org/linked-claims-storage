import { createAndSignVerifiablePresentation, CredentialEngine, GoogleDriveStorage, saveToGoogleDrive } from '@cooperation/vc-storage';

const accessToken = 'FIRST_ACCESS_TOKEN';
const credentialEngine = new CredentialEngine(accessToken);

const storage = new GoogleDriveStorage(accessToken);
const formData = {
	expirationDate: '2025-12-31T23:59:59Z',
	fullName: 'John Doe',
	duration: '1 year',
	criteriaNarrative: 'This is a narrative',
	achievementDescription: 'This is an achievement',
	achi6evementName: 'Achievement Name',
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
	// Step 1: Create DID
	const { didDocument, keyPair } = await credentialEngine.createDID();
	console.log('🚀 ~ main ~ didDocument:', didDocument);
	console.log('--------------------------------');
	console.log('KeyPair:', keyPair);
	await saveToGoogleDrive(
		storage,
		{
			...didDocument,
			keyPair: { ...keyPair },
		},
		'DID'
	);

	// Step 3: Sign VC
	try {
		const signedVC = await credentialEngine.signVC(formData, 'VC', keyPair, didDocument.id);
		const signedRecommendationVC = await credentialEngine.signVC(RecommendtaionformData, 'RECOMMENDATION', keyPair, didDocument.id);
		// // console.log('🚀 ~ main ~ signedVC:', signedVC);
		const file = await saveToGoogleDrive(storage, signedVC, 'VC');
		console.log('🚀 ~ main ~ file:', file);
		const storage1 = new GoogleDriveStorage('SECOND_ACCESS_TOKEN');
		const savedRecommendation = await saveToGoogleDrive(storage1, signedRecommendationVC, 'RECOMMENDATION');
		console.log('🚀 ~ main ~ savedRecommendation:', savedRecommendation);
		const recommendation = await storage1.addCommentToFile(file.id, savedRecommendation.id);
		console.log('Recommendation:', recommendation);
		console.log('Signed VC:', signedVC);
		await credentialEngine.verifyCredential(signedVC);
		const presentation = await createAndSignVerifiablePresentation(accessToken, file.id);
		console.log('��� ~ main ~ presentation:', JSON.stringify(presentation));
	} catch (error) {
		console.error('Error during VC signing:', error);
	}
}

main().catch(console.error);
const presentationSample = {
	signedPresentation: {
		'@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/security/suites/ed25519-2020/v1'],
		type: ['VerifiablePresentation'],
		verifiableCredential: [
			{
				'@context': [
					'https://www.w3.org/2018/credentials/v1',
					'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
					{
						duration: 'https://schema.org/duration',
						fullName: 'https://schema.org/name',
						portfolio: 'https://schema.org/portfolio',
						evidenceLink: 'https://schema.org/evidenceLink',
						evidenceDescription: 'https://schema.org/evidenceDescription',
						credentialType: 'https://schema.org/credentialType',
					},
					'https://w3id.org/security/suites/ed25519-2020/v1',
				],
				id: 'urn:uuid:518cf21e-89a0-4025-9487-c3a07e4b4350',
				type: ['VerifiableCredential', 'OpenBadgeCredential'],
				issuer: { id: 'did:key:z6MkriggL2cQGLdtEUc6FZzdpgz4wXVPm15UrNrXHwsR9wKu', type: ['Profile'] },
				issuanceDate: '2024-10-04T15:10:21.487Z',
				expirationDate: '2025-12-31T23:59:59Z',
				credentialSubject: {
					type: ['AchievementSubject'],
					name: 'John Doe',
					portfolio: [
						{ name: 'Portfolio 1', url: 'https://example.com/portfolio1' },
						{ name: 'Portfolio 2', url: 'https://example.com/portfolio2' },
					],
					evidenceLink: 'https://example.com/evidence',
					evidenceDescription: 'This is an achievement',
					duration: '1 year',
					credentialType: 'Credential Type',
					achievement: [
						{
							id: 'urn:uuid:994fb091-8da1-4e82-8402-e71f6aa1b21c',
							type: ['Achievement'],
							criteria: { narrative: 'This is a narrative' },
							description: 'This is an achievement',
							image: { id: 'https://example.com/evidence', type: 'Image' },
						},
					],
				},
				proof: {
					type: 'Ed25519Signature2020',
					created: '2024-10-04T15:10:21Z',
					verificationMethod: 'did:key:z6MkriggL2cQGLdtEUc6FZzdpgz4wXVPm15UrNrXHwsR9wKu#z6MkriggL2cQGLdtEUc6FZzdpgz4wXVPm15UrNrXHwsR9wKu',
					proofPurpose: 'assertionMethod',
					proofValue: 'z2S6GDdssLNDwwtsuMnehBh1g1sW91yz2AzYnxgkc3WdUFXWjRefqxeGPhR4xLb7WvsPYr7yrkZkXiP34ArsfJFvA',
				},
			},
			{
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
				id: 'urn:uuid:3a2a1b31-3da2-4557-b473-e2ce27eba8fb',
				type: ['VerifiableCredential', 'https://schema.org/RecommendationCredential'],
				issuer: { id: 'did:key:z6MkriggL2cQGLdtEUc6FZzdpgz4wXVPm15UrNrXHwsR9wKu', type: ['Profile'] },
				issuanceDate: '2024-10-04T15:10:21.538Z',
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
					created: '2024-10-04T15:10:21Z',
					verificationMethod: 'did:key:z6MkriggL2cQGLdtEUc6FZzdpgz4wXVPm15UrNrXHwsR9wKu#z6MkriggL2cQGLdtEUc6FZzdpgz4wXVPm15UrNrXHwsR9wKu',
					proofPurpose: 'assertionMethod',
					proofValue: 'z8hFYSyWm1jJu6RKBrks6YnkYXzz1ShybywvRv4RANoEcmaBxRwyMgQmMMx8RF4EuXh525aDMwZL38bTjpM4FoTB',
				},
			},
		],
		id: 'urn:uuid:4f6ab14b-b2e5-4239-9ea4-5d6dbfe95f69',
		holder: 'did:key:z6MkriggL2cQGLdtEUc6FZzdpgz4wXVPm15UrNrXHwsR9wKu',
		proof: {
			type: 'Ed25519Signature2020',
			created: '2024-10-04T15:59:23Z',
			verificationMethod: 'did:key:z6MkriggL2cQGLdtEUc6FZzdpgz4wXVPm15UrNrXHwsR9wKu#z6MkriggL2cQGLdtEUc6FZzdpgz4wXVPm15UrNrXHwsR9wKu',
			proofPurpose: 'authentication',
			challenge: '',
			proofValue: 'z227SMTxWP86KUJu3P8ANoyQc5Ax7Q92DziXR5Ktmd9auaqysvwuMZvotRsPebZJwFmvPMJ9LVXQiLyzMuMgaVkd9',
		},
	},
};
