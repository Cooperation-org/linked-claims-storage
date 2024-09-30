import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import {
	KeyPair,
	DidDocument,
	FormDataI,
	RecommendationCredential,
	Credential,
	RecommendationFormDataI,
	VerifiableCredential,
} from '../../types/credential';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a DID document using the provided key pair.
 * @param {object} keyPair - The key pair used to create the DID document.
 * @returns {Promise<object>} The created DID document.
 */
export const generateDIDSchema = async (keyPair: KeyPair): Promise<DidDocument> => {
	try {
		const DID = keyPair.controller;
		const didDocument = {
			'@context': ['https://www.w3.org/ns/did/v1'],
			id: DID,
			publicKey: [
				{
					id: keyPair.id,
					type: 'Ed25519VerificationKey2020',
					controller: DID,
					publicKeyMultibase: keyPair.publicKeyMultibase,
				},
			],
			authentication: [keyPair.id],
			assertionMethod: [keyPair.id],
			capabilityDelegation: [keyPair.id],
			capabilityInvocation: [keyPair.id],
			keyAgreement: [
				{
					id: `${keyPair.id}-keyAgreement`,
					type: 'X25519KeyAgreementKey2020',
					controller: DID,
					publicKeyMultibase: keyPair.publicKeyMultibase,
				},
			],
		};

		return didDocument;
	} catch (error) {
		console.error('Error creating DID document:', error);
		throw error;
	}
};

/**
 * Generate an unsigned Verifiable Credential (VC)
 * @param {object} formData - The form data to include in the VC.
 * @param {string} issuerDid - The DID of the issuer.
 * @returns {Promise<object>} The created unsigned VC.
 * @throws Will throw an error if unsigned VC creation fails.
 */
export function generateUnsignedVC(formData: FormDataI, issuerDid: string): Credential {
	try {
		const issuanceDate = new Date().toISOString();
		if (issuanceDate > formData.expirationDate) throw Error('issuanceDate cannot be after expirationDate');
		const unsignedCredential: Credential = {
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
			],
			id: `urn:uuid:${uuidv4()}`,
			type: ['VerifiableCredential', 'OpenBadgeCredential'],
			issuer: {
				id: issuerDid,
				type: ['Profile'],
			},
			issuanceDate,
			expirationDate: formData.expirationDate,
			credentialSubject: {
				type: ['AchievementSubject'],
				name: formData.fullName,
				portfolio: formData.portfolio,
				evidenceLink: formData.evidenceLink,
				evidenceDescription: formData.achievementDescription,
				duration: formData.duration,
				credentialType: formData.credentialType,
				achievement: [
					{
						id: `urn:uuid:${uuidv4()}`,
						type: ['Achievement'],
						criteria: {
							narrative: formData.criteriaNarrative,
						},
						description: formData.achievementDescription,
						name: formData.achievementName,
						image: formData.evidenceLink
							? {
									id: formData.evidenceLink,
									type: 'Image',
							  }
							: undefined,
					},
				],
			},
		};

		return unsignedCredential;
	} catch (error) {
		console.error('Error creating unsigned VC', error);
		throw error;
	}
}

export function generateUnsignedRecommendation(recommendation: RecommendationFormDataI, issuerDid: string): RecommendationCredential {
	try {
		const issuanceDate = new Date().toISOString();
		if (issuanceDate > recommendation.expirationDate) throw Error('issuanceDate cannot be after expirationDate');

		const unsignedRecommendation: RecommendationCredential = {
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
			],
			id: `urn:uuid:${uuidv4()}`, // Unique identifier for the recommendation
			type: ['VerifiableCredential', 'https://schema.org/RecommendationCredential'], // Use a fully qualified URI for 'RecommendationCredential'
			issuer: {
				id: issuerDid,
				type: ['Profile'],
			},
			issuanceDate,
			expirationDate: recommendation.expirationDate,
			credentialSubject: {
				name: recommendation.fullName,
				howKnow: recommendation.howKnow,
				recommendationText: recommendation.recommendationText,
				qualifications: recommendation.qualifications,
				explainAnswer: recommendation.explainAnswer,
				portfolio: recommendation.portfolio.map((item) => ({
					name: item.name,
					url: item.url,
				})),
			},
		};

		console.log('Successfully created Unsigned Recommendation', unsignedRecommendation);
		return unsignedRecommendation;
	} catch (error) {
		console.error('Error creating unsigned recommendation', error);
		throw error;
	}
}

/**
 * Extracts the keypair from a Verifiable Credential
 * @param {Object} credential - The signed Verifiable Credential
 * @returns {Ed25519VerificationKey2020} keyPair - The generated keypair object
 */
export async function extractKeyPairFromCredential(credential: VerifiableCredential): Promise<KeyPair> {
	const verificationMethod: string = credential.proof.verificationMethod;
	const issuer: string = credential.issuer.id;

	// Example of extracting the public key from the DID fragment (verification method)
	const publicKeyMultibase: string = verificationMethod.split('#')[1];

	// Generate the keypair using Ed25519VerificationKey2020
	const keyPair = await Ed25519VerificationKey2020.from({
		id: verificationMethod,
		controller: issuer,
		publicKeyMultibase: publicKeyMultibase,
	});

	return keyPair;
}
