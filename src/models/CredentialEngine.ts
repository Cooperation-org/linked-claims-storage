import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import * as vc from '@digitalbazaar/vc';
import { v4 as uuidv4 } from 'uuid';

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

/**
 * Class representing the Credential Engine.
 * @class CredentialEngine
 * @classdesc Credential Engine class to create DIDs and VCs.
 * @method createDID - Create a new DID with Digital Bazaar's Ed25519VerificationKey2020 key pair.
 * @method createWalletDID - Create a new DID with user metamask address as controller.
 * @method signVC - Sign a Verifiable Credential (VC).
 */
export class CredentialEngine {
	private uuid: string;
	private storage: GoogleDriveStorage;

	constructor(accessToken: string) {
		this.uuid = uuidv4();
		this.storage = new GoogleDriveStorage(accessToken);
	}

	private generateKeyPair = async (address?: string) => {
		const keyPair = await Ed25519VerificationKey2020.generate();
		const a = address || keyPair.publicKeyMultibase;
		keyPair.controller = `did:key:${a}`;
		keyPair.id = `${keyPair.controller}#${a}`;
		keyPair.revoked = false;
		return keyPair;
	};
	/**
	 * Create a new DID with Digital Bazaar's Ed25519VerificationKey2020 key pair.
	 * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
	 * @throws Will throw an error if DID creation fails.
	 */
	public async createDID(): Promise<{ didDocument: DidDocument; keyPair: KeyPair }> {
		try {
			const keyPair = await this.generateKeyPair();
			const keyFile = await saveToGoogleDrive(this.storage, keyPair, 'KEYPAIR', this.uuid);
			console.log('🚀 ~ CredentialEngine ~ createDID ~ keyFile:', keyFile);
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
			const keyPair = await this.generateKeyPair(walletrAddress);
			const keyFile = await saveToGoogleDrive(this.storage, keyPair, 'KEYPAIR', this.uuid);
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
	 * @returns {Promise<Credential>} The signed VC.
	 * @throws Will throw an error if VC signing fails.
	 */
	public async signVC(formData: any, type: 'VC' | 'RECOMMENDATION', keyPair: KeyPair, issuerId: string): Promise<any> {
		let credential: any;
		if (type == 'VC') {
			credential = generateUnsignedVC(formData as FormDataI, issuerId, this.uuid);
		} else if (type == 'RECOMMENDATION') {
			credential = generateUnsignedRecommendation(formData as RecommendationFormDataI, issuerId);
		}
		const suite = new Ed25519Signature2020({ key: keyPair, verificationMethod: keyPair.id });
		try {
			const signedVC = await vc.issue({ credential, suite, documentLoader: customDocumentLoader });
			return signedVC;
		} catch (error) {
			console.error('Error signing VC:', error);
			throw error;
		}
	}

	public async verifyCredential(credential: VerifiableCredential): Promise<boolean> {
		try {
			const keyPair = await extractKeyPairFromCredential(credential);

			const suite = new Ed25519Signature2020({
				key: keyPair,
				verificationMethod: keyPair.id,
			});

			const result = await vc.verifyCredential({
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

	private async verifyCreds(creds: VerifiableCredential[]): Promise<boolean> {
		await Promise.all(
			creds.map((cred) => {
				const res = this.verifyCredential(cred);
				if (!res) return false;
			})
		);
		return true;
	}

	public async createPresentation(verifiableCredential: VerifiableCredential[]) {
		try {
			const res = await this.verifyCreds(verifiableCredential);
			if (!res) throw new Error('Some credentials failed verification');
			const id = `urn:uuid:${uuidv4()}`;
			const keyPair = await this.generateKeyPair(); //! delete that and get the one with VC
			console.log('🚀 ~ CredentialEngine ~ createPresentation ~ keyPair:', keyPair);
			const VP = await vc.createPresentation({ verifiableCredential, id, holder: keyPair.controller });
			return VP;
		} catch (error) {
			console.error('Error creating presentation:', error);
			throw error;
		}
	}

	public async signPresentation(presentation: any, keyPair: KeyPair) {
		try {
			// Wrap the keyPair into an Ed25519KeyPair that includes the signer method
			const signingKey = new Ed25519VerificationKey2020({
				id: keyPair.id,
				controller: keyPair.controller,
				type: keyPair.type,
				publicKeyMultibase: keyPair.publicKeyMultibase,
				privateKeyMultibase: keyPair.privateKeyMultibase, // Required for signing
			});

			// Create the Ed25519Signature2020 suite with the wrapped key that includes the signer
			const suite = new Ed25519Signature2020({
				key: signingKey,
				verificationMethod: keyPair.id,
			});

			// Sign the presentation
			const signedVP = await vc.signPresentation({
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
}
