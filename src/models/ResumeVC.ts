import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { customDocumentLoader } from '../utils/digitalbazaar.js';
import { v4 as uuidv4 } from 'uuid';
import * as dbVc from '@digitalbazaar/vc';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { generateDIDSchema } from '../utils/credential.js';
import { inlineResumeContext } from '../utils/context.js';

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
				suite,
				documentLoader: customDocumentLoader,
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

	public generateUnsignedCredential({ formData, issuerDid }: { formData: any; issuerDid: string }): any {
		const unsignedResumeVC = {
			'@context': [
				'https://www.w3.org/2018/credentials/v1',
				'https://schema.hropenstandards.org/4.4/context.jsonld',
				inlineResumeContext['@context'], // Inline context
			],
			id: `urn:uuid:${uuidv4()}`, // Generate a unique UUID
			type: ['VerifiableCredential', 'LERRSCredential'], // LER-RS compliant credential type
			issuer: issuerDid,
			issuanceDate: new Date().toISOString(), // Current date/time in ISO format
			credentialSubject: {
				type: 'Resume',
				person: {
					name: {
						formattedName: formData.formattedName || '',
					},
					primaryLanguage: formData.primaryLanguage || 'en',
				},
				narrative: {
					text: formData.narrative || 'Narrative text goes here',
				},
				employmentHistory: formData.employmentHistory || [],
				skills: formData.skills || [],
				educationAndLearning: formData.educationAndLearning || {},
			},
		};

		return unsignedResumeVC;
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
