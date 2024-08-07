import { driver } from 'did-method-key';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { defaultDocumentLoader, issue } from '@digitalbazaar/vc';
import fs from 'fs';
import path from 'path';
import { StorageContext, StorageFactory } from './StorageContext.js';
import { saveToGoogleDrive } from '../utils/saveToGoogle.js';
import { v4 as uuidv4 } from 'uuid';
import { KeyPair, FormData, Credential, DidDocument } from '../../types/Credential.js';
import { localOBContext, localED25519Context } from '../utils/context.js';

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

export class CredentialEngine {
	private didKeyDriver: any;
	private folderName: string;
	private storage: any;

	/**
	 * Constructor to initialize the DIDManager with access token.8
	 * @param {string} accessToken - The access token for Google Drive API.
	 */
	constructor(accessToken: string) {
		this.didKeyDriver = driver();
		this.folderName = 'Credentials';
		this.storage = new StorageContext(StorageFactory.getStorageStrategy('googleDrive', { accessToken }));
	}

	/**
	 * Create a DID document using the provided key pair.
	 * @param {object} keyPair - The key pair used to create the DID document.
	 * @returns {Promise<object>} The created DID document.
	 */
	private async generateDIDSchema(keyPair: KeyPair): Promise<DidDocument> {
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
			const didDocument = await this.generateDIDSchema(keyPair);

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
	public async createUnsignedVC(formData: FormData, issuerDid: string): Promise<Credential> {
		try {
			const issuanceDate = new Date().toISOString();
			if (issuanceDate > formData.expirationDate) throw Error('issuanceDate cannot be after expirationDate');
			const unsignedCredential: Credential = {
				'@context': ['https://www.w3.org/2018/credentials/v1', 'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'],
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
			console.log('Successfully created Unsigned Credentials', unsignedCredential);

			return unsignedCredential;
		} catch (error) {
			console.error('Error creating unsigned VC', error);
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
	public async signVC(credential: Credential, keyPair: KeyPair): Promise<Credential> {
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
/*
{
    "storageOption": "Google Drive",
    "fullName": "Omar Salah",
    "persons": "Individual",
    "credentialName": "dddd",
    "credentialDuration": "dddd",
    "credentialDescription": "<p>dddd</p>",
    "portfolio": [
        {
            "name": "ddddd",
            "url": "dddd"
        }
    ],
    "evidenceLink": "",
    "description": "ddddd"
}*/
