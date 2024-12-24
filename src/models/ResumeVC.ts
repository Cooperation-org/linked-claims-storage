import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { customDocumentLoader } from '../utils/digitalbazaar';
import { v4 as uuidv4 } from 'uuid';
import * as dbVc from '@digitalbazaar/vc';
import { KeyPair } from '../../types/credential';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { generateDIDSchema } from '../utils/credential';

export class ResumeVC {
	public async sign({ formData, issuerDid, keyPair }: { formData: any; issuerDid: string; keyPair: any }): Promise<any> {
		const unsignedCredential = this.generateUnsignedCredential({ formData, issuerDid });

		// const suite = new Ed25519Signature2020({
		// 	key: keyPair,
		// 	verificationMethod: keyPair.id,
		// });

		// try {
		// 	const signedVC = await dbVc.issue({
		// 		credential: unsignedCredential,
		// 		suite,
		// 		documentLoader: customDocumentLoader, // Use the custom loader
		// 	});
		// 	return signedVC;
		// } catch (error) {
		// 	console.error('Error signing VC:', error);
		// 	throw error;
		// }
		return unsignedCredential;
	}

	private generateUnsignedCredential({ formData, issuerDid }: { formData: any; issuerDid: string }): any {
		const issuanceDate = new Date().toISOString();

		const unsignedCredential = {
			'@context': [
				'https://www.w3.org/2018/credentials/v1', // Ensure this is the first context
				'https://www.w3.org/2018/credentials/v2',
				'https://schema.hropenstandards.org/4.4/context.jsonld',
			],
			id: '', // Will be set dynamically or via hashing
			type: ['VerifiableCredential', 'LERRSCredential'],
			issuer: {
				id: issuerDid,
				type: ['Profile'],
			},
			issuanceDate,
			credentialSubject: {
				type: 'Resume',
				person: {
					name: {
						formattedName: formData.formattedName || '',
					},
					primaryLanguage: formData.primaryLanguage || 'en',
				},
				narrative: {
					text: formData.narrative?.text || '',
				},
				employmentHistory: formData.employmentHistory || [],
				skills: formData.skills || [],
				educationAndLearning: formData.educationAndLearning || {},
			},
		};

		// Generate the hashed ID or set UUID dynamically
		unsignedCredential.id = `urn:uuid:${uuidv4()}`;

		return unsignedCredential;
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
	public async createDID(): Promise<{ didDocument: any; keyPair: KeyPair }> {
		try {
			const keyPair = await this.generateKeyPair();
			const didDocument = await generateDIDSchema(keyPair);

			return { didDocument, keyPair };
		} catch (error) {
			console.error('Error creating DID:', error);
			throw error;
		}
	}
}
