import {
	createAndSignVerifiablePresentation,
	CredentialEngine,
	GoogleDriveStorage,
	saveToGoogleDrive,
	uploadImageToGoogleDrive,
} from './dist/index.js';

const accessTokenA =
	'ya29.a0AeDClZC35NOgFhg8kz2OzOKpMEAQeNkYydmmYUJLnYwPRAd2PUH0_yWqs2ql2Q8vq67IK4G7ATqOhOvSJlnEgV7t8ClNS9VxGMXgvA9473EutBZC-XXmzDIzC3qHTOI4aB_chVyNWWTaJSjBKc7xamuDBcwgjUKp3WbKLp_faCgYKAawSARESFQHGX2MiJxVd7XC-tzE5L26cvN97IA0175';
const accessTokenB =
	'ya29.a0AeDClZDN11EcRGyqOX-ZPvUYuf25wrMc6eMgy3YTzW8wYsmJFFszGTlx8ejxeFwu0LBt3yT2esDvIKDsKsndkN46A4gGbgAkyj57jbEgudzrNGEqgVOSmQWyUhCUdgt6IvUoIOdy2CabAdp_P6jLApOKoUqOlR6hCFvJaJFHaCgYKAZ8SARESFQHGX2MiIVi7BGA5ec6CVOx5HZwuHQ0175';
const credentialEngine = new CredentialEngine(accessTokenA);

const storageA = new GoogleDriveStorage(accessTokenA); // Used by User A
const storageB = new GoogleDriveStorage(accessTokenB); // Used by User B

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

