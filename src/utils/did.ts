import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { DidDocument, KeyPair } from '../../types/Credential';

/**
 * Create a DID document using the provided key pair.
 * @param {object} keyPair - The key pair used to create the DID document.
 * @returns {Promise<object>} The created DID document.
 */
export const generateDIDSchema = async (keyPair: KeyPair): Promise<DidDocument> => {
	try {
		const DID = keyPair.controller;
		const didDocument = {
			'@context': ['https://www.w3.org/ns/did/v1'],
			id: DID,
			publicKey: [
				{
					id: keyPair.id,
					type: 'Ed25519VerificationKey2020',
					controller: DID,
					publicKeyMultibase: keyPair.publicKeyMultibase,
				},
			],
			authentication: [keyPair.id],
			assertionMethod: [keyPair.id],
			capabilityDelegation: [keyPair.id],
			capabilityInvocation: [keyPair.id],
			keyAgreement: [
				{
					id: `${keyPair.id}-keyAgreement`,
					type: 'X25519KeyAgreementKey2020',
					controller: DID,
					publicKeyMultibase: keyPair.publicKeyMultibase,
				},
			],
		};

		return didDocument;
	} catch (error) {
		console.error('Error creating DID document:', error);
		throw error;
	}
};
