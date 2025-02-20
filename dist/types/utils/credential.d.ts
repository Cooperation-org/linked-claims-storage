import { KeyPair, DidDocument, FormDataI, RecommendationCredential, Credential, RecommendationFormDataI, VerifiableCredential } from '../../types/credential';
/**
 * Create a DID document using the provided key pair.
 * @param {KeyPair} keyPair - The key pair used to create the DID document.
 * @returns {Promise<DidDocument>} The created DID document.
 * @throws Will throw an error if the DID document generation fails.
 */
export declare const generateDIDSchema: (keyPair: KeyPair) => Promise<DidDocument>;
/**
 * Generate an unsigned Verifiable Credential (VC).
 * Hashes the credential to create a unique ID.
 * @param {FormDataI} params
 * @param {string} params.FormData - The form dta to include in the VC.
 * @param {string} params.issuerDid - The DID of the issuer.
 * @returns {Credential} The created unsigned VC.
 * @throws Will throw an error if the VC creation fails or if issuance date exceeds expiration date.
 */
export declare function generateUnsignedVC({ formData, issuerDid }: {
    formData: FormDataI;
    issuerDid: string;
}): Credential;
/**
 * Generate an unsigned Recommendation Credential.
 * Uses the hash of the VC to set the `id` for consistency.
 * @param {object} params
 * @param {VerifiableCredential} params.vc - The Verifiable Credential to base the recommendation on.
 * @param {RecommendationFormDataI} params.recommendation - The recommendation form data.
 * @param {string} params.issuerDid - The DID of the issuer.
 * @returns {RecommendationCredential} The created unsigned Recommendation Credential.
 * @throws Will throw an error if the recommendation creation fails or if issuance date exceeds expiration date.
 */
export declare function generateUnsignedRecommendation({ vcId, recommendation, issuerDid, }: {
    vcId: string;
    recommendation: RecommendationFormDataI;
    issuerDid: string;
}): RecommendationCredential;
/**
 * Extracts the keypair from a Verifiable Credential
 * @param {Object} credential - The signed Verifiable Credential
 * @returns {Ed25519VerificationKey2020} keyPair - The generated keypair object
 */
export declare function extractKeyPairFromCredential(credential: VerifiableCredential): Promise<KeyPair>;