async function main() {
	try {
		// Step 1: Create DID
		const { didDocument, keyPair } = await credentialEngine.createDID();
		console.log('DID Document:', didDocument);
		console.log('Key Pair:', keyPair);

		// Step 2: Sign VC
		const signedVC = await credentialEngine.signVC(formData, 'VC', keyPair, didDocument.id);
		const file = await saveToGoogleDrive(storageA, signedVC, 'VC');
		console.log('Signed VC saved by User A:', file);

		// Step 3: Grant access to User B and touch the file
		const userBEmail = 'omar.salah1597@gmail.com'; // Replace with User B's actual email
		const permissionGranted = await storageA.touchFileAndGrantPermission(file.id, accessTokenA, userBEmail);
		if (!permissionGranted) {
			throw new Error("Couldn't grant view access to User B");
		}

		// Step 4: User B logs in and retrieves the file for reviewnode
		const retrievedFile = await storageB.retrieve(file.id);
		console.log('File retrieved by User B:', retrievedFile);

		// Step 5: User B uploads recommendation (additional steps as needed)
		const recommendationFormData = {
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

		const signedRecommendationVC = await credentialEngine.signVC(recommendationFormData, 'RECOMMENDATION', keyPair, didDocument.id);
		const savedRecommendation = await saveToGoogleDrive(storageB, signedRecommendationVC, 'RECOMMENDATION');
		console.log('Recommendation saved by User B:', savedRecommendation);

		// Add a comment linking recommendation
		const recommendationLink = await storageA.addCommentToFile(file.id, savedRecommendation.id);
		console.log('Recommendation link added by User A:', recommendationLink);

		// Verification and presentation (if needed)
		await credentialEngine.verifyCredential(signedVC);
		const presentation = await createAndSignVerifiablePresentation(accessTokenA, file.id);
		console.log('Presentation:', JSON.stringify(presentation));
	} catch (error) {
		console.error('Error during the process:', error);
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

const t = {
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
	id: 'urn:uuid:f41c2df7-f2b6-425a-a7fc-2fea74bee9f3',
	type: ['VerifiableCredential', 'OpenBadgeCredential'],
	issuer: {
		id: 'did:key:z6MkpREKDyMn3X5kXpQxpuLRh7UnFVMSxrZGiFqPN52Lx6fG',
		type: ['Profile'],
	},
	issuanceDate: '2024-11-13T18:56:50.528Z',
	expirationDate: '2025-11-13T18:56:50.527Z',
	credentialSubject: {
		type: ['AchievementSubject'],
		name: 'omar salah',
		portfolio: [
			{
				name: 'folder.svg',
				url: 'https://drive.google.com/uc?export=view&id=10QQMTGBFOqWpn6ttGN4j-_rVlaAFcTJA',
			},
			{
				name: 'badge.svg',
				url: 'https://drive.google.com/uc?export=view&id=1zSzRdH7qyPrI--wJ_oLWrH0TpUomkNYG',
			},
		],
		evidenceLink: 'https://drive.google.com/uc?export=view&id=1jAa25oiwynKcHqvqX-BP2bidfc7rWR_m',
		evidenceDescription:
			'SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION ',
		duration: '3 days',
		credentialType: '',
		achievement: [
			{
				id: 'urn:uuid:f11711a8-f766-4dac-ad02-ab87079daeca',
				type: ['Achievement'],
				criteria: {
					narrative:
						'SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL ',
				},
				description:
					'SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION SKILL DESCRIPTION ',
				name: 'Software Developer',
				image: {
					id: 'https://drive.google.com/uc?export=view&id=1jAa25oiwynKcHqvqX-BP2bidfc7rWR_m',
					type: 'Image',
				},
			},
		],
	},
	proof: {
		type: 'Ed25519Signature2020',
		created: '2024-11-13T18:56:50Z',
		verificationMethod: 'did:key:z6MkpREKDyMn3X5kXpQxpuLRh7UnFVMSxrZGiFqPN52Lx6fG#z6MkpREKDyMn3X5kXpQxpuLRh7UnFVMSxrZGiFqPN52Lx6fG',
		proofPurpose: 'assertionMethod',
		proofValue: 'z2GyUbSA7XWKkFsDyc83QegH228iRNiVcvz6yHX86HLRYDxs289jc93QCutQrhv7Bre9YT7WvM4uuDzYbH3nSuLYD',
	},
};
const LOL = {
	'@context': [
		'https://www.w3.org/2018/credentials/v1',
		'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
		{
			duration: 'https://schema.org/duration',
			// 			fullName: 'https://schema.org/name',
			portfolio: 'https://schema.org/portfolio',
			evidenceLink: 'https://schema.org/evidenceLink',
			evidenceDescription: 'https://schema.org/evidenceDescription',
			credentialType: 'https://schema.org/credentialType',
		},
		'https://w3id.org/security/suites/ed25519-2020/v1',
	],
	id: 'urn:uuid:8d111152-c935-4043-a628-2d73b872266c',
	type: ['VerifiableCredential', 'OpenBadgeCredential'],
	issuer: {
		id: 'did:key:z6Mku745r5TVvwKvBXQuyWFi5UpmnUjJ7zZyxfA1ggSTRmmt',
		type: ['Profile'],
	},
	issuanceDate: '2024-11-12T12:29:07.595Z',
	expirationDate: '2025-11-12T12:29:07.594Z',
	credentialSubject: {
		type: ['AchievementSubject'],
		name: 'Omar Salah',
		portfolio: [
			{
				name: 'Light Bulb.png',
				url: 'https://drive.google.com/uc?export=view&id=1LjQrC3Smyh63pwlbmUgg-MvspeD7CFch',
			},
		],
		evidenceLink: 'https://drive.google.com/uc?export=view&id=1F42wPYIZXf8qY_XsXXZlCOCm7riDBzxX',
		evidenceDescription: 'lol',
		duration: 'lol',
		credentialType: '',
		achievement: [
			{
				id: 'urn:uuid:80336490-9237-4997-a832-0be293cb6439',
				type: ['Achievement'],
				criteria: {
					narrative: 'lol',
				},
				description: 'lol',
				name: 'lol',
				image: {
					id: 'https://drive.google.com/uc?export=view&id=1F42wPYIZXf8qY_XsXXZlCOCm7riDBzxX',
					type: 'Image',
				},
			},
		],
	},
	proof: {
		type: 'Ed25519Signature2020',
		created: '2024-11-12T12:29:07Z',
		verificationMethod: 'did:key:z6Mku745r5TVvwKvBXQuyWFi5UpmnUjJ7zZyxfA1ggSTRmmt#z6Mku745r5TVvwKvBXQuyWFi5UpmnUjJ7zZyxfA1ggSTRmmt',
		proofPurpose: 'assertionMethod',
		proofValue: 'z4A5BHa1WKz7xYxJp4T2LeoqBkcZD1h1FxG1PAt6YZxzY8becLVTVtjG199Sw5WeBYYzHekhQXX16Bpc5KkZai8Sm',
	},
};
