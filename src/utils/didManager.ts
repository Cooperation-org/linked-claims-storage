import { driver } from 'did-method-key';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { issue } from '@digitalbazaar/vc';
import { StorageContext, StorageFactory } from '../models/StorageContext.js';
import fs from 'fs';
import path from 'path';

// Load the local context files
const localOBContextPath = path.resolve('contexts/ob-v3p0-context.json');
const localED25519ContextPath = path.resolve('contexts/ed25519-2020-context.json');
const localOBContext = JSON.parse(fs.readFileSync(localOBContextPath, 'utf8'));
const localED25519Context = JSON.parse(fs.readFileSync(localED25519ContextPath, 'utf8'));

// Custom document loader
const customDocumentLoader = async (url: string) => {
	const contextMap: { [key: string]: any } = {
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
	return { contextUrl: null, documentUrl: url, document: {} }; // Handle unknown URLs
};

class DIDManager {
	private didKeyDriver: any;
	private storage: StorageContext;
	private folderName: string;

	constructor(accessToken: string) {
		this.didKeyDriver = driver();
		this.storage = new StorageContext(StorageFactory.getStorageStrategy('googleDrive', { accessToken }));
		this.folderName = 'Credentials'; // Folder to store user credentials
	}

	private async saveToGoogleDrive(data: any, type: 'VC' | 'DID', fileName: string = '') {
		const timestamp = Date.now();
		const fileData = {
			fileName: `${fileName}-${type}-${timestamp}.json`,
			mimeType: 'application/json',
			body: JSON.stringify(data),
		};

		// Get all root folders
		const rootFolders = await this.storage.getRootFolders();
		console.log('Root folders:', rootFolders);

		// Find or create the "Credentials" folder
		let credentialsFolder = rootFolders.find((f: any) => f.name === 'Credentials');
		let credentialsFolderId: string;

		if (!credentialsFolder) {
			credentialsFolderId = await this.storage.createFolder('Credentials');
			console.log('Created Credentials folder with ID:', credentialsFolderId);
		} else {
			credentialsFolderId = credentialsFolder.id;
			console.log('Found Credentials folder with ID:', credentialsFolderId);
		}

		// Get subfolders within the "Credentials" folder
		const subfolders = await this.storage.getSubFolders(credentialsFolderId);
		console.log(`Subfolders in Credentials (ID: ${credentialsFolderId}):`, subfolders);

		// Find or create the specific subfolder (DIDs or VCs)
		let typeFolder = subfolders.find((f: any) => f.name === `${type}s`);
		let typeFolderId: string;

		if (!typeFolder) {
			typeFolderId = await this.storage.createFolder(`${type}s`, credentialsFolderId);
			console.log(`Created ${type}s folder with ID:`, typeFolderId);
		} else {
			typeFolderId = typeFolder.id;
			console.log(`Found ${type}s folder with ID:`, typeFolderId);
		}

		// Save the file in the specific subfolder
		const file = await this.storage.save(fileData, typeFolderId);
		console.log(`File uploaded: ${file?.id} under ${type}s with ID ${typeFolderId} folder in Credentials folder`);
	}

	private async createDIDDocument(keyPair: any): Promise<any> {
		const did = `did:key:${keyPair.fingerprint()}`;
		keyPair.controller = did; // Manually set the controller
		keyPair.id = `${did}#${keyPair.fingerprint()}`; // Manually set the id
		keyPair.revoked = false; // Assuming the key is not revoked
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
	}

	public async createDID(): Promise<any> {
		const keyPair = await Ed25519VerificationKey2020.generate();
		keyPair.controller = `did:key:${keyPair.fingerprint()}`;
		keyPair.id = `${keyPair.controller}#${keyPair.fingerprint()}`;
		keyPair.revoked = false; // Ensure revoked property is set if needed
		console.log('🚀 ~ main ~ keyPair:', keyPair); // Log key pair
		const didDocument = await this.createDIDDocument(keyPair);
		// await this.saveToGoogleDrive({ didDocument, keyPair }, 'DID');
		return { didDocument, keyPair };
	}

	public createUnsignedVC(formData: any, issuerDid: string): any {
		const credential = {
			'@context': [
				'https://www.w3.org/2018/credentials/v1',
				'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
				'https://w3id.org/security/suites/ed25519-2020/v1',
			],
			type: ['VerifiableCredential', 'OpenBadgeCredential'],
			issuer: {
				id: issuerDid,
				type: ['Profile'],
			},
			issuanceDate: new Date().toISOString(),
			expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Set expiration date to one year in the future
			name: formData.credentialName,
			credentialSubject: {
				id: `urn:uuid:${this.generateUUID()}`, // Ensure an absolute @id
				type: ['AchievementSubject'],
				name: formData.fullName,
				achievement: formData.evidence.map((evidence: any) => ({
					id: `urn:uuid:${this.generateUUID()}`, // Ensure an absolute @id
					type: ['Achievement'],
					criteria: {
						narrative: evidence.name,
					},
					description: evidence.url,
					name: formData.credentialName,
					image: {
						id: formData.imageLink,
						type: 'Image',
					},
				})),
			},
		};
		return credential;
	}

	public async signVC(credential: any, keyPair: any): Promise<any> {
		const verificationMethod = keyPair.id; // Use the correct id
		const suite = new Ed25519Signature2020({
			key: keyPair,
			verificationMethod: verificationMethod,
		});
		const signedVC = await issue({ credential, suite, documentLoader: customDocumentLoader });
		return signedVC;
	}

	private generateUUID() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			const r = (Math.random() * 16) | 0,
				v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}
}

export default DIDManager;
