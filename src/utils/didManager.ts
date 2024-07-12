import { driver } from 'did-method-key';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { defaultDocumentLoader, issue } from '@digitalbazaar/vc';
import fs from 'fs';
import path from 'path';

// Load the local context files
const localOBContextPath = path.resolve('contexts/ob-v3p0-context.json');
const localED25519ContextPath = path.resolve('contexts/ed25519-2020-context.json');
const localOBContext = JSON.parse(fs.readFileSync(localOBContextPath, 'utf8'));
const localED25519Context = JSON.parse(fs.readFileSync(localED25519ContextPath, 'utf8'));

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

class DIDManager {
	private didKeyDriver: any;
	private folderName: string;

	constructor(accessToken: string) {
		this.didKeyDriver = driver();
		this.folderName = 'Credentials'; // Folder to store user credentials
	}

	private async createDIDDocument(keyPair: any): Promise<any> {
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
	}

	public async createDID(): Promise<any> {
		const keyPair = await Ed25519VerificationKey2020.generate();
		keyPair.controller = `did:key:${keyPair.fingerprint()}`;
		keyPair.id = `${keyPair.controller}#${keyPair.fingerprint()}`;
		keyPair.revoked = false;
		console.log('🚀 ~ main ~ keyPair:', keyPair);
		const didDocument = await this.createDIDDocument(keyPair);
		return { didDocument, keyPair };
	}

	public createUnsignedVCc(formData: any, issuerDid: string): any {
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
			expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
			name: formData.credentialName,
			credentialSubject: {
				id: `urn:uuid:${this.generateUUID()}`,
				type: ['AchievementSubject'],
				name: formData.fullName,
				achievement: formData.evidence.map((evidence: any) => ({
					id: `urn:uuid:${this.generateUUID()}`,
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

	public createUnsignedVC(formData: any, issuerDid: string): any {
		const credential = {
			'@context': ['https://www.w3.org/2018/credentials/v1', 'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'],
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
						id: `urn:uuid:${this.generateUUID()}`,
						type: ['Achievement'],
						criteria: {
							narrative: formData.criteriaNarrative,
						},
						description: formData.achievementDescription,
						name: formData.achievementName,
						image: {
							id: formData.imageLink,
							type: 'Image',
						},
					},
				],
			},
		};
		return credential;
	}

	public async signVC(credential: any, keyPair: any): Promise<any> {
		const suite = new Ed25519Signature2020({ key: keyPair, verificationMethod: keyPair.id });
		try {
			const signedVC = await issue({ credential, suite, documentLoader: customDocumentLoader });
			return signedVC;
		} catch (error) {
			console.error('Error signing VC:', error);
			throw error;
		}
	}

	private generateUUID(): string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			const r = (Math.random() * 16) | 0,
				v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}
}

export default DIDManager;
