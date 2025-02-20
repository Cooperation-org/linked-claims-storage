import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import * as dbVc from '@digitalbazaar/vc';
import { v4 as uuidv4 } from 'uuid';
import { extractKeyPairFromCredential, generateDIDSchema, generateUnsignedRecommendation, generateUnsignedVC, } from '../utils/credential.js';
import { customDocumentLoader } from '../utils/digitalbazaar.js';
import { saveToGoogleDrive } from '../utils/google.js';
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
    storage;
    keyPair;
    constructor(storage) {
        this.storage = storage;
    }
    async getKeyPair(vc) {
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
        const key = matchingKeyPairFile.content;
        this.keyPair = key;
        return key;
    }
    generateKeyPair = async (address) => {
        const keyPair = await Ed25519VerificationKey2020.generate();
        const a = address || keyPair.publicKeyMultibase;
        keyPair.controller = `did:key:${a}`;
        keyPair.id = `${keyPair.controller}#${a}`;
        keyPair.revoked = false;
        return keyPair;
    };
    async verifyCreds(creds) {
        await Promise.all(creds.map((cred) => {
            const res = this.verifyCredential(cred);
            if (!res)
                return false;
        }));
        return true;
    }
    /**
     * Create a new DID with Digital Bazaar's Ed25519VerificationKey2020 key pair.
     * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
     * @throws Will throw an error if DID creation fails.
     */
    async createDID() {
        try {
            const keyPair = await this.generateKeyPair();
            // const keyFile = await saveToGoogleDrive({
            // 	storage: this.storage,
            // 	data: keyPair,
            // 	type: 'KEYPAIR',
            // });
            const didDocument = await generateDIDSchema(keyPair);
            return { didDocument, keyPair };
        }
        catch (error) {
            console.error('Error creating DID:', error);
            throw error;
        }
    }
    async findKeysAndDIDs() {
        const keyPairs = (await this.storage.getAllFilesByType('KEYPAIRs'));
        const DIDs = (await this.storage.getAllFilesByType('DIDs'));
        if (DIDs.length === 0 || keyPairs.length === 0)
            return null;
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
    async createWalletDID(walletrAddress) {
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
        }
        catch (error) {
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
    async signVC({ data, type, keyPair, issuerId, vcFileId }) {
        let credential = generateUnsignedVC({ formData: data, issuerDid: issuerId });
        if (type == 'RECOMMENDATION' && vcFileId) {
            console.log('WOW');
            credential = generateUnsignedRecommendation({
                vcId: vcFileId,
                recommendation: data,
                issuerDid: issuerId,
            });
        }
        try {
            console.log('🚀 ~ CredentialEngine ~ signVC ~ credential:', credential);
            if (!credential)
                throw new Error('Invalid credential type');
            const suite = new Ed25519Signature2020({ key: keyPair, verificationMethod: keyPair.id });
            console.log('before');
            const signedVC = await dbVc.issue({ credential, suite, documentLoader: customDocumentLoader });
            return signedVC;
        }
        catch (error) {
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
    async verifyCredential(credential) {
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
        }
        catch (error) {
            console.error('Verification failed:', error);
            throw error;
        }
    }
    /**
     * Create a Verifiable Presentation (VP)
     * @param verifiableCredential
     * @returns
     */
    async createPresentation(verifiableCredential) {
        try {
            const res = await this.verifyCreds(verifiableCredential);
            if (!res)
                throw new Error('Some credentials failed verification');
            const id = `urn:uuid:${uuidv4()}`;
            const keyPair = await this.getKeyPair(verifiableCredential[0]);
            console.log('🚀 ~ CredentialEngine ~ createPresentation ~ keyPair:', keyPair);
            const VP = await dbVc.createPresentation({ verifiableCredential, id, holder: keyPair.controller });
            return VP;
        }
        catch (error) {
            console.error('Error creating presentation:', error);
            throw error;
        }
    }
    /**
     * Sign a Verifiable Presentation (VP)
     * @param presentation
     * @returns
     */
    async signPresentation(presentation) {
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
        }
        catch (error) {
            console.error('Error signing presentation:', error);
            throw error;
        }
    }
}
