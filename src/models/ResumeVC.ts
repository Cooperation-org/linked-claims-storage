import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { customDocumentLoader } from '../utils/digitalbazaar';
import { v4 as uuidv4 } from 'uuid';
import * as dbVc from '@digitalbazaar/vc';
import { KeyPair } from '../../types/credential';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { generateDIDSchema } from '../utils/credential';
import { inlineResumeContext } from '../utils/context';

export class ResumeVC {
	public async sign({ formData, issuerDid, keyPair }: { formData: any; issuerDid: string; keyPair: any }): Promise<any> {
		const unsignedCredential = this.generateUnsignedCredential({ formData, issuerDid });

		const suite = new Ed25519Signature2020({
			key: new Ed25519VerificationKey2020(keyPair), // Ensure proper initialization
			verificationMethod: keyPair.id,
		});

		try {
			const signedVC = await dbVc.issue({
				credential: unsignedCredential,
				suite, // Your signing suite
				documentLoader: customDocumentLoader, // If using one
			});
			console.log('Signed VC:', signedVC);
		} catch (error) {
			console.error('Error signing VC:', error.message);
			if (error.details) {
				console.error('Error details:', JSON.stringify(error.details, null, 2));
			}
			throw error;
		}

		return unsignedCredential;
	}

	private generateUnsignedCredential({ formData, issuerDid }: { formData: any; issuerDid: string }): any {
		const unsignedCredential = {
			'@context': [
				'https://www.w3.org/2018/credentials/v1', // Standard VC context
				inlineResumeContext['@context'], // Inline context
			],
			id: `urn:uuid:${uuidv4()}`, // Generate a dynamic UUID
			type: ['VerifiableCredential'],
			issuer: issuerDid,
			issuanceDate: new Date().toISOString(),
			credentialSubject: {
				type: 'Resume',
				person: {
					name: {
						formattedName: formData.formattedName,
					},
					primaryLanguage: formData.primaryLanguage,
				},
				narrative: formData.narrative,
				employmentHistory: formData.employmentHistory,
				skills: formData.skills,
				educationAndLearning: formData.educationAndLearning,
			},
		};

		return unsignedCredential;
	}

	public generateKeyPair = async (address?: string) => {
		// Generate the key pair using the library's method
		const keyPair = await Ed25519VerificationKey2020.generate();

		// Configure key pair attributes
		const a = address || keyPair.publicKeyMultibase;
		keyPair.controller = `did:key:${a}`;
		keyPair.id = `${keyPair.controller}#${a}`;
		keyPair.revoked = false;

		// The `signer` is already provided by the `Ed25519VerificationKey2020` instance
		return keyPair;
	};

	/**
	 * Create a new DID with Digital Bazaar's Ed25519VerificationKey2020 key pair.
	 * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
	 * @throws Will throw an error if DID creation fails.
	 */
	public async createDID({ keyPair }) {
		try {
			const didDocument = await generateDIDSchema(keyPair);

			return didDocument;
		} catch (error) {
			console.error('Error creating DID:', error);
			throw error;
		}
	}
}
