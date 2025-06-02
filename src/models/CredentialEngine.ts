import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import * as dbVc from '@digitalbazaar/vc';
import { v4 as uuidv4 } from 'uuid';
import { driver as keyDriver } from '@digitalbazaar/did-method-key';

import {
	extractKeyPairFromCredential,
	generateDIDSchema,
	generateUnsignedRecommendation,
	generateUnsignedVC,
} from '../utils/credential.js';
import { customDocumentLoader } from '../utils/digitalbazaar.js';
import { DidDocument, KeyPair, FormDataI, RecommendationFormDataI, VerifiableCredential } from '../../types/credential.js';
import { saveToGoogleDrive } from '../utils/google.js';
import { GoogleDriveStorage } from './GoogleDriveStorage.js';
import { decodeSeed, getDidFromEnvSeed } from '../utils/decodedSeed.js';

interface SignPropsI {
	data: FormDataI | RecommendationFormDataI;
	type: 'VC' | 'RECOMMENDATION';
	keyPair: KeyPair;
	issuerId: string;
	vcFileId?: string;
}

interface EmailVCData {
	email: string;
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Class representing the Credential Engine.
 * @class CredentialEngine
 * @classdesc Credential Engine class to create DIDs and VCs.
 * @method createDID - Create a new DID with Digital Bazaar's Ed25519VerificationKey2020 key pair.
 * @method createWalletDID - Create a new DID with user metamask address as controller.
 * @method signVC - Sign a Verifiable Credential (VC).
 * @method verifyCredential - Verify a Verifiable Credential (VC).
 * @method createPresentation - Create a Verifiable Presentation (VP).
 * @method signPresentation - Sign a Verifiable Presentation (VP).
 */
export class CredentialEngine {
	private storage: GoogleDriveStorage;
	private keyPair: KeyPair;

	constructor(storage: GoogleDriveStorage) {
		this.storage = storage;
	}

	private async getKeyPair(vc: VerifiableCredential) {
		// Fetch all stored key pairs
		const keyPairs = await this.storage.getAllFilesByType('KEYPAIRs');
		if (!keyPairs || keyPairs.length === 0) {
			throw new Error('No key pairs found in storage.');
		}

		// Extract UUID from VC ID
		const vcIdParts = vc.id.split(':');
		if (vcIdParts.length < 3) {
			throw new Error('Invalid Verifiable Credential ID format.');
		}

		const uuidFromVC = vcIdParts[2];

		// Match UUID with key pair files
		const matchingKeyPairFile = keyPairs.find((key) => {
			const [uuidPart] = key.name.split('_');
			return uuidPart === uuidFromVC;
		});

		if (!matchingKeyPairFile) {
			throw new Error('No matching key pair found for the Verifiable Credential ID.');
		}

		// Return the key pair content
		const key = matchingKeyPairFile.content as KeyPair;
		this.keyPair = key;
		return key;
	}
	private generateKeyPair = async (address?: string, seed?: Uint8Array) => {
		// Generate the key pair using the library's method
		const keyPair = seed
			? await (Ed25519VerificationKey2020 as any).generate({
					seed: Buffer.from(seed).toString('hex'),
			  })
			: await Ed25519VerificationKey2020.generate();
		// Configure key pair attributes
		const a = address || keyPair.publicKeyMultibase;
		keyPair.controller = `did:key:${a}`;
		keyPair.id = `${keyPair.controller}#${a}`;
		keyPair.revoked = false;
		// The `signer` is already provided by the `Ed25519VerificationKey2020` instance
		return keyPair;
	};
	private async verifyCreds(creds: VerifiableCredential[]): Promise<boolean> {
		await Promise.all(
			creds.map((cred) => {
				const res = this.verifyCredential(cred);
				if (!res) return false;
			})
		);
		return true;
	}

	/**
	 * Create a new DID with Digital Bazaar's Ed25519VerificationKey2020 key pair.
	 * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
	 * @throws Will throw an error if DID creation fails.
	 */
	public async createDID(): Promise<{ didDocument: DidDocument; keyPair: KeyPair }> {
		try {
			const keyPair = await this.generateKeyPair();
			const didDocument = await generateDIDSchema(keyPair);
			return { didDocument, keyPair };
		} catch (error) {
			console.error('Error creating DID:', error);
			throw error;
		}
	}

	public async findKeysAndDIDs() {
		const keyPairs = (await this.storage.getAllFilesByType('KEYPAIRs')) as any;

		const DIDs = (await this.storage.getAllFilesByType('DIDs')) as any;

		if (DIDs.length === 0 || keyPairs.length === 0) return null;
		const keyPair = keyPairs[0].data;
		const didDocument = DIDs[0].data.didDocument;

		return {
			didDocument,
			keyPair,
		};
	}

