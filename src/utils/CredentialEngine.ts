import { driver } from 'did-method-key';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { defaultDocumentLoader, issue } from '@digitalbazaar/vc';
import fs from 'fs';
import path from 'path';
import { StorageContext, StorageFactory } from '../models/StorageContext.js';
import saveToGoogleDrive from './saveToGoogle.js';
import { v4 as uuidv4 } from 'uuid';
import { KeyPair, FormData, Credential, DidDocument } from '../types/Credential.js';

// Load the local context files
const localOBContextPath = path.resolve('contexts/ob-v3p0-context.json');
const localED25519ContextPath = path.resolve('contexts/ed25519-2020-context.json');
let localOBContext, localED25519Context;

try {
	localOBContext = JSON.parse(fs.readFileSync(localOBContextPath, 'utf8'));
	localED25519Context = JSON.parse(fs.readFileSync(localED25519ContextPath, 'utf8'));
} catch (error) {
	console.error('Error loading context files:', error);
	throw error;
}

// Custom document loader
const customDocumentLoader = async (url: string) => {
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

class CredentialEngine {
	private didKeyDriver: any;
	private folderName: string;
	private storage: any;

	/**
	 * Constructor to initialize the DIDManager with access token.
	 * @param {string} accessToken - The access token for Google Drive API.
	 */
	constructor(accessToken: string) {
		this.didKeyDriver = driver();
		this.folderName = 'Credentials'; // Folder to store user credentials
		this.storage = new StorageContext(StorageFactory.getStorageStrategy('googleDrive', { accessToken }));
	}

	/**
	 * Create a DID document using the provided key pair.
	 * @param {object} keyPair - The key pair used to create the DID document.
	 * @returns {Promise<object>} The created DID document.
	 */
	private async createDIDDocument(keyPair: KeyPair): Promise<DidDocument> {
		try {
			const did = `did:key:${keyPair.fingerprint()}`;
			keyPair.controller = did;
			keyPair.id = `${did}#${keyPair.fingerprint()}`;
			keyPair.revoked = false;
			const didDocument = {
				'@context': ['https://www.w3.org/ns/did/v1'],
				id: did,
				publicKey: [
					{
						id: keyPair.id,
						type: 'Ed25519VerificationKey2020',
						controller: did,
						publicKeyMultibase: keyPair.publicKeyMultibase,
					},
				],
				authentication: [keyPair.id],
				assertionMethod: [keyPair.id],
				capabilityDelegation: [keyPair.id],
				capabilityInvocation: [keyPair.id],
				keyAgreement: [
					{
						id: `${did}#${keyPair.fingerprint()}-keyAgreement`,
						type: 'X25519KeyAgreementKey2020',
						controller: did,
						publicKeyMultibase: keyPair.publicKeyMultibase,
					},
				],
			};
			return didDocument;
		} catch (error) {
			console.error('Error creating DID document:', error);
			throw error;
		}
	}

	/**
	 * Create a new DID and save its document to Google Drive.
	 * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
	 * @throws Will throw an error if DID creation fails.
	 */
	public async createDID(): Promise<{ didDocument: DidDocument; keyPair: KeyPair }> {
		try {
			const keyPair = await Ed25519VerificationKey2020.generate();
			keyPair.controller = `did:key:${keyPair.fingerprint()}`;
			keyPair.id = `${keyPair.controller}#${keyPair.fingerprint()}`;
			keyPair.revoked = false;
			const didDocument = await this.createDIDDocument(keyPair);
			console.log('---Uploading DID document with following data---\n', didDocument);
			await saveToGoogleDrive(this.storage, didDocument, 'DID');
			return { didDocument, keyPair };
		} catch (error) {
			console.error('Error creating DID:', error);
			throw error;
		}
	}

	/**
	 * Create an unsigned Verifiable Credential (VC) and save it to Google Drive.
	 * @param {object} formData - The form data to include in the VC.
	 * @param {string} issuerDid - The DID of the issuer.
	 * @returns {Promise<object>} The created unsigned VC.
	 * @throws Will throw an error if unsigned VC creation fails.
	 */
	public async createUnsignedVC(formData: FormData, issuerDid: string): Promise<Credential> {
		try {
			const credential: Credential = {
				'@context': ['https://www.w3.org/2018/credentials/v1', 'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'],
				id: `urn:uuid:${uuidv4()}`, // Add the id property
				type: ['VerifiableCredential', 'OpenBadgeCredential'],
				issuer: {
					id: issuerDid,
					type: ['Profile'],
				},
				issuanceDate: formData.issuanceDate || '2024-01-01T00:00:00Z',
				expirationDate: formData.expirationDate || '2025-01-01T00:00:00Z',
				credentialSubject: {
					type: ['AchievementSubject'],
					name: formData.fullName,
					achievement: [
						{
							id: `urn:uuid:${uuidv4()}`,
							type: ['Achievement'],
							criteria: {
								narrative: formData.criteriaNarrative,
							},
							description: formData.achievementDescription,
							name: formData.achievementName,
							image: formData.imageLink
								? {
										id: formData.imageLink,
										type: 'Image',
								  }
								: undefined,
						},
					],
				},
			};
			console.log('---Uploading Unsigned VC document with following data---\n', credential);
			await saveToGoogleDrive(this.storage, credential, 'UnsignedVC');

			return credential;
		} catch (error) {
			console.error('Error creating unsigned VC:', error);
			throw error;
		}
	}

	/**
	 * Sign a Verifiable Credential (VC) and save it to Google Drive.
	 * @param {object} credential - The credential to sign.
	 * @param {object} keyPair - The key pair to use for signing.
	 * @returns {Promise<object>} The signed VC.
	 * @throws Will throw an error if VC signing fails.
	 */
	public async signVC(credential: Credential, keyPair: KeyPair): Promise<Credential> {
		const suite = new Ed25519Signature2020({ key: keyPair, verificationMethod: keyPair.id });
		try {
			const signedVC = await issue({ credential, suite, documentLoader: customDocumentLoader });
			console.log('---Uploading Signed VC with following Data---\n', signedVC);
			await saveToGoogleDrive(this.storage, signedVC, 'VC');
			return signedVC;
		} catch (error) {
			console.error('Error signing VC:', error);
			throw error;
		}
	}
}

export default CredentialEngine;
