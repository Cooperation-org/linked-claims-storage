import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { defaultDocumentLoader, issue } from '@digitalbazaar/vc';
import { v4 as uuidv4 } from 'uuid';
import { KeyPair, FormDataI, Credential, DidDocument, RecommendationI, RecommendationCredential } from '../../types/Credential.js';
import { localOBContext, localED25519Context } from '../utils/context.js';
import { generateDIDSchema } from '../utils/did.js';

// Custom document loader
export const customDocumentLoader = async (url: string) => {
	const contextMap = {
		'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json': localOBContext,
		'https://w3id.org/security/suites/ed25519-2020/v1': localED25519Context,
	};

	if (contextMap[url]) {
		return {
			contextUrl: null,
			documentUrl: url,
			document: contextMap[url],
		};
	}
	return defaultDocumentLoader(url); // Fallback to default loader for unknown URLs
};

export class CredentialEngine {
	/**
	 * Create a new DID with Digital Bazaar's Ed25519VerificationKey2020 key pair.
	 * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
	 * @throws Will throw an error if DID creation fails.
	 */
	public async createDID(): Promise<{ didDocument: DidDocument; keyPair: KeyPair }> {
		try {
			const keyPair = await Ed25519VerificationKey2020.generate();
			keyPair.controller = `did:key:${keyPair.publicKeyMultibase}`;
			keyPair.id = `${keyPair.controller}#${keyPair.publicKeyMultibase}`;
			keyPair.revoked = false;

			const didDocument = await generateDIDSchema(keyPair);

			return { didDocument, keyPair };
		} catch (error) {
			console.error('Error creating DID:', error);
			throw error;
		}
	}

	/**
	 * Create a new DID with user metamask address as controller
	 * @param walletrAddress
	 * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
	 * @throws Will throw an error if DID creation fails.
	 */
	public async createWalletDID(walletrAddress: string): Promise<{ didDocument: DidDocument; keyPair: KeyPair }> {
		try {
			const keyPair = await Ed25519VerificationKey2020.generate();
			keyPair.controler = walletrAddress; // Using the MetaMask address as controller
			keyPair.id = `${keyPair.controller}#${keyPair.fingerprint()}`;
			keyPair.revoked = false;
			const didDocument = await generateDIDSchema(keyPair);

			return { didDocument, keyPair };
		} catch (error) {
			console.error('Error creating DID:', error);
			throw error;
		}
	}

	/**
	 * Create an unsigned Verifiable Credential (VC)
	 * @param {object} formData - The form data to include in the VC.
	 * @param {string} issuerDid - The DID of the issuer.
	 * @returns {Promise<object>} The created unsigned VC.
	 * @throws Will throw an error if unsigned VC creation fails.
	 */
	public createUnsignedVC(formData: FormDataI, issuerDid: string): Credential {
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
				id: `urn:uuid:${uuidv4()}`, // Add the id property
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
			console.log('Successfully created Unsigned Credentials', unsignedCredential);

			return unsignedCredential;
		} catch (error) {
			console.error('Error creating unsigned VC', error);
			throw error;
		}
	}

	public createUnsignedRecommendation(recommendation: RecommendationI, issuerDid: string): RecommendationCredential {
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
	 * Sign a Verifiable Credential (VC)
	 * @param {object} credential - The credential to sign.
	 * @param {object} keyPair - The key pair to use for signing.
	 * @returns {Promise<object>} The signed VC.
	 * @throws Will throw an error if VC signing fails.
	 */
	public async signVC(credential: Credential | RecommendationCredential, keyPair: KeyPair): Promise<Credential> {
		const suite = new Ed25519Signature2020({ key: keyPair, verificationMethod: keyPair.id });
		try {
			const signedVC = await issue({ credential, suite, documentLoader: customDocumentLoader });
			console.log('Successfully created Signed VC', signedVC);
			return signedVC;
		} catch (error) {
			console.error('Error signing VC:', error);
			throw error;
		}
	}
}