	/**
	 * Create a new DID with user metamask address as controller
	 * @param walletrAddress
	 * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
	 * @throws Will throw an error if DID creation fails.
	 */
	public async createWalletDID(walletrAddress: string): Promise<{ didDocument: DidDocument; keyPair: KeyPair }> {
		try {
			const keyPair = await this.generateKeyPair(walletrAddress);
			const keyFile = await saveToGoogleDrive({
				storage: this.storage,
				data: keyPair,
				type: 'KEYPAIR',
			});
			console.log('🚀 ~ CredentialEngine ~ createWalletDID ~ keyFile:', keyFile);
			const didDocument = await generateDIDSchema(keyPair);

			return { didDocument, keyPair };
		} catch (error) {
			console.error('Error creating DID:', error);
			throw error;
		}
	}

	/**
	 * Sign a Verifiable Credential (VC)
	 * @param {'VC' | 'RECOMMENDATION'} type - The signature type.
	 * @param {string} issuerId - The ID of the issuer [currently we put it as the did id]
	 * @param {KeyPair} keyPair - The key pair to use for signing.
	 * @param {FormDataI | RecommendationFormDataI} formData - The form data to include in the VC.
	 * @param {string} VCId - The ID of the credential when the type is RECOMMENDATION
	 * @returns {Promise<Credential>} The signed VC.
	 * @throws Will throw an error if VC signing fails.
	 */
	public async signVC({ data, type, keyPair, issuerId, vcFileId }: SignPropsI): Promise<any> {
		let credential = generateUnsignedVC({ formData: data as FormDataI, issuerDid: issuerId }) as any;
		if (type == 'RECOMMENDATION' && vcFileId) {
			console.log('WOW');

			credential = generateUnsignedRecommendation({
				vcId: vcFileId,
				recommendation: data as unknown as RecommendationFormDataI,
				issuerDid: issuerId,
			});
		}

		try {
			console.log('🚀 ~ CredentialEngine ~ signVC ~ credential:', credential);
			if (!credential) throw new Error('Invalid credential type');
			const suite = new Ed25519Signature2020({ key: keyPair, verificationMethod: keyPair.id });
			console.log('before');
			const signedVC = await dbVc.issue({ credential, suite, documentLoader: customDocumentLoader });
			return signedVC;
		} catch (error) {
			console.error('Error signing VC:', error);
			throw error;
		}
	}

	/**
	 * Verify a Verifiable Credential (VC)
	 * @param {object} credential - The Verifiable Credential to verify.
	 * @returns {Promise<boolean>} The verification result.
	 * @throws Will throw an error if VC verification fails.
	 */
	public async verifyCredential(credential: VerifiableCredential): Promise<boolean> {
		try {
			const keyPair = await extractKeyPairFromCredential(credential);

			const suite = new Ed25519Signature2020({
				key: keyPair,
				verificationMethod: keyPair.id,
			});

			const result = await dbVc.verifyCredential({
				credential,
				suite,
				documentLoader: customDocumentLoader,
			});
			console.log(JSON.stringify(result));

			return result;
		} catch (error) {
			console.error('Verification failed:', error);
			throw error;
		}
	}

	/**
	 * Create a Verifiable Presentation (VP)
	 * @param verifiableCredential
	 * @returns
	 */
	public async createPresentation(verifiableCredential: VerifiableCredential[]) {
		try {
			const res = await this.verifyCreds(verifiableCredential);
			if (!res) throw new Error('Some credentials failed verification');
			const id = `urn:uuid:${uuidv4()}`;
			const keyPair = await this.getKeyPair(verifiableCredential[0]);
			console.log('🚀 ~ CredentialEngine ~ createPresentation ~ keyPair:', keyPair);
			const VP = await dbVc.createPresentation({ verifiableCredential, id, holder: keyPair.controller });
			return VP;
		} catch (error) {
			console.error('Error creating presentation:', error);
			throw error;
		}
	}

	/**
	 * Sign a Verifiable Presentation (VP)
	 * @param presentation
	 * @returns
	 */
	public async signPresentation(presentation: any) {
		try {
			// Wrap the keyPair into an Ed25519VerificationKey2020 that includes the signer method
			const signingKey = new Ed25519VerificationKey2020({
				id: this.keyPair.id,
				controller: this.keyPair.controller,
				type: this.keyPair.type,
				publicKeyMultibase: this.keyPair.publicKeyMultibase,
				privateKeyMultibase: this.keyPair.privateKeyMultibase,
			});

			// Create the Ed25519Signature2020 suite with the wrapped key that includes the signer
			const suite = new Ed25519Signature2020({
				key: signingKey,
				verificationMethod: this.keyPair.id,
			});

			// Sign the presentation
			const signedVP = await dbVc.signPresentation({
				presentation,
				suite,
				documentLoader: customDocumentLoader,
				challenge: '', // Provide the challenge if required
			});

			return signedVP;
		} catch (error) {
			console.error('Error signing presentation:', error);
			throw error;
		}
	}

