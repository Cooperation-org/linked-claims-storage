import {
	createAndSignVerifiablePresentation,
	CredentialEngine,
	GoogleDriveStorage,
	saveToGoogleDrive,
	uploadImageToGoogleDrive,
} from './dist/index.js';

const accessTokenA =
	'ya29.a0AeDClZAE-Smfg9ujAvYwUuk2Ctiop3z2b4rcQQFg8r_C0g6_sJ_g9oZJlm4UWh-zynY9N6F21fqcyoj0wwLdghRZfBKj1N6nqkuEiuTPRYCOSvG04XtXUUaOYvoPh1XghTSPg21UmdYUt_FFObcvb8cp7f4OEmBpHG7sLUNkaCgYKAcISARMSFQHGX2MickRRfmiIA91--D0MoEqioA0175';
const accessTokenB =
	'ya29.a0AeDClZAyeSht1vpfiYzIUkhwKui2_qQ0MSIvwz3GcjAXcEerYouH_zeMgNiKHli4RXYrs_dJJO8v-wANoelNSx79OK7vhijqJTuBd_67-YkWaDB0Q3Vg3AeIW6DycFhvNJj3z6tNN0ZpV7Iqb0LLgzyIXOfGRJaooais1RhSaCgYKAUASARISFQHGX2MideHexcShlVutwVt2UbQjjQ0175';

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
		console.log('1');
		const signedVC = await credentialEngine.signVC({
			data: formData,
			type: 'VC',
			keyPair,
			issuerId: didDocument.id,
		});
		console.log('🚀 ~ main ~ signedVC:', signedVC);
		const file = await saveToGoogleDrive({
			storage: storageA,
			data: signedVC,
			type: 'VC',
		});
		console.log('Signed VC saved by User A:', file);
		console.log('🚀 ~ main ~ signedVC:', signedVC);

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

		const signedRecommendationVC = await credentialEngine.signVC({
			data: recommendationFormData,
			type: 'RECOMMENDATION',
			keyPair,
			issuerId: didDocument.id,
			vcFileId: file.id,
		});
		const savedRecommendation = await saveToGoogleDrive({
			storage: storageB,
			credential: signedRecommendationVC,
			type: 'RECOMMENDATION',
			vcId: file.id,
		});
		console.log('Recommendation saved by User B:', savedRecommendation);

		const permission = await storageB.addAndGrantWritePermissionToRecommender({
			vcFileId: file.id,
			recommendationFileId: savedRecommendation.id,
			userEmail: 'omar.salah.bus@gmail.com',
		});
		console.log('Permission granted:', permission);
	} catch (error) {
		console.error('Error during the process:', error);
	}
}

main().catch(console.error);

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

[
	{
		id: '1gNU_raKtZQWPuq5PxmxF41ocEpB3Mks9',
		name: 'RECOMMENDATION_1730803966600.json',
		content: {
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
			id: 'urn:uuid:3682786e-0342-475f-a77e-231f11840a8c',
			type: ['VerifiableCredential', 'https://schema.org/RecommendationCredential'],
			issuer: { id: 'did:key:z6MkkQbp7hW8fz8YfqJ6vPjQsk7tC29AoN2BDXti6V8cRusz', type: ['Profile'] },
			issuanceDate: '2024-11-05T10:52:41.934Z',
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
				created: '2024-11-05T10:52:41Z',
				verificationMethod: 'did:key:z6MkkQbp7hW8fz8YfqJ6vPjQsk7tC29AoN2BDXti6V8cRusz#z6MkkQbp7hW8fz8YfqJ6vPjQsk7tC29AoN2BDXti6V8cRusz',
				proofPurpose: 'assertionMethod',
				proofValue: 'z4jSqYixMTBGVPQkiXsCuxYyWYktSNEpr9dhqN8dRMFwQgKQr1JdvExxaVGWGWLkcT94FFd5EGJhQkwuPCMRZAsK8',
			},
		},
		comments: [],
	},
	{
		id: '168WxCfTUGlDpVpzlqlLSW2tr4Ut-baBw',
		name: 'RECOMMENDATION_1730802008237.json',
		content: {
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
			id: 'urn:uuid:06da6953-0ec0-4063-9128-953f4f1a8c2c',
			type: ['VerifiableCredential', 'https://schema.org/RecommendationCredential'],
			issuer: { id: 'did:key:z6MkmFABd6SaCUnp29dgudEP4w9FbkypfX9MtXXuq9g26EkL', type: ['Profile'] },
			issuanceDate: '2024-11-05T10:20:03.464Z',
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
				created: '2024-11-05T10:20:03Z',
				verificationMethod: 'did:key:z6MkmFABd6SaCUnp29dgudEP4w9FbkypfX9MtXXuq9g26EkL#z6MkmFABd6SaCUnp29dgudEP4w9FbkypfX9MtXXuq9g26EkL',
				proofPurpose: 'assertionMethod',
				proofValue: 'z4a4w7CUNQwwnRgno5YP6f67fDpcJf1rxhznsPx94JM3pfDRnG6USVzjMq4b7h1uf5hXubvDRNwxWXRfjD9wz6GNF',
			},
		},
		comments: [],
	},
	{
		id: '14CJO68_wmPhA-1-s-eqzlCewIe1XA1F8',
		name: 'RECOMMENDATION_1730801498286.json',
		content: {
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
			id: 'urn:uuid:3c431067-c2a0-47d5-8c34-ac57293d888d',
			type: ['VerifiableCredential', 'https://schema.org/RecommendationCredential'],
			issuer: { id: 'did:key:z6MkvqL2pPuf68yMDcZAMzpw5auYB95We15Pp6G48Qa2QEaA', type: ['Profile'] },
			issuanceDate: '2024-11-05T10:11:32.585Z',
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
				created: '2024-11-05T10:11:32Z',
				verificationMethod: 'did:key:z6MkvqL2pPuf68yMDcZAMzpw5auYB95We15Pp6G48Qa2QEaA#z6MkvqL2pPuf68yMDcZAMzpw5auYB95We15Pp6G48Qa2QEaA',
				proofPurpose: 'assertionMethod',
				proofValue: 'z56yiurXYvQXW4GL9aXuncQ8DJktW4JdCYX1wupcePZsSM93HxEyWqCKmpRD8umC12r2EQux4k98QD2MAY5jB9iS1',
			},
		},
		comments: [],
	},
];
