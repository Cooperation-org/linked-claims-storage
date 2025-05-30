import { DidDocument, KeyPair, FormDataI, RecommendationFormDataI, VerifiableCredential } from '../../types/credential.js';
import { GoogleDriveStorage } from './GoogleDriveStorage.js';
interface SignPropsI {
    data: FormDataI | RecommendationFormDataI;
    type: 'VC' | 'RECOMMENDATION';
    keyPair: KeyPair;
    issuerId: string;
    vcFileId?: string;
}
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
export declare class CredentialEngine {
    private storage;
    private keyPair;
    constructor(storage: GoogleDriveStorage);
    private getKeyPair;
    private generateKeyPair;
    private verifyCreds;
    /**
     * Create a new DID with Digital Bazaar's Ed25519VerificationKey2020 key pair.
     * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
     * @throws Will throw an error if DID creation fails.
     */
    createDID(): Promise<{
        didDocument: DidDocument;
        keyPair: KeyPair;
    }>;
    findKeysAndDIDs(): Promise<{
        didDocument: any;
        keyPair: any;
    }>;
    /**
     * Create a new DID with user metamask address as controller
     * @param walletrAddress
     * @returns {Promise<{didDocument: object, keyPair: object}>} The created DID document and key pair.
     * @throws Will throw an error if DID creation fails.
     */
    createWalletDID(walletrAddress: string): Promise<{
        didDocument: DidDocument;
        keyPair: KeyPair;
    }>;
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
    signVC({ data, type, keyPair, issuerId, vcFileId }: SignPropsI): Promise<any>;
    /**
     * Verify a Verifiable Credential (VC)
     * @param {object} credential - The Verifiable Credential to verify.
     * @returns {Promise<boolean>} The verification result.
     * @throws Will throw an error if VC verification fails.
     */
    verifyCredential(credential: VerifiableCredential): Promise<boolean>;
    /**
     * Create a Verifiable Presentation (VP)
     * @param verifiableCredential
     * @returns
     */
    createPresentation(verifiableCredential: VerifiableCredential[]): Promise<any>;
    /**
     * Sign a Verifiable Presentation (VP)
     * @param presentation
     * @returns
     */
    signPresentation(presentation: any): Promise<any>;
    /**
     * Generate and sign an email Verifiable Credential (VC)
     * @param {string} email - The email address to create the VC for
     * @returns {Promise<{signedVC: any, fileId: string}>} The signed VC and its Google Drive file ID
     */
    generateAndSignEmailVC(email: string, encodedSeed: string): Promise<{
        signedVC: any;
        fileId: string;
    }>;
}
export {};