	/**
	 * Generate and sign an email Verifiable Credential (VC)
	 * @param {string} email - The email address to create the VC for
	 * @returns {Promise<{signedVC: any, fileId: string}>} The signed VC and its Google Drive file ID
	 */
	public async generateAndSignEmailVC(email: string, encodedSeed: string): Promise<{ signedVC: any; fileId: string }> {
		try {
			let keyPair: any;
			let didDocument: any;

			// Check if VC already exists
			const existing = await this.storage.checkEmailExists(email);
			if (existing) {
				return { signedVC: existing.data, fileId: existing.id };
			}

			// Require SEED from environment
			if (!encodedSeed) {
				throw new Error('SEED environment variable not set. Cannot generate or use any DID.');
			}

			// Use deterministic keys from environment seed
			const { getDidFromEnvSeed } = await import('../utils/decodedSeed');
			const result = await getDidFromEnvSeed(encodedSeed);
			keyPair = result.keyPair;
			didDocument = result.didDocument;
			console.log('Using DID from environment seed:', didDocument.id);

			// Ensure the key has proper ID and controller
			if (!keyPair.id || !keyPair.controller) {
				const verificationMethod = didDocument.verificationMethod?.[0] || didDocument.authentication?.[0];
				if (verificationMethod) {
					keyPair.id = typeof verificationMethod === 'string' ? verificationMethod : verificationMethod.id;
					keyPair.controller = didDocument.id;
				}
			}

			console.log('Creating email VC with DID:', didDocument.id);

			// Generate unsigned email VC
			const unsignedCredential = {
				'@context': [
					'https://www.w3.org/2018/credentials/v1',
					{
						email: 'https://schema.org/email',
						EmailCredential: {
							'@id': 'https://example.com/EmailCredential',
						},
					},
				],
				id: `urn:uuid:${uuidv4()}`,
				type: ['VerifiableCredential', 'EmailCredential'],
				issuer: {
					id: didDocument.id,
				},
				issuanceDate: new Date().toISOString(),
				expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
				credentialSubject: {
					id: `did:email:${email}`,
					email: email,
				},
			};

			// Sign the VC
			const suite = new Ed25519Signature2020({
				key: keyPair,
				verificationMethod: keyPair.id,
			});

			const signedVC = await dbVc.issue({
				credential: unsignedCredential,
				suite,
				documentLoader: customDocumentLoader,
			});

			const rootFolders = await this.storage.findFolders();

			// Find or create Credentials folder
			let credentialsFolder = rootFolders.find((f) => f.name === 'Credentials');
			if (!credentialsFolder) {
				credentialsFolder = await this.storage.createFolder({
					folderName: 'Credentials',
					parentFolderId: 'root',
				});
				// Wait and re-check to avoid duplicates
				await delay(1500);
				const refreshedFolders = await this.storage.findFolders();
				const foundAgain = refreshedFolders.find((f) => f.name === 'Credentials');
				if (foundAgain) credentialsFolder = foundAgain;
			}

			// Find or create EMAIL_VC folder
			const subfolders = await this.storage.findFolders(credentialsFolder.id);
			let emailVcFolder = subfolders.find((f) => f.name === 'EMAIL_VC');
			if (!emailVcFolder) {
				emailVcFolder = await this.storage.createFolder({
					folderName: 'EMAIL_VC',
					parentFolderId: credentialsFolder.id,
				});
				// Wait and re-check to avoid duplicates
				await delay(1500);
				const refreshedSubfolders = await this.storage.findFolders(credentialsFolder.id);
				const foundAgain = refreshedSubfolders.find((f) => f.name === 'EMAIL_VC');
				if (foundAgain) emailVcFolder = foundAgain;
			}

			// Save the VC in the EMAIL_VC folder
			const file = await this.storage.saveFile({
				data: {
					fileName: `${email}`,
					mimeType: 'application/json',
					body: signedVC,
				},
				folderId: emailVcFolder.id,
			});

			return { signedVC, fileId: file.id };
		} catch (error) {
			console.error('Error generating and signing email VC:', error);
			throw error;
		}
	}
}
